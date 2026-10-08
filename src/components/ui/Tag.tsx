import React from 'react';

export type TagVariant = 'default' | 'pass' | 'error' | 'warn' | 'muted';

export interface TagProps {
  label: string;
  variant?: TagVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  icon,
  size = 'md',
  className = '',
}) => {
  const getStyles = (): { bg: string; border: string; text: string } => {
    switch (variant) {
      case 'pass':
        return {
          bg: 'var(--surface-pass-subtle)',
          border: 'var(--diagnostic-pass)',
          text: 'var(--diagnostic-pass)',
        };
      case 'error':
        return {
          bg: 'var(--surface-error-subtle)',
          border: 'var(--diagnostic-error)',
          text: 'var(--diagnostic-error)',
        };
      case 'warn':
        return {
          bg: 'var(--surface-highlight)',
          border: 'var(--diagnostic-warn)',
          text: 'var(--diagnostic-warn)',
        };
      case 'muted':
        return {
          bg: 'var(--surface)',
          border: 'var(--border-neutral)',
          text: 'var(--ink-muted)',
        };
      case 'default':
      default:
        return {
          bg: 'var(--surface-highlight)',
          border: 'var(--border-neutral)',
          text: 'var(--ink)',
        };
    }
  };

  const styleConfig = getStyles();
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSm ? '1px 6px' : '2px 8px',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${styleConfig.border}`,
        backgroundColor: styleConfig.bg,
        color: styleConfig.text,
        fontSize: isSm ? 'var(--text-caption)' : 'var(--text-xs, 0.8125rem)',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.35,
        whiteSpace: 'nowrap',
      }}
      className={`ui-tag ui-tag-${variant} ${className}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
