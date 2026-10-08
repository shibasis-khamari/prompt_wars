export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0SubmissionResult {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: Judge0Status;
}

export interface Judge0CheckOutcome {
  passed: boolean;
  errorType?: 'compile_error' | 'timeout' | 'runtime_error' | 'wrong_output' | 'system_error';
  message: string;
  failedTestIndex?: number;
  compileOutput?: string;
  stderr?: string;
}

// In-memory language ID cache
const languageIdCache = new Map<string, number>();

export function resetJudge0LanguageCache(): void {
  languageIdCache.clear();
}

export function encodeBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

export function decodeBase64(str: string | null | undefined): string {
  if (!str) return '';
  return Buffer.from(str, 'base64').toString('utf-8');
}

export function getJudge0Config() {
  const apiUrl = (process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com').replace(/\/+$/, '');
  const apiKey = process.env.JUDGE0_API_KEY || '';
  return { apiUrl, apiKey };
}

export function getJudge0Headers(): Record<string, string> {
  const { apiUrl, apiKey } = getJudge0Config();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    if (apiUrl.includes('rapidapi.com')) {
      headers['X-RapidAPI-Key'] = apiKey;
      try {
        headers['X-RapidAPI-Host'] = new URL(apiUrl).host;
      } catch {
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
      }
    } else {
      headers['X-Auth-Token'] = apiKey;
    }
  }

  return headers;
}

/**
 * Dynamically resolves language ID from Judge0 instance's /languages endpoint once and caches it.
 */
