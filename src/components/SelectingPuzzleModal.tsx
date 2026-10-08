import React from 'react';

export interface SelectingPuzzleModalProps {
  isOpen: boolean;
  message: string;
}

export const SelectingPuzzleModal: React.FC<SelectingPuzzleModalProps> = ({ isOpen, message }) => {
  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 29, 32, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          maxWidth: '380px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }} aria-hidden="true">
          🔍
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--ink)',
            margin: 0,
            fontSize: 'var(--text-base)',
            fontWeight: 700,
          }}
        >
          Preparing Your Challenge
        </h3>
        <p
          style={{
            color: 'var(--ink-muted)',
            fontSize: 'var(--text-sm)',
            marginTop: '8px',
            marginBottom: 0,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};
