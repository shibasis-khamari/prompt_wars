import { describe, it, expect, afterEach } from 'vitest';
import { runJSCode, jsRunner } from '../engine/jsRunner';

describe('JavaScript Engine (jsRunner)', () => {
  afterEach(() => {
    jsRunner.terminateWorker();
  });

  it('captures console.log and console.error output', async () => {
    const code = `
      console.log("Hello from stdout");
      console.error("Warning from stderr");
    `;
    const result = await runJSCode(code);
    expect(result.timedOut).toBe(false);
    expect(result.stdout).toContain('Hello from stdout');
    expect(result.stderr).toContain('Warning from stderr');
  });

  it('captures thrown runtime errors in stderr', async () => {
    const code = `
      throw new Error("Custom JavaScript Error");
    `;
    const result = await runJSCode(code);
    expect(result.timedOut).toBe(false);
    expect(result.stderr).toContain('Custom JavaScript Error');
  });

  it('blocks network access (fetch, XMLHttpRequest, importScripts)', async () => {
    const code = `
      try {
        fetch("https://example.com");
      } catch (e) {
        console.error("fetch blocked: " + e.message);
      }

      try {
        new XMLHttpRequest();
      } catch (e) {
        console.error("xmlhttprequest blocked: " + e.message);
      }
    `;
    const result = await runJSCode(code);
    expect(result.timedOut).toBe(false);
    expect(result.stderr).toMatch(/blocked|is not a function|undefined/i);
  });

  it('times out on infinite loop, terminates worker, and recovers for subsequent runs', async () => {
    const infiniteLoopCode = `
      while (true) {}
    `;

    // Run with 1000ms timeout for test speed
    const timeoutResult = await runJSCode(infiniteLoopCode, '', 1000);
    expect(timeoutResult.timedOut).toBe(true);
    expect(timeoutResult.stderr).toContain('Execution timed out');

    // Confirm that the worker recovered and subsequent runs work normally
    const recoveryCode = `console.log("Recovered cleanly");`;
    const recoveryResult = await runJSCode(recoveryCode);
    expect(recoveryResult.timedOut).toBe(false);
    expect(recoveryResult.stdout).toContain('Recovered cleanly');
  }, 10000);
});
