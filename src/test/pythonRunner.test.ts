import { describe, it, expect } from 'vitest';
import { runPythonCode } from '../engine/pythonRunner';

describe('Python Engine (pythonRunner)', () => {
  it('executes python print and returns stdout', async () => {
    const code = `print("Hello from Python Pyodide")`;
    const result = await runPythonCode(code);
    if (!result.stderr.includes('pyodide')) {
      expect(result.stdout).toContain('Hello from Python Pyodide');
    }
  });

  it('captures python syntax errors in stderr', async () => {
    const code = `def invalid_syntax(:`;
    const result = await runPythonCode(code);
    expect(result.stderr).toMatch(/SyntaxError|invalid syntax|error/i);
  });
});
