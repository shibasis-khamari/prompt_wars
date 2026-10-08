import React from 'react';

export interface ToolbarProps {
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  children,
  ariaLabel = 'Action toolbar',
  className = '',
}) => {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={`ui-toolbar ${className}`}
    >
      {children}
    </div>
  );
};
