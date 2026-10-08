import React from 'react';

export interface WarmUpModalProps {
  isOpen: boolean;
  targetLevel: number;
  onAcceptWarmUp: () => void;
  onDeclineWarmUp: () => void;
}

export const WarmUpModal: React.FC<WarmUpModalProps> = ({
  isOpen,
  targetLevel,
  onAcceptWarmUp,
  onDeclineWarmUp,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="warmup-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(26, 29, 32, 0.45)',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          color: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }} aria-hidden="true">⚡</span>
          <h3
            id="warmup-modal-title"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h3)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Level {targetLevel} Warm-Up Challenge
          </h3>
        </div>

        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink)', lineHeight: 1.55 }}>
          Level {targetLevel} features complex code patterns. You will play a 2-puzzle warm-up session:
        </p>

        <ul style={{ margin: 0, paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <li>Solve <strong>both</strong> puzzles to qualify.</li>
          <li>Use <strong>at most 1 hint in total</strong> across both puzzles.</li>
          <li>Failing either condition will automatically step you down to <strong>Level {targetLevel - 1}</strong> with an explanation.</li>
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={onDeclineWarmUp}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-neutral)',
              color: 'var(--ink)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Play Level {targetLevel - 1} instead
          </button>
          <button
            type="button"
            onClick={onAcceptWarmUp}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--ink)',
              border: '1px solid var(--ink)',
              color: 'var(--surface-panel)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Start warm-up
          </button>
        </div>
      </div>
    </div>
  );
};
