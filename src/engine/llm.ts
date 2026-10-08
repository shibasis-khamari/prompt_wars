import { GENERATOR_MODEL_ID } from '../config/models';

export interface LLMTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  text: string;
  tokensUsed?: LLMTokenUsage;
}

export interface LLMAdapter {
  generate(prompt: string): Promise<LLMResponse>;
}

export class GeminiAdapter implements LLMAdapter {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey?: string, modelId: string = GENERATOR_MODEL_ID) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.modelId = modelId;
  }

  async generate(prompt: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`;

    let attempts = 0;
    let delayMs = 1000;

    while (attempts < 4) {
      attempts++;
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (response.status === 429) {
          console.warn(`HTTP 429 Rate Limit encountered. Retrying in ${delayMs}ms (attempt ${attempts}/4)...`);
          await new Promise((r) => setTimeout(r, delayMs));
          delayMs *= 2;
          continue;
        }

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usage = data.usageMetadata;

        const tokensUsed: LLMTokenUsage = {
          inputTokens: usage?.promptTokenCount || 0,
          outputTokens: usage?.candidatesTokenCount || 0,
          totalTokens: usage?.totalTokenCount || 0,
        };

        return {
          text: candidateText,
          tokensUsed,
        };
      } catch (err) {
        if (attempts >= 4) throw err;
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
      }
    }

    throw new Error('Max retries exceeded for Gemini API call.');
  }
}
