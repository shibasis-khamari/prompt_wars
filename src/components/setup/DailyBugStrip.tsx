import React from 'react';
import { SupportedLanguage } from '../../data/puzzle';
import { getLocalDateString } from '../../services/dailyBug';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';

export interface DailyBugStripProps {
  language: SupportedLanguage;
  onPlayDailyBug: (language: SupportedLanguage) => void;
  hasPlayedToday: boolean;
}

export const DailyBugStrip: React.FC<DailyBugStripProps> = ({
  language,
  onPlayDailyBug,
  hasPlayedToday,
}) => {
  const localDateStr = getLocalDateString();
  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const languageLabel = language === 'javascript' ? 'JavaScript' : 'Python';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Tag label="Daily Bug" variant="default" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-caption)',
              color: 'var(--ink-muted)',
            }}
            title={localDateStr}
          >
            {formattedDate}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            {languageLabel} • Level 2
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-muted)' }}>
            (Same puzzle for all learners today)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {hasPlayedToday ? (
          <Tag label="Completed today" variant="pass" icon="✓" />
        ) : (
          <Button
            variant="secondary"
            onClick={() => onPlayDailyBug(language)}
          >
            Play Daily Bug
          </Button>
        )}
      </div>
    </div>
  );
};
