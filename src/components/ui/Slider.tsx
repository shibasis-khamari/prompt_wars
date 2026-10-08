import React from 'react';

export interface SliderStop {
  value: number;
  label: string;
  sublabel?: string;
}

export interface SliderProps {
  id: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  stops: SliderStop[];
  onChange: (value: number) => void;
  ariaLabel: string;
  ariaValueText?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  id,
  value,
  min,
  max,
  step = 1,
  stops,
  onChange,
  ariaLabel,
  ariaValueText,
  className = '',
}) => {
  return (
    <div className={`ui-slider-container ${className}`} style={{ width: '100%' }}>
      <div style={{ position: 'relative', padding: '0.5rem 0' }}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={ariaValueText}
          style={{
            width: '100%',
            accentColor: 'var(--ink)',
            cursor: 'pointer',
            height: '6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-highlight)',
          }}
        />
      </div>

      {stops && stops.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-1)',
            paddingTop: 'var(--space-1)',
          }}
          aria-hidden="true"
        >
          {stops.map((stop) => {
            const isCurrent = stop.value === value;
            return (
              <button
                key={stop.value}
                type="button"
                tabIndex={-1}
                onClick={() => onChange(stop.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-xs, 0.8125rem)',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--ink)' : 'var(--ink-muted)',
                    transition: 'color 120ms ease',
                  }}
                >
                  {stop.label}
                </span>
                {stop.sublabel && (
                  <span
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: 'var(--ink-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {stop.sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
