import React from 'react';
import * as diff from 'diff';

export interface DiffViewProps {
  originalCode: string;
  modifiedCode: string;
  originalLabel?: string;
  modifiedLabel?: string;
  className?: string;
}

export const DiffView: React.FC<DiffViewProps> = ({
  originalCode,
  modifiedCode,
  originalLabel = 'Your code',
  modifiedLabel = 'Reference solution',
  className = '',
}) => {
  const diffParts = diff.diffLines(originalCode || '', modifiedCode || '');

  return (
    <div
      style={{
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs, 0.8125rem)',
        lineHeight: 1.5,
      }}
      className={`ui-diff-view ${className}`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          backgroundColor: 'var(--surface-highlight)',
          borderBottom: '1px solid var(--border-neutral)',
          fontSize: 'var(--text-caption)',
          color: 'var(--ink-muted)',
        }}
      >
        <span>Comparison: {originalLabel} vs {modifiedLabel}</span>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <span style={{ color: 'var(--diagnostic-error)' }}>- Removed</span>
          <span style={{ color: 'var(--diagnostic-pass)' }}>+ Added</span>
        </div>
      </div>

      <div style={{ padding: '8px 0', overflowX: 'auto', maxHeight: '380px' }}>
        {diffParts.map((part, partIdx) => {
          const lines = part.value.split('\n').filter((l, i, arr) => i < arr.length - 1 || l.length > 0);
          const prefix = part.added ? '+' : part.removed ? '-' : ' ';
          const bg = part.added
            ? 'var(--surface-pass-subtle)'
            : part.removed
            ? 'var(--surface-error-subtle)'
            : 'transparent';
          const color = part.added
            ? 'var(--diagnostic-pass)'
            : part.removed
            ? 'var(--diagnostic-error)'
            : 'var(--ink)';

          return (
            <React.Fragment key={partIdx}>
              {lines.map((line, lineIdx) => (
                <div
                  key={`${partIdx}-${lineIdx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1px 12px',
                    backgroundColor: bg,
                    color,
                    whiteSpace: 'pre',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      userSelect: 'none',
                      opacity: 0.65,
                      fontWeight: 600,
                    }}
                    aria-hidden="true"
                  >
                    {prefix}
                  </span>
                  <span style={{ flex: 1 }}>{line}</span>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
