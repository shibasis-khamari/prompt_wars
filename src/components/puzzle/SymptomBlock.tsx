import React from 'react';
import { Puzzle } from '../../data/puzzle';

export interface SymptomBlockProps {
  puzzle: Puzzle;
}

export const SymptomBlock: React.FC<SymptomBlockProps> = ({ puzzle }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs, 0.8125rem)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          Diagnostic symptom
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption)',
            color: 'var(--ink-muted)',
          }}
        >
          Theme: {puzzle.theme || 'Standard'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs, 0.8125rem)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
          }}
        >
          <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: 'var(--text-caption)' }}>
            Expected output:
          </span>
          <span style={{ color: 'var(--diagnostic-pass)', fontWeight: 600 }}>
            {puzzle.expectedOutput !== undefined ? JSON.stringify(puzzle.expectedOutput) : 'Pass all test cases'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
          }}
        >
          <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: 'var(--text-caption)' }}>
            Observed symptom:
          </span>
          <span style={{ color: 'var(--diagnostic-error)', fontWeight: 600 }}>
            {puzzle.symptomOutput || 'Failed test assertion'}
          </span>
        </div>
      </div>
    </div>
  );
};
