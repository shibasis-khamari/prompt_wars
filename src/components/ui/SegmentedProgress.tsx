import React from 'react';

export interface SegmentedProgressProps {
  value: number;
  totalSegments?: number;
  ariaLabel: string;
  variant?: 'ink' | 'pass';
  className?: string;
  size?: 'sm' | 'md';
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  value,
  totalSegments = 5,
  ariaLabel,
  variant = 'ink',
  className = '',
  size = 'md',
}) => {
  const activeColor = variant === 'pass' ? 'var(--diagnostic-pass)' : 'var(--ink)';
  const clampedValue = Math.max(0, Math.min(value, totalSegments));
  const height = size === 'sm' ? '6px' : '8px';

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={totalSegments}
      aria-valuetext={`${clampedValue} of ${totalSegments} segments`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        width: '100%',
      }}
      className={`ui-segmented-progress ${className}`}
    >
      {Array.from({ length: totalSegments }).map((_, idx) => {
        const isFilled = idx < clampedValue;
        return (
          <div
            key={idx}
            style={{
              flex: 1,
              height,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isFilled ? activeColor : 'var(--surface-highlight)',
              border: `1px solid ${isFilled ? activeColor : 'var(--border-neutral)'}`,
              transition: 'background-color 160ms ease, border-color 160ms ease',
            }}
          />
        );
      })}
    </div>
  );
};
