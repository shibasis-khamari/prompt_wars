import React from 'react';

export interface TestRowProps {
  id: string;
  description: string;
  input?: unknown[];
  expectedOutput: unknown;
  actualOutput?: unknown;
  status?: 'passed' | 'failed' | 'idle';
  error?: string;
  className?: string;
}

export const TestRow: React.FC<TestRowProps> = ({
  id: _id,
  description,
  input,
  expectedOutput,
  actualOutput,
  status = 'idle',
  error,
  className = '',
}) => {
  const isPassed = status === 'passed';
  const isFailed = status === 'failed';

  const borderColor = isPassed
    ? 'var(--diagnostic-pass)'
    : isFailed
    ? 'var(--diagnostic-error)'
    : 'var(--border-neutral)';

  const bgColor = isPassed
    ? 'var(--surface-pass-subtle)'
    : isFailed
    ? 'var(--surface-error-subtle)'
    : 'var(--surface)';

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        transition: 'background-color 140ms ease, border-color 140ms ease',
      }}
      className={`ui-test-row ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: isPassed
                ? 'var(--diagnostic-pass)'
                : isFailed
                ? 'var(--diagnostic-error)'
                : 'var(--border-neutral)',
              color: 'var(--surface-panel)',
            }}
            aria-hidden="true"
          >
            {isPassed ? '✓' : isFailed ? '✕' : '•'}
          </span>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{description}</span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            color: isPassed
              ? 'var(--diagnostic-pass)'
              : isFailed
              ? 'var(--diagnostic-error)'
              : 'var(--ink-muted)',
          }}
        >
          {isPassed ? 'Passed' : isFailed ? 'Failed' : 'Pending'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-caption)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {input !== undefined && input.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-neutral)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span style={{ color: 'var(--ink-muted)', display: 'block' }}>Input:</span>
            <span style={{ color: 'var(--ink)' }}>{JSON.stringify(input)}</span>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--border-neutral)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span style={{ color: 'var(--ink-muted)', display: 'block' }}>Expected:</span>
          <span style={{ color: 'var(--diagnostic-pass)', fontWeight: 600 }}>
            {JSON.stringify(expectedOutput)}
          </span>
        </div>

        {actualOutput !== undefined && (
          <div
            style={{
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-neutral)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span style={{ color: 'var(--ink-muted)', display: 'block' }}>Actual:</span>
            <span style={{ color: isPassed ? 'var(--diagnostic-pass)' : 'var(--diagnostic-error)', fontWeight: 600 }}>
              {JSON.stringify(actualOutput)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--diagnostic-error)',
            color: 'var(--diagnostic-error)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
