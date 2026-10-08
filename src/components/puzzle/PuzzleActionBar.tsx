import React from 'react';
import { Button } from '../ui/Button';

export interface PuzzleActionBarProps {
  onRunTests: () => void;
  onSubmitFix: () => void;
  onResetCode: () => void;
  onGiveUp: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
}

export const PuzzleActionBar: React.FC<PuzzleActionBarProps> = ({
  onRunTests,
  onSubmitFix,
  onResetCode,
  onGiveUp,
  isRunning = false,
  isSubmitting = false,
}) => {
  const isBusy = isRunning || isSubmitting;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) 0',
      }}
    >
      {/* Quiet secondary actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={onResetCode}
          disabled={isBusy}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.375rem 0.5rem',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-muted)',
            cursor: isBusy ? 'not-allowed' : 'pointer',
            opacity: isBusy ? 0.5 : 1,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Reset code
        </button>

        <span style={{ color: 'var(--border-neutral)' }} aria-hidden="true">|</span>

        <button
          type="button"
          onClick={onGiveUp}
          disabled={isBusy}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.375rem 0.5rem',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--diagnostic-error)',
            cursor: isBusy ? 'not-allowed' : 'pointer',
            opacity: isBusy ? 0.5 : 1,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Give up
        </button>
      </div>

      {/* Primary execution actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button
          variant="secondary"
          onClick={onRunTests}
          disabled={isBusy}
          isLoading={isRunning}
        >
          {isRunning ? 'Running tests...' : 'Run tests'}
        </Button>

        <Button
          variant="primary"
          onClick={onSubmitFix}
          disabled={isBusy}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Evaluating fix...' : 'Submit fix'}
        </Button>
      </div>
    </div>
  );
};
