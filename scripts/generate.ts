import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GeminiAdapter, LLMAdapter } from '../src/engine/llm';
import { Puzzle } from '../src/data/puzzle';
import { validatePuzzleDetailed } from '../src/engine/validator';

export function computeCodeHash(code: string): string {
  const normalized = code.replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function compilePrompt(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const language = getArg('language', 'python');
  const difficulty = parseInt(getArg('difficulty', '2'), 10);
  const topic = getArg('topic', 'Lists');
  const totalCount = parseInt(getArg('count', '5'), 10);

  console.log(`Starting AI Puzzle Generation:`);
  console.log(`  Language: ${language} | Difficulty: ${difficulty} | Topic: ${topic} | Target Count: ${totalCount}\n`);

  const promptTemplatePath = path.resolve('docs/generator-prompt.md');
  if (!fs.existsSync(promptTemplatePath)) {
    console.error(`Prompt template file missing at ${promptTemplatePath}`);
    process.exit(1);
  }
  const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf-8');

  const puzzlesJsonPath = path.resolve('src/data/puzzles.json');
  let existingPuzzles: Puzzle[] = [];
  if (fs.existsSync(puzzlesJsonPath)) {
    try {
      existingPuzzles = JSON.parse(fs.readFileSync(puzzlesJsonPath, 'utf-8'));
    } catch {}
  }

  const existingHashes = new Set<string>(existingPuzzles.map((p) => computeCodeHash(p.buggyCode)));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const adapter: LLMAdapter = new GeminiAdapter(apiKey);

  let acceptedCount = 0;
  let rejectedCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const BATCH_SIZE = 5;

  for (let batchStart = 0; batchStart < totalCount; batchStart += BATCH_SIZE) {
    const currentBatchCount = Math.min(BATCH_SIZE, totalCount - batchStart);
    console.log(`--- Processing Batch (${batchStart + 1} to ${batchStart + currentBatchCount} of ${totalCount}) ---`);

    for (let i = 0; i < currentBatchCount; i++) {
      const itemIndex = batchStart + i + 1;
      let success = false;
      let feedback = '';

      const basePrompt = compilePrompt(promptTemplate, {
        language,
        difficulty: String(difficulty),
        topic,
        bugType: 'Logic Bug',
        theme: 'Online Store / Game Score Tracker',
        size: '10',
      });

      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`[Puzzle #${itemIndex}] Generation attempt ${attempt}/3...`);
        const fullPrompt = feedback ? `${basePrompt}\n\nPREVIOUS ATTEMPT FAILED VALIDATION:\n${feedback}\nFix these issues!` : basePrompt;

        try {
          const res = await adapter.generate(fullPrompt);
          if (res.tokensUsed) {
            totalInputTokens += res.tokensUsed.inputTokens;
            totalOutputTokens += res.tokensUsed.outputTokens;
            console.log(`   Tokens: in=${res.tokensUsed.inputTokens}, out=${res.tokensUsed.outputTokens}`);
          }

          const jsonMatch = res.text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            feedback = 'Output was not valid JSON.';
            continue;
          }

          const candidateObj = JSON.parse(jsonMatch[0]);
          const validation = await validatePuzzleDetailed(candidateObj);

          if (validation.valid) {
            const candidatePuzzle = candidateObj as Puzzle;
            const codeHash = computeCodeHash(candidatePuzzle.buggyCode);

            if (existingHashes.has(codeHash)) {
              console.log(`   ✕ Rejected: Duplicate buggyCode detected.`);
              feedback = 'Duplicate puzzle generated. Create a distinct problem.';
              continue;
            }

            candidatePuzzle.validated = true;
            existingPuzzles.push(candidatePuzzle);
            existingHashes.add(codeHash);
            acceptedCount++;
            success = true;
            console.log(`   ✓ ACCEPTED: "${candidatePuzzle.title}"`);
            break;
          } else {
            const failureReasons = validation.checks.filter((c) => !c.passed).map((c) => c.reason).join('; ');
            console.log(`   ✕ Validation failed: ${failureReasons}`);
            feedback = failureReasons;
          }
        } catch (err) {
          console.error(`   ✕ Attempt error:`, err instanceof Error ? err.message : err);
          feedback = err instanceof Error ? err.message : String(err);
        }
      }

      if (!success) {
        rejectedCount++;
      }
    }

    // Save batch progress to src/data/puzzles.json
    fs.writeFileSync(puzzlesJsonPath, JSON.stringify(existingPuzzles, null, 2), 'utf-8');
  }

  console.log(`\n==================================================`);
  console.log(`AI GENERATION SUMMARY REPORT:`);
  console.log(`  Accepted Puzzles: ${acceptedCount}`);
  console.log(`  Rejected Puzzles: ${rejectedCount}`);
  console.log(`  Total Tokens Used: ${totalInputTokens + totalOutputTokens} (Input: ${totalInputTokens}, Output: ${totalOutputTokens})`);
  console.log(`==================================================\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('Fatal generator script error:', err);
    process.exit(1);
  });
}
