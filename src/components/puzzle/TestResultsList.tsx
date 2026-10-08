import React from 'react';
import { TestCase } from '../../data/puzzle';
import { TestRow } from '../ui/TestRow';

export interface TestRunResult {
  testId: string;
  description: string;
  input: unknown[];
  expectedOutput: unknown;
  actualOutput?: unknown;
  passed: boolean;
  error?: string;
}

export interface TestResultsListProps {
  tests?: TestCase[];
  testResults: TestRunResult[];
}

export const TestResultsList: React.FC<TestResultsListProps> = ({ tests = [], testResults }) => {
  const testList = tests || [];
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)' }}>
          Test verification ({testList.length} tests)
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {testList.map((tc, idx) => {
          const runResult = testResults.find((r) => r.testId === (tc.id || `t${idx + 1}`));
          return (
            <TestRow
              key={tc.id || idx}
              id={tc.id || `t${idx + 1}`}
              description={tc.description || `Test case #${idx + 1}`}
              input={tc.input}
              expectedOutput={tc.expectedOutput}
              actualOutput={runResult?.actualOutput}
              status={runResult ? (runResult.passed ? 'passed' : 'failed') : 'idle'}
              error={runResult?.error}
            />
          );
        })}
      </div>
    </div>
  );
};
