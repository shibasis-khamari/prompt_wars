import React from 'react';
import { TestResult } from '../types/puzzle';

export interface TestResultsPanelProps {
  results: TestResult[];
  isRunning: boolean;
  overallError?: string;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  results,
  isRunning,
  overallError,
}) => {
  if (isRunning) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-panel)',
          color: 'var(--ink)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
          <span
            style={{
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: '2px solid var(--ink)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
            aria-hidden="true"
          />
          <span>Running tests in background worker...</span>
        </p>
      </div>
    );
  }

  if (overallError) {
    return (
      <div
        role="alert"
        style={{
          padding: 'var(--space-4)',
          border: '1px solid var(--diagnostic-error)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-error-subtle)',
          color: 'var(--diagnostic-error)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <h3 style={{ fontWeight: 600, margin: '0 0 var(--space-1) 0' }}>Execution failed</h3>
        <p style={{ margin: 0 }}>{overallError}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-panel)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <p style={{ margin: 0 }}>Click "Run tests" to test your code solution.</p>
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-panel)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-caption)',
              fontWeight: 700,
              backgroundColor: allPassed ? 'var(--surface-pass-subtle)' : 'var(--surface-error-subtle)',
              color: allPassed ? 'var(--diagnostic-pass)' : 'var(--diagnostic-error)',
              border: `1px solid ${allPassed ? 'var(--diagnostic-pass)' : 'var(--diagnostic-error)'}`,
            }}
          >
            {allPassed ? '✓ All tests passed' : `✕ ${passedCount} of ${totalCount} tests passed`}
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-muted)' }}>
            Total test count: {totalCount}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }} role="region" aria-label="Test suite details">
        {results.map((res, idx) => (
          <div
            key={res.testCaseId || idx}
            style={{
              padding: 'var(--space-3)',
              border: `1px solid ${res.passed ? 'var(--diagnostic-pass)' : 'var(--diagnostic-error)'}`,
              borderRadius: 'var(--radius-md)',
              backgroundColor: res.passed ? 'var(--surface-pass-subtle)' : 'var(--surface-error-subtle)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, color: res.passed ? 'var(--diagnostic-pass)' : 'var(--diagnostic-error)' }}>
                {res.passed ? '✓ PASSED' : '✕ FAILED'}: <span style={{ color: 'var(--ink)' }}>{res.description}</span>
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                {res.executionTimeMs.toFixed(1)} ms
              </span>
            </div>

            {!res.passed && (
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  fontSize: 'var(--text-caption)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--surface-panel)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-neutral)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {res.expectedOutput !== undefined && (
                  <p style={{ margin: 0 }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Expected: </span>
                    <span style={{ color: 'var(--diagnostic-pass)' }}>{JSON.stringify(res.expectedOutput)}</span>
                  </p>
                )}
                {res.actualOutput !== undefined && (
                  <p style={{ margin: 0 }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Received: </span>
                    <span style={{ color: 'var(--diagnostic-error)' }}>{JSON.stringify(res.actualOutput)}</span>
                  </p>
                )}
                {res.error && (
                  <p style={{ margin: 0, color: 'var(--diagnostic-error)' }}>
                    <span style={{ color: 'var(--ink-muted)' }}>Error: </span>
                    {res.error}
                  </p>
                )}
              </div>
            )}

            {res.logs && res.logs.length > 0 && (
              <details style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption)' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--ink-muted)' }}>
                  Console logs ({res.logs.length})
                </summary>
                <pre
                  style={{
                    marginTop: '4px',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--surface-panel)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-neutral)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-mono)',
                    overflowX: 'auto',
                    margin: 0,
                  }}
                >
                  {res.logs.join('\n')}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
