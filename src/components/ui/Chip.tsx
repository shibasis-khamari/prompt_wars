import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  count?: number;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  count,
  ariaLabel,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={ariaLabel || label}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '0.375rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        borderColor: selected ? 'var(--ink)' : 'var(--border-neutral)',
        backgroundColor: selected ? 'var(--ink)' : 'var(--surface)',
        color: selected ? 'var(--surface-panel)' : 'var(--ink)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: selected ? 600 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
      }}
      className={`ui-chip ${className}`}
      onMouseEnter={(e) => {
        if (!selected && !disabled) {
          e.currentTarget.style.backgroundColor = 'var(--surface-highlight)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && !disabled) {
          e.currentTarget.style.backgroundColor = 'var(--surface)';
        }
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          style={{
            fontSize: 'var(--text-caption)',
            fontFamily: 'var(--font-mono)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: selected ? 'var(--surface-panel)' : 'var(--surface-highlight)',
            color: 'var(--ink)',
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};
