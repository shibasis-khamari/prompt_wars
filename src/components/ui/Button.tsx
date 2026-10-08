import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    lineHeight: 1.25,
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    border: '1px solid transparent',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--ink)',
          color: 'var(--surface-panel)',
          borderColor: 'var(--ink)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--surface-panel)',
          color: 'var(--ink)',
          borderColor: 'var(--border-neutral)',
        };
      case 'tertiary':
        return {
          backgroundColor: 'transparent',
          color: 'var(--ink)',
          borderColor: 'transparent',
          padding: '0.5rem 0.75rem',
        };
    }
  };

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      style={{ ...baseStyles, ...getVariantStyles() }}
      className={`ui-button ui-button-${variant} ${className}`}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};
