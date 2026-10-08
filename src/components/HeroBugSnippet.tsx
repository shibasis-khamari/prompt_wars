import React, { useState } from 'react';

interface CodeLine {
  lineNumber: number;
  code: string;
  isBug: boolean;
  explanation: string;
}

const SNIPPET_LINES: CodeLine[] = [
  {
    lineNumber: 1,
    code: 'def apply_discount(cart_total, percent_off):',
    isBug: false,
    explanation: 'Defines the function taking cart total and discount percentage.',
  },
  {
    lineNumber: 2,
    code: '    if percent_off <= 0:',
    isBug: false,
    explanation: 'Guard clause checking for zero or negative discount inputs.',
  },
  {
    lineNumber: 3,
    code: '        return cart_total',
    isBug: false,
    explanation: 'Returns original total when no discount is applicable.',
  },
  {
    lineNumber: 4,
    code: '    discount = cart_total * percent_off',
    isBug: true,
    explanation: 'Bug found: multiplies by percent directly instead of dividing by 100.',
  },
  {
    lineNumber: 5,
    code: '    net_total = cart_total - discount',
    isBug: false,
    explanation: 'Subtracts computed discount amount from the cart total.',
  },
  {
    lineNumber: 6,
    code: '    if net_total < 0:',
    isBug: false,
    explanation: 'Floors the total to ensure price cannot become negative.',
  },
  {
    lineNumber: 7,
    code: '        return 0.0',
    isBug: false,
    explanation: 'Returns zero when discounts exceed the total value.',
  },
  {
    lineNumber: 8,
    code: '    return round(net_total, 2)',
    isBug: false,
    explanation: 'Rounds the calculated price to two decimal places.',
  },
];

export const HeroBugSnippet: React.FC = () => {
  const [selectedLineNumber, setSelectedLineNumber] = useState<number | null>(null);

  const selectedLine = SNIPPET_LINES.find((l) => l.lineNumber === selectedLineNumber);

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '560px',
      }}
    >
      {/* Code window chrome */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-neutral)',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-caption)',
            color: 'var(--ink-muted)',
            fontWeight: 500,
          }}
        >
          discount_calculator.py
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-caption)',
            color: 'var(--ink-muted)',
          }}
        >
          Click a line to test your instinct
        </span>
      </div>

      {/* Code line listing */}
      <div
        role="region"
        aria-label="Interactive buggy code sample"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          padding: '0.5rem 0',
        }}
      >
        {SNIPPET_LINES.map((line) => {
          const isSelected = selectedLineNumber === line.lineNumber;
          const isBugSelected = isSelected && line.isBug;
          const isNormalSelected = isSelected && !line.isBug;

          return (
            <div
              key={line.lineNumber}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Line ${line.lineNumber}: ${line.code.trim()}`}
              onClick={() => setSelectedLineNumber(line.lineNumber)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedLineNumber(line.lineNumber);
                }
              }}
              className={`code-line-interactive ${
                isBugSelected ? 'is-selected-bug' : isNormalSelected ? 'is-selected-normal' : ''
              }`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.15rem 0.75rem',
                userSelect: 'none',
              }}
            >
              {/* Line number */}
              <span
                style={{
                  color: isBugSelected ? 'var(--diagnostic-error)' : 'var(--ink-muted)',
                  width: '2rem',
                  flexShrink: 0,
                  textAlign: 'right',
                  paddingRight: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {line.lineNumber}
              </span>

              {/* Line content */}
              <span
                className={isBugSelected ? 'diagnostic-squiggle' : ''}
                style={{
                  whiteSpace: 'pre',
                  color: isBugSelected ? 'var(--diagnostic-error)' : 'var(--ink)',
                  fontWeight: isBugSelected ? 600 : 400,
                }}
              >
                {line.code}
              </span>
            </div>
          );
        })}
      </div>

      {/* Diagnostic explanation panel */}
      {selectedLine && (
        <div
          role="status"
          aria-live="polite"
          className={selectedLine.isBug ? 'animate-bug-reveal' : ''}
          style={{
            borderTop: '1px solid var(--border-neutral)',
            padding: '0.75rem 1rem',
            backgroundColor: selectedLine.isBug ? 'var(--surface-error-subtle)' : 'var(--surface)',
            color: selectedLine.isBug ? 'var(--diagnostic-error)' : 'var(--ink)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span aria-hidden="true" style={{ fontWeight: 700 }}>
            {selectedLine.isBug ? '✕' : 'ℹ'}
          </span>
          <span style={{ fontWeight: selectedLine.isBug ? 600 : 400 }}>
            {selectedLine.explanation}
          </span>
        </div>
      )}
    </div>
  );
};
