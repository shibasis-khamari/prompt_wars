import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  whatHappened: string;
  whatToDoNext?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  whatHappened,
  whatToDoNext,
  action,
  className = '',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-6)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        gap: 'var(--space-3)',
      }}
      className={`ui-empty-state ${className}`}
    >
      {icon && (
        <div
          style={{
            fontSize: '2rem',
            color: 'var(--ink-muted)',
            lineHeight: 1,
            marginBottom: 'var(--space-1)',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-h3)',
          fontWeight: 600,
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      <div
        style={{
          maxWidth: '56ch',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.55,
        }}
      >
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>What happened: </strong>
          {whatHappened}
        </p>

        {whatToDoNext && (
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            <strong style={{ color: 'var(--ink)' }}>What to do next: </strong>
            {whatToDoNext}
          </p>
        )}
      </div>

      {action && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          {action}
        </div>
      )}
    </div>
  );
};
