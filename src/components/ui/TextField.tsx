import React from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  error,
  helperText,
  disabled,
  className = '',
  ...rest
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const ariaDescribedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--ink)',
        }}
      >
        {label}
      </label>

      <input
        id={id}
        {...rest}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={ariaDescribedBy}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--ink)',
          backgroundColor: 'var(--surface-panel)',
          border: `1px solid ${error ? 'var(--diagnostic-error)' : 'var(--border-neutral)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem 0.75rem',
          outline: 'none',
          boxSizing: 'border-box',
          width: '100%',
        }}
        className={`ui-textfield-input ${className}`}
      />

      {error && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--diagnostic-error)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            marginTop: '2px',
          }}
        >
          <span aria-hidden="true">✕</span>
          <span>{error}</span>
        </span>
      )}

      {!error && helperText && (
        <span
          id={helperId}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-caption)',
            color: 'var(--ink-muted)',
            marginTop: '2px',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
