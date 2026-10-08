import fs from 'fs';
import path from 'path';
import { validatePuzzleDetailed } from '../src/engine/validator';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx tsx scripts/validate.ts <path-to-puzzle.json>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(absolutePath, 'utf-8');
  let data: unknown;
  try {
    data = JSON.parse(rawContent);
  } catch (err) {
    console.error(`Invalid JSON file content in ${filePath}:`, err);
    process.exit(1);
  }

  const puzzleList = Array.isArray(data) ? data : [data];
  console.log(`Validating ${puzzleList.length} puzzle(s) from ${filePath}...\n`);

  let allValid = true;

  for (let idx = 0; idx < puzzleList.length; idx++) {
    const candidate = puzzleList[idx];
    const result = await validatePuzzleDetailed(candidate);
    const puzzleName = candidate?.title || candidate?.id || `Puzzle #${idx + 1}`;

    console.log(`--------------------------------------------------`);
    console.log(`Puzzle: ${puzzleName}`);
    console.log(`Status: ${result.valid ? 'VALID ✓' : 'INVALID ✕'}`);
    console.log(`Checks:`);

    result.checks.forEach((check) => {
      const symbol = check.passed ? '✓' : '✕';
      console.log(`  [${symbol}] ${check.name} (${check.checkId}): ${check.reason}`);
    });

    if (!result.valid) {
      allValid = false;
    }
  }

  console.log(`--------------------------------------------------`);
  if (allValid) {
    console.log(`SUCCESS: All puzzles passed fairness validation.`);
    process.exit(0);
  } else {
    console.error(`FAILURE: One or more puzzles failed validation rules.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Validation script error:', err);
  process.exit(1);
});
