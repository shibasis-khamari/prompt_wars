import React, { useState, useEffect } from 'react';

export interface PyodideLoadingModalProps {
  isOpen: boolean;
  percent: number;
  stage: string;
  onDismiss?: () => void;
}

const DEBUG_TIPS = [
  "Off-by-one errors often hide in loop conditions like '<' vs '<=' or range endpoints.",
  "In Python, strings and tuples are immutable—methods like .replace() return new strings.",
  "Check variable types: dividing integers in Python produces floats with '/' or ints with '//'.",
  "Use dict.get(key, default) to safely look up keys without triggering KeyError.",
  "When debugging recursive functions, always verify your base case terminates first.",
  "Remember that list.append() modifies the list in place and returns None.",
];

export const PyodideLoadingModal: React.FC<PyodideLoadingModalProps> = ({
  isOpen,
  percent,
  stage,
  onDismiss,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % DEBUG_TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTip = DEBUG_TIPS[tipIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pyodide-loading-title"
      aria-describedby="pyodide-loading-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'rgba(26, 29, 32, 0.45)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          color: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-highlight)',
              border: '1px solid var(--border-neutral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >
            🐍
          </div>
          <div>
            <h2
              id="pyodide-loading-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h3)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Preparing Python runtime
            </h2>
            <p id="pyodide-loading-desc" style={{ margin: '2px 0 0 0', fontSize: 'var(--text-caption)', color: 'var(--ink-muted)' }}>
              Downloading Pyodide (~10 MB). Cached in browser for future runs.
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>{stage || 'Downloading core packages...'}</span>
            <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {Math.min(100, Math.max(0, percent))}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Python download progress"
            style={{
              width: '100%',
              height: '0.625rem',
              backgroundColor: 'var(--surface-highlight)',
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid var(--border-neutral)',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--ink)',
                width: `${Math.min(100, Math.max(5, percent))}%`,
                transition: 'width 200ms ease',
              }}
            />
          </div>
        </div>

        {/* Debugging Tip Card */}
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--ink)' }}>
            <span aria-hidden="true">💡</span>
            <span>Debugging tip while you wait</span>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-caption)', color: 'var(--ink-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{currentTip}"
          </p>
        </div>

        {/* Dismiss action */}
        {onDismiss && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-1)' }}>
            <button
              type="button"
              onClick={onDismiss}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-neutral)',
                color: 'var(--ink-muted)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              Run in background
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
