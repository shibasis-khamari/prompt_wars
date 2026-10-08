import React from 'react';
import { SupportedLanguage } from '../data/puzzle';
import { getLocalDateString } from '../services/dailyBug';

export interface DailyBugCardProps {
  language: SupportedLanguage;
  onPlayDailyBug: (language: SupportedLanguage) => void;
  hasPlayedToday: boolean;
}

export const DailyBugCard: React.FC<DailyBugCardProps> = ({
  language,
  onPlayDailyBug,
  hasPlayedToday,
}) => {
  const localDateStr = getLocalDateString();
  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const languageLabel = language === 'javascript' ? 'JavaScript' : 'Python';

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-caption)',
              fontWeight: 700,
              backgroundColor: 'var(--ink)',
              color: 'var(--surface-panel)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Daily Bug
          </span>
          <span
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--ink-muted)',
              fontFamily: 'var(--font-mono)',
            }}
            title={localDateStr}
          >
            {formattedDate}
          </span>
        </div>

        {hasPlayedToday ? (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
              backgroundColor: 'var(--surface-pass-subtle)',
              color: 'var(--diagnostic-pass)',
              border: '1px solid var(--diagnostic-pass)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>✓</span> Played today
          </span>
        ) : (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
              backgroundColor: 'var(--surface-highlight)',
              color: 'var(--diagnostic-warn)',
              border: '1px solid var(--diagnostic-warn)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span aria-hidden="true">🔥</span>
            <span>Counts toward streak</span>
          </span>
        )}
      </div>

      <div>
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h3)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 var(--space-1) 0',
          }}
        >
          Today's {languageLabel} Challenge
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-muted)',
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          One synchronized puzzle chosen for everyone by date hash. Only your first attempt each day counts toward the streak.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-1)' }}>
        <button
          type="button"
          onClick={() => onPlayDailyBug(language)}
          style={{
            backgroundColor: 'var(--ink)',
            color: 'var(--surface-panel)',
            border: '1px solid var(--ink)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            transition: 'opacity 120ms ease',
          }}
        >
          <span>Play {languageLabel} Daily Bug</span>
        </button>
      </div>
    </div>
  );
};
