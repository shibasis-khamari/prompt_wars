import React from 'react';

export interface GiveUpModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GiveUpModal: React.FC<GiveUpModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="giveup-modal-title"
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
          maxWidth: '440px',
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
        <h3
          id="giveup-modal-title"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h3)',
            fontWeight: 700,
            color: 'var(--diagnostic-error)',
            margin: 0,
          }}
        >
          Give up on this puzzle?
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink)', lineHeight: 1.55 }}>
          The reference solution and explanation will be revealed immediately. However, you will receive{' '}
          <strong style={{ color: 'var(--diagnostic-error)' }}>0 XP</strong> for this puzzle.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={onCancel}
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
            Keep trying
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--diagnostic-error)',
              border: '1px solid var(--diagnostic-error)',
              color: 'var(--surface-panel)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Confirm give up
          </button>
        </div>
      </div>
    </div>
  );
};
