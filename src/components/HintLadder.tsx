import React, { useState } from 'react';

export const HINT_COST_BY_DIFFICULTY: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 8,
};

export function getHintCost(difficulty: number): number {
  return HINT_COST_BY_DIFFICULTY[difficulty] ?? 3;
}

export interface HintLadderProps {
  hints?: string[];
  difficulty: number;
  unlockedHintIndices: number[];
  onUnlockHint: (index: number, cost: number) => void;
  totalCostDeducted: number;
  unlockedHints?: Record<number, string>;
}

export const HintLadder: React.FC<HintLadderProps> = ({
  hints = [],
  difficulty,
  unlockedHintIndices,
  onUnlockHint,
  totalCostDeducted,
  unlockedHints,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const cost = getHintCost(difficulty);
  const totalHints = hints && hints.length > 0 ? hints.length : 3;
  const nextHintIndex = unlockedHintIndices.length;
  const hasMoreHints = nextHintIndex < totalHints;

  const handleConfirmUnlock = () => {
    onUnlockHint(nextHintIndex, cost);
    setShowConfirm(false);
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Hint ladder ({unlockedHintIndices.length}/{totalHints})
        </h3>
        {totalCostDeducted > 0 && (
          <span
            style={{
              fontSize: 'var(--text-caption)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--diagnostic-warn)',
              backgroundColor: 'var(--surface-highlight)',
              border: '1px solid var(--diagnostic-warn)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Total cost: -{totalCostDeducted} pts
          </span>
        )}
      </div>

      {/* Revealed hints list (Unrevealed hints are strictly NOT in the DOM) */}
      {unlockedHintIndices.length === 0 ? (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          No hints unlocked yet.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {unlockedHintIndices.map((idx) => {
            const hintText = (hints && hints[idx]) || unlockedHints?.[idx] || 'Diagnostic hint unlocked';
            return (
              <li
                key={idx}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-neutral)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--ink)', marginRight: '6px' }}>Hint {idx + 1}:</span>
                <span style={{ color: 'var(--ink)' }}>{hintText}</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Action / Confirmation */}
      {hasMoreHints && !showConfirm && (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          style={{
            backgroundColor: 'var(--ink)',
            color: 'var(--surface-panel)',
            border: '1px solid var(--ink)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Unlock hint {nextHintIndex + 1} ({cost} {cost === 1 ? 'point' : 'points'})
        </button>
      )}

      {/* Confirmation prompt showing cost before unlocking */}
      {showConfirm && (
        <div
          role="dialog"
          aria-label="Confirm hint unlock"
          style={{
            backgroundColor: 'var(--surface-highlight)',
            border: '1px solid var(--diagnostic-warn)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--ink)', fontWeight: 500 }}>
            Unlock Hint {nextHintIndex + 1} for <strong>{cost} {cost === 1 ? 'point' : 'points'}</strong>?
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={handleConfirmUnlock}
              style={{
                backgroundColor: 'var(--ink)',
                color: 'var(--surface-panel)',
                border: '1px solid var(--ink)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.375rem 0.75rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm unlock
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              style={{
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-neutral)',
                color: 'var(--ink)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.375rem 0.75rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
