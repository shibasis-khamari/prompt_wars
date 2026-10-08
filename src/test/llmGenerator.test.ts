import { describe, it, expect } from 'vitest';
import { compilePrompt, computeCodeHash } from '../../scripts/generate';

describe('LLM Puzzle Generator Helper Unit Tests', () => {
  it('compiles prompt templates with string variables', () => {
    const template = 'Create a {language} puzzle on {topic} with difficulty {difficulty}.';
    const compiled = compilePrompt(template, {
      language: 'python',
      topic: 'Lists',
      difficulty: '2',
    });

    expect(compiled).toBe('Create a python puzzle on Lists with difficulty 2.');
  });

  it('computes consistent code hashes regardless of whitespace differences', () => {
    const code1 = 'function solution(x) {\n  return x + 1;\n}';
    const code2 = 'function   solution(x)   {  return x + 1; }';

    const hash1 = computeCodeHash(code1);
    const hash2 = computeCodeHash(code2);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });
});
