export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

const DEFAULT_TIMEOUT_MS = 3000;

export interface ProgressCallback {
  (percent: number, stage: string): void;
}

// In-browser Web Worker Pyodide loader script
const PYTHON_WORKER_SCRIPT = `
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

let pyodide = null;

async function init() {
  self.postMessage({ type: 'progress', percent: 20, stage: 'Loading Pyodide core...' });
  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
  });
  self.postMessage({ type: 'progress', percent: 100, stage: 'Pyodide ready' });
  self.postMessage({ type: 'ready' });
}

init().catch(err => {
  self.postMessage({ type: 'error', error: String(err) });
});

self.onmessage = async function(e) {
  const { code, stdin } = e.data || {};
  if (!pyodide) return;

  const start = performance.now();
  try {
    const setupPython = \`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
if stdin_data:
    sys.stdin = io.StringIO(stdin_data)
\`;
    pyodide.globals.set('stdin_data', stdin || '');
    await pyodide.runPythonAsync(setupPython);
    await pyodide.runPythonAsync(code);

    const [stdout, stderr] = await pyodide.runPythonAsync('(sys.stdout.getvalue(), sys.stderr.getvalue())');
    const durationMs = performance.now() - start;

    self.postMessage({ type: 'result', stdout, stderr, durationMs });
  } catch (err) {
    const durationMs = performance.now() - start;
    self.postMessage({
      type: 'result',
      stdout: '',
      stderr: (err && err.message ? err.message : String(err)) + '\\n',
      durationMs
    });
  }
};
`;

export interface PythonLoadingState {
  isLoading: boolean;
  percent: number;
  stage: string;
}

export type PythonLoadingListener = (state: PythonLoadingState) => void;

class PythonRunner {
  private worker: Worker | null = null;
  private isReady = false;
  private loadingState: PythonLoadingState = {
    isLoading: false,
    percent: 0,
    stage: 'Idle',
  };
  private loadingListeners = new Set<PythonLoadingListener>();

  public getLoadingState(): PythonLoadingState {
    return { ...this.loadingState };
  }

  public subscribeLoading(listener: PythonLoadingListener): () => void {
    this.loadingListeners.add(listener);
    listener(this.getLoadingState());
    return () => this.loadingListeners.delete(listener);
  }

  private notifyLoading(state: PythonLoadingState): void {
    this.loadingState = state;
    for (const listener of this.loadingListeners) {
      listener({ ...state });
    }
  }

  public async init(onProgress?: ProgressCallback): Promise<void> {
    if (this.isReady) {
      this.notifyLoading({ isLoading: false, percent: 100, stage: 'Pyodide ready' });
      return;
    }
    if (typeof window === 'undefined' || typeof Worker === 'undefined') return;

    this.notifyLoading({ isLoading: true, percent: 10, stage: 'Connecting to CDN (~10 MB)...' });

    return new Promise((resolve, reject) => {
      try {
        if (!this.worker) {
          const blob = new Blob([PYTHON_WORKER_SCRIPT], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          this.worker = new Worker(blobUrl);
        }

        this.worker.onmessage = (event: MessageEvent) => {
          const { type, percent, stage, error } = event.data || {};
          if (type === 'progress') {
            this.notifyLoading({ isLoading: true, percent: percent ?? 50, stage: stage || 'Downloading Pyodide core...' });
            if (onProgress) onProgress(percent, stage);
          } else if (type === 'ready') {
            this.isReady = true;
            this.notifyLoading({ isLoading: false, percent: 100, stage: 'Pyodide ready' });
            resolve();
          } else if (type === 'error') {
            this.notifyLoading({ isLoading: false, percent: 0, stage: 'Failed to load Pyodide' });
            reject(new Error(error || 'Failed to initialize Pyodide worker'));
          }
        };

        this.worker.onerror = (err) => {
          this.notifyLoading({ isLoading: false, percent: 0, stage: 'Worker error during init' });
          reject(new Error(err.message || 'Worker error during init'));
        };
      } catch (e) {
        this.notifyLoading({ isLoading: false, percent: 0, stage: 'Initialization error' });
        reject(e);
      }
    });
  }

  public terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }

  public async run(
    code: string,
    stdin: string = '',
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onProgress?: ProgressCallback
  ): Promise<PythonExecutionResult> {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return this.runNodeFallback(code, stdin, timeoutMs);
    }

    if (!this.isReady) {
      await this.init(onProgress);
    }

    return new Promise((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      timer = setTimeout(() => {
        cleanup();
        this.terminateWorker();
        resolve({
          stdout: '',
          stderr: `Execution timed out after ${timeoutMs}ms.`,
          timedOut: true,
          durationMs: timeoutMs,
        });
      }, timeoutMs);

      if (this.worker) {
        this.worker.onmessage = (event: MessageEvent) => {
          if (event.data?.type === 'result') {
            cleanup();
            const { stdout, stderr, durationMs } = event.data;
            resolve({
              stdout: stdout || '',
              stderr: stderr || '',
              timedOut: false,
              durationMs: durationMs || 0,
            });
          }
        };

        this.worker.postMessage({ code, stdin });
      } else {
        cleanup();
        resolve({
          stdout: '',
          stderr: 'Pyodide worker unavailable',
          timedOut: false,
          durationMs: 0,
        });
      }
    });
  }

  private async runNodeFallback(code: string, _stdin: string, timeoutMs: number): Promise<PythonExecutionResult> {
    const start = performance.now();
    try {
      const childProcess = eval("require('child_process')");
      const output = childProcess.execSync('python -', {
        input: code,
        timeout: timeoutMs,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      return {
        stdout: output || '',
        stderr: '',
        timedOut: false,
        durationMs: performance.now() - start,
      };
    } catch (err: any) {
      const isTimeout = err.code === 'ETIMEDOUT';
      return {
        stdout: err.stdout ? String(err.stdout) : '',
        stderr: err.stderr ? String(err.stderr) : err.message || 'Python execution error',
        timedOut: isTimeout,
        durationMs: performance.now() - start,
      };
    }
  }
}

export const pythonRunner = new PythonRunner();

export async function runPythonCode(
  code: string,
  stdin: string = '',
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  onProgress?: ProgressCallback
): Promise<PythonExecutionResult> {
  return pythonRunner.run(code, stdin, timeoutMs, onProgress);
}