export async function getJudge0LanguageId(language: string, customFetch?: typeof fetch): Promise<number> {
  const norm = language.toLowerCase();
  if (languageIdCache.has(norm)) {
    return languageIdCache.get(norm)!;
  }

  const { apiUrl } = getJudge0Config();
  const headers = getJudge0Headers();
  const fetcher = customFetch || fetch;

  const res = await fetcher(`${apiUrl}/languages`, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch Judge0 languages list (HTTP ${res.status})`);
  }

  const languages: Array<{ id: number; name: string }> = await res.json();

  // Find matching languages and cache them
  for (const lang of languages) {
    const nameLower = lang.name.toLowerCase();
    if (nameLower.includes('java') && !nameLower.includes('javascript') && !languageIdCache.has('java')) {
      languageIdCache.set('java', lang.id);
    }
    if ((nameLower.startsWith('c (') || nameLower.startsWith('c (gcc')) && !languageIdCache.has('c')) {
      languageIdCache.set('c', lang.id);
    }
    if (nameLower.includes('c++') && !languageIdCache.has('cpp')) {
      languageIdCache.set('cpp', lang.id);
      languageIdCache.set('c++', lang.id);
    }
    if (nameLower.includes('python') && !languageIdCache.has('python')) {
      languageIdCache.set('python', lang.id);
    }
    if ((nameLower.includes('javascript') || nameLower.includes('node')) && !languageIdCache.has('javascript')) {
      languageIdCache.set('javascript', lang.id);
    }
  }

  const foundId = languageIdCache.get(norm);
  if (!foundId) {
    throw new Error(`Unsupported or unconfigured language in Judge0 instance: ${language}`);
  }

  return foundId;
}

export function formatStdin(input: unknown[]): string {
  if (!Array.isArray(input)) return '';
  return input.map((val) => (typeof val === 'object' ? JSON.stringify(val) : String(val))).join('\n');
}

export function formatExpectedOutput(expected: unknown): string {
  if (typeof expected === 'object' && expected !== null) {
    return JSON.stringify(expected);
  }
  return String(expected ?? '');
}

/**
 * Submits batch submissions to Judge0 without wait option, then polls for completion.
 */
export async function submitAndPollBatch(
  language: string,
  sourceCode: string,
  tests: Array<{ id?: string; input: unknown[]; expectedOutput?: unknown }>,
  options: {
    pollIntervalMs?: number;
    maxPollAttempts?: number;
    customFetch?: typeof fetch;
  } = {}
): Promise<Judge0CheckOutcome> {
  const { apiUrl } = getJudge0Config();
  const headers = getJudge0Headers();
  const fetcher = options.customFetch || fetch;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const maxPollAttempts = options.maxPollAttempts ?? 25;

  const languageId = await getJudge0LanguageId(language, fetcher);

  // Build batch submissions with required safety limits
  const submissions = tests.map((tc) => ({
    language_id: languageId,
    source_code: encodeBase64(sourceCode),
    stdin: encodeBase64(formatStdin(tc.input)),
    expected_output: encodeBase64(formatExpectedOutput(tc.expectedOutput)),
    cpu_time_limit: 2.0,
    max_processes_and_or_threads: 10,
    memory_limit: 128000,
    enable_network: false,
  }));

  // 1. Single batch submission (No wait option!)
  const postUrl = `${apiUrl}/submissions/batch?base64_encoded=true`;
  const postRes = await fetcher(postUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ submissions }),
  });

  if (!postRes.ok) {
    const errorText = await postRes.text();
    return {
      passed: false,
      errorType: 'system_error',
      message: `Judge0 batch submission failed (HTTP ${postRes.status}): ${errorText}`,
    };
  }

  const tokenObjects: Array<{ token: string }> = await postRes.json();
  const tokens = tokenObjects.map((t) => t.token);

  if (tokens.length === 0) {
    return {
      passed: false,
      errorType: 'system_error',
      message: 'Judge0 did not return execution tokens.',
    };
  }

  // 2. Poll using returned tokens requesting only required fields
  const tokensParam = tokens.join(',');
  const getUrl = `${apiUrl}/submissions/batch?tokens=${tokensParam}&base64_encoded=true&fields=stdout,stderr,compile_output,status`;

  let completedResults: Judge0SubmissionResult[] = [];
  let attempts = 0;

  while (attempts < maxPollAttempts) {
    attempts++;
    if (pollIntervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    const pollRes = await fetcher(getUrl, { method: 'GET', headers });
    if (!pollRes.ok) {
      continue;
    }

    const data: { submissions: Judge0SubmissionResult[] } = await pollRes.json();
    const currentSubmissions = data.submissions || [];

    // Check if all submissions have finished (status.id > 2: not In Queue (1) or Processing (2))
    const allDone = currentSubmissions.length === tokens.length && currentSubmissions.every((s) => s.status && s.status.id > 2);

    if (allDone) {
      completedResults = currentSubmissions;
      break;
    }
  }

  if (completedResults.length === 0) {
    return {
      passed: false,
      errorType: 'timeout',
      message: 'Execution verification timed out while polling Judge0 results.',
    };
  }

  // 3. Process status codes and generate clear error messages
  for (let i = 0; i < completedResults.length; i++) {
    const res = completedResults[i];
    const statusId = res.status?.id;
    const compileOutput = decodeBase64(res.compile_output);
    const stderr = decodeBase64(res.stderr);

    // Compilation Error (Status 6)
    if (statusId === 6) {
      return {
        passed: false,
        errorType: 'compile_error',
        message: compileOutput || stderr || 'Compilation error occurred while compiling code.',
        compileOutput,
        stderr,
      };
    }

    // Time Limit Exceeded (Status 5)
    if (statusId === 5) {
      return {
        passed: false,
        errorType: 'timeout',
        message: 'CPU time limit of 2.0s exceeded. Check for infinite loops or non-terminating logic.',
        failedTestIndex: i,
        stderr,
      };
    }

    // Runtime Errors (Statuses 7..12, 14)
    if ((statusId >= 7 && statusId <= 12) || statusId === 14) {
      return {
        passed: false,
        errorType: 'runtime_error',
        message: stderr || res.status?.description || 'Runtime exception occurred during test execution.',
        failedTestIndex: i,
        stderr,
      };
    }

    // Wrong Answer (Status 4)
    if (statusId === 4) {
      return {
        passed: false,
        errorType: 'wrong_output',
        message: 'Output did not match expected test output.',
        failedTestIndex: i,
      };
    }

    // If not accepted (Status 3)
    if (statusId !== 3) {
      return {
        passed: false,
        errorType: 'system_error',
        message: res.status?.description || 'Unexpected execution status.',
        failedTestIndex: i,
      };
    }
  }

  // All passed
  return {
    passed: true,
    message: 'All test cases passed successfully.',
  };
}
