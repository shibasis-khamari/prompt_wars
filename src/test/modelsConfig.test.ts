import { describe, it, expect } from 'vitest';
import { GENERATOR_MODEL_ID } from '../config/models';

describe('Rule 10: Model Config Constant', () => {
  it('defines the generator model ID as gemini-3.6-flash in models.ts', () => {
    expect(GENERATOR_MODEL_ID).toBe('gemini-3.6-flash');
  });
});
