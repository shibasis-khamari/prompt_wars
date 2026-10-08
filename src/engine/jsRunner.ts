export interface ExecutionResult {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

const DEFAULT_TIMEOUT_MS = 3000;

const WORKER_SCRIPT = `
self.onmessage = function(event) {
  var data = event.data || {};
  var code = data.code || '';
  var stdout = '';
  var stderr = '';

  // Disable network access and import scripts
  self.fetch = undefined;
  self.XMLHttpRequest = undefined;
  self.importScripts = undefined;

  var customConsole = {
    log: function() {
      var args = Array.prototype.slice.call(arguments);
      stdout += args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') + '\\n';
    },
    error: function() {
      var args = Array.prototype.slice.call(arguments);
      stderr += args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') + '\\n';
    },
    warn: function() {
      var args = Array.prototype.slice.call(arguments);
      stderr += args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') + '\\n';
    },
    info: function() {
      var args = Array.prototype.slice.call(arguments);
      stdout += args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') + '\\n';
    }
  };

  var start = performance.now();
  try {
    var runner = new Function('console', 'fetch', 'XMLHttpRequest', 'importScripts', code);
    runner(customConsole, undefined, undefined, undefined);
  } catch (err) {
    stderr += (err && err.message ? err.message : String(err)) + '\\n';
  }
  var durationMs = performance.now() - start;

  self.postMessage({ stdout: stdout, stderr: stderr, durationMs: durationMs });
};
`;

const NODE_WORKER_CODE = `
const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
  const code = data.code || '';
  let stdout = '';
  let stderr = '';

  const customConsole = {
    log: (...args) => {
      stdout += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\\n';
    },
    error: (...args) => {
      stderr += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\\n';
    },
    warn: (...args) => {
      stderr += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\\n';
    },
    info: (...args) => {
      stdout += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\\n';
    },
  };

  const start = performance.now();
  try {
    const runner = new Function('console', 'fetch', 'XMLHttpRequest', 'importScripts', code);
    runner(customConsole, undefined, undefined, undefined);
  } catch (err) {
    stderr += (err && err.message ? err.message : String(err)) + '\\n';
  }
  const durationMs = performance.now() - start;

  parentPort.postMessage({ stdout, stderr, durationMs });
});
`;

interface StandardWorker {
  postMessage(data: any): void;
  terminate(): void;
  onmessage?: ((event: any) => void) | null;
  onerror?: ((event: any) => void) | null;
}

class JSRunner {
  private worker: StandardWorker | null = null;

  private createWorker(): StandardWorker | null {
    // Browser environment with Worker & URL.createObjectURL support
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        return new Worker(blobUrl);
      } catch (e) {}
    }

function loadNodeModule<T = any>(moduleName: string): T | null {
  if (typeof process !== 'undefined') {
    if (typeof (process as any).getBuiltinModule === 'function') {
      try {
        return (process as any).getBuiltinModule(moduleName) as T;
      } catch {}
    }
    try {
      const req = (globalThis as any).require;
      if (typeof req === 'function') return req(moduleName) as T;
    } catch {}
  }
  return null;
}

    // Node.js environment (Vitest test environment)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        // Dynamically load node:worker_threads in Node environments without eval
        const workerThreads = loadNodeModule<any>('worker_threads');
        if (!workerThreads) return null;
        const nodeWorker = new workerThreads.Worker(NODE_WORKER_CODE, { eval: true });
        
        // Wrap node worker to implement web Worker interface
        const wrappedWorker: StandardWorker = {
          postMessage: (data) => nodeWorker.postMessage(data),
          terminate: () => nodeWorker.terminate(),
          set onmessage(fn: ((event: any) => void) | null) {
            nodeWorker.removeAllListeners('message');
            if (fn) nodeWorker.on('message', (data: any) => fn({ data }));
          },
          set onerror(fn: ((event: any) => void) | null) {
            nodeWorker.removeAllListeners('error');
            if (fn) nodeWorker.on('error', (err: any) => fn({ message: err.message }));
          },
        };
        return wrappedWorker;
      } catch (e) {}
    }

    return null;
  }

  private getOrCreateWorker(): StandardWorker | null {
    if (!this.worker) {
      this.worker = this.createWorker();
    }
    return this.worker;
  }

  public terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  public async run(code: string, _stdin: string = '', timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ExecutionResult> {
    const worker = this.getOrCreateWorker();

    if (!worker) {
      return {
        stdout: '',
        stderr: 'Worker execution environment not available.',
        timedOut: false,
        durationMs: 0,
      };
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

      worker.onmessage = (event: any) => {
        cleanup();
        const { stdout, stderr, durationMs } = event.data || {};
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          timedOut: false,
          durationMs: durationMs || 0,
        });
      };

      worker.onerror = (event: any) => {
        cleanup();
        resolve({
          stdout: '',
          stderr: ((event && event.message) || 'Worker execution error') + '\n',
          timedOut: false,
          durationMs: 0,
        });
      };

      worker.postMessage({ code });
    });
  }
}

export const jsRunner = new JSRunner();

export async function runJSCode(
  code: string,
  stdin: string = '',
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<ExecutionResult> {
  return jsRunner.run(code, stdin, timeoutMs);
}
