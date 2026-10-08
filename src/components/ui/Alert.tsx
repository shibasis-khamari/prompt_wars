import React from 'react';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'var(--surface-error-subtle)',
          border: 'var(--diagnostic-error)',
          text: 'var(--diagnostic-error)',
          icon: '✕',
          defaultTitle: 'Error',
        };
      case 'success':
        return {
          bg: 'var(--surface-pass-subtle)',
          border: 'var(--diagnostic-pass)',
          text: 'var(--diagnostic-pass)',
          icon: '✓',
          defaultTitle: 'Success',
        };
      case 'warning':
        return {
          bg: 'var(--surface-highlight)',
          border: 'var(--diagnostic-warn)',
          text: 'var(--ink)',
          icon: '⚠',
          defaultTitle: 'Warning',
        };
      case 'info':
      default:
        return {
          bg: 'var(--surface-highlight)',
          border: 'var(--border-neutral)',
          text: 'var(--ink)',
          icon: 'ℹ',
          defaultTitle: 'Note',
        };
    }
  };

  const config = getStyles();

  return (
    <div
      role="alert"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        color: config.text,
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        marginBottom: 'var(--space-4)',
      }}
      className={`ui-alert ui-alert-${type} ${className}`}
    >
      <span
        aria-hidden="true"
        style={{
          fontWeight: 700,
          fontSize: 'var(--text-base)',
          lineHeight: 1.2,
          flexShrink: 0,
        }}
      >
        {config.icon}
      </span>
      <div style={{ flex: 1, fontSize: 'var(--text-sm)', lineHeight: 1.45 }}>
        {title && <strong style={{ display: 'block', marginBottom: '2px' }}>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
};
