import React from 'react';
import { Puzzle } from '../../data/puzzle';
import { Button } from '../ui/Button';

export interface ResultSurrenderViewProps {
  puzzle: Puzzle;
  onTrySimilar: () => void;
  onViewJournal?: () => void;
}

export const ResultSurrenderView: React.FC<ResultSurrenderViewProps> = ({
  puzzle,
  onTrySimilar,
  onViewJournal,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Surrender Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          borderBottom: '1px solid var(--border-neutral)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-error-subtle)',
              color: 'var(--diagnostic-error)',
              border: '1px solid var(--diagnostic-error)',
              fontWeight: 700,
              fontSize: '14px',
            }}
            aria-hidden="true"
          >
            ⚐
          </span>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Puzzle surrendered
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--diagnostic-error)', fontSize: 'var(--text-sm)' }}>
              What happened: You chose to give up. As a reminder, 0 XP is awarded for this puzzle.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>
          What to do next:
        </strong>
        <p style={{ margin: 0, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          Study the correct reference code and explanation below to internalize the pattern, then try a similar puzzle!
        </p>
      </div>

      {/* Reference Code */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          Correct reference code
        </h3>
        <pre
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs, 0.8125rem)',
            color: 'var(--diagnostic-pass)',
            overflowX: 'auto',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {puzzle.correctCode}
        </pre>
      </div>

      {/* Explanation of the bug */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          Explanation of the bug
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink)', lineHeight: 1.55 }}>
          {puzzle.explanation}
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--border-neutral)',
          paddingTop: 'var(--space-4)',
        }}
      >
        {onViewJournal && (
          <Button variant="secondary" onClick={onViewJournal}>
            View journal
          </Button>
        )}

        <Button variant="primary" onClick={onTrySimilar}>
          Try a similar bug
        </Button>
      </div>
    </div>
  );
};
