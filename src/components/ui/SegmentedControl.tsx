import React, { useRef } from 'react';

export interface SegmentedControlOption {
  value: string;
  label: string;
  badge?: string | number;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  fullWidth?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
  fullWidth = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % options.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = options.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== currentIndex) {
      onChange(options[nextIndex].value);
      const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-md)',
        padding: '2px',
        width: fullWidth ? '100%' : 'auto',
        gap: '2px',
      }}
      className={`ui-segmented-control ${className}`}
    >
      {options.map((opt, idx) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{
              flex: fullWidth ? 1 : 'initial',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              padding: '0.375rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: isSelected ? 600 : 500,
              cursor: 'pointer',
              border: 'none',
              transition: 'background-color 120ms ease, color 120ms ease',
              backgroundColor: isSelected ? 'var(--ink)' : 'transparent',
              color: isSelected ? 'var(--surface-panel)' : 'var(--ink-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                style={{
                  fontSize: 'var(--text-caption)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--surface-panel)' : 'var(--surface-highlight)',
                  color: isSelected ? 'var(--ink)' : 'var(--ink)',
                  fontWeight: 600,
                }}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
