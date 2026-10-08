import React from 'react';
import { Puzzle, PuzzleStatus } from '../types/puzzle';

export interface HintSolutionPanelProps {
  puzzle: Puzzle;
  status: PuzzleStatus;
  unlockedHintIndices: number[];
  solutionRevealed: boolean;
  onUnlockHint: (index: number) => void;
  onGiveUp: () => void;
}

export const HintSolutionPanel: React.FC<HintSolutionPanelProps> = ({
  puzzle,
  status,
  unlockedHintIndices,
  solutionRevealed,
  onUnlockHint,
  onGiveUp,
}) => {
  const isSolved = status === 'solved';
  const isGivenUp = status === 'given_up';
  const canShowAnswers = isSolved || isGivenUp || solutionRevealed;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        color: 'var(--ink)',
        fontSize: 'var(--text-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Hints Section */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 var(--space-2) 0',
          }}
        >
          Hints
        </h3>
        {puzzle.hints.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', margin: 0 }}>No hints available for this puzzle.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {puzzle.hints.map((hint, idx) => {
              const isUnlocked = unlockedHintIndices.includes(idx);
              return (
                <li
                  key={idx}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border-neutral)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                  }}
                >
                  {isUnlocked ? (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Hint {idx + 1}: </span>
                      <span style={{ color: 'var(--ink)' }}>{hint}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                      <span style={{ color: 'var(--ink-muted)' }}>Hint {idx + 1} is locked</span>
                      <button
                        type="button"
                        onClick={() => onUnlockHint(idx)}
                        style={{
                          backgroundColor: 'var(--ink)',
                          color: 'var(--surface-panel)',
                          border: '1px solid var(--ink)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.25rem 0.625rem',
                          fontSize: 'var(--text-caption)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        aria-label={`Unlock hint ${idx + 1}`}
                      >
                        Unlock hint {idx + 1}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Answer & Explanation Section (Rule 4: Hidden until solved or given up) */}
      <div style={{ borderTop: '1px solid var(--border-neutral)', paddingTop: 'var(--space-3)' }}>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 var(--space-2) 0',
          }}
        >
          Solution & explanation
        </h3>

        {canShowAnswers ? (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-neutral)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--diagnostic-pass)',
                  margin: '0 0 var(--space-1) 0',
                }}
              >
                Correct code
              </h4>
              <pre
                style={{
                  backgroundColor: 'var(--surface-panel)',
                  border: '1px solid var(--border-neutral)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink)',
                  overflowX: 'auto',
                  margin: 0,
                }}
              >
                {puzzle.correctCode}
              </pre>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink)',
                  margin: '0 0 var(--space-1) 0',
                }}
              >
                Explanation
              </h4>
              <p style={{ color: 'var(--ink-muted)', lineHeight: 1.55, margin: 0 }}>
                {puzzle.explanation}
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px dashed var(--border-neutral)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--ink-muted)', margin: '0 0 var(--space-3) 0' }}>
              The correct code and explanation are locked until you solve the puzzle or choose to give up.
            </p>
            <button
              type="button"
              onClick={onGiveUp}
              style={{
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--diagnostic-error)',
                color: 'var(--diagnostic-error)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Give up and reveal solution
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
