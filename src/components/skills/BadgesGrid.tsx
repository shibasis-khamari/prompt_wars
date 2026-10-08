import React from 'react';
import { BADGES, BadgeDefinition } from '../../config/badges';
import { Tag } from '../ui/Tag';

export interface BadgesGridProps {
  unlockedBadgeIds: string[];
}

export const BadgesGrid: React.FC<BadgesGridProps> = ({ unlockedBadgeIds }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-3)',
      }}
    >
      {BADGES.map((b: BadgeDefinition) => {
        const isUnlocked = unlockedBadgeIds.includes(b.id);

        return (
          <div
            key={b.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              padding: 'var(--space-4)',
              backgroundColor: isUnlocked ? 'var(--surface-panel)' : 'var(--surface)',
              border: `1px ${isUnlocked ? 'solid' : 'dashed'} var(--border-neutral)`,
              borderRadius: 'var(--radius-md)',
              opacity: isUnlocked ? 1 : 0.75,
              transition: 'opacity 120ms ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }} aria-hidden="true">
                {b.icon}
              </span>
              <Tag
                label={isUnlocked ? 'Unlocked' : 'Locked'}
                variant={isUnlocked ? 'pass' : 'muted'}
                size="sm"
              />
            </div>

            <div>
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: isUnlocked ? 'var(--ink)' : 'var(--ink-muted)',
                  margin: 0,
                }}
              >
                {b.title}
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--ink-muted)',
                  margin: '4px 0 0 0',
                  lineHeight: 1.45,
                }}
              >
                {isUnlocked ? b.description : `How to earn: ${b.description}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
