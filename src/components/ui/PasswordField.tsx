import React, { useState } from 'react';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  error,
  helperText,
  disabled,
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
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

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
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
            padding: '0.625rem 3.25rem 0.625rem 0.75rem',
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%',
          }}
          className={`ui-passwordfield-input ${className}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-muted)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

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
