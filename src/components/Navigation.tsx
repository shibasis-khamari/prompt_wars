import React from 'react';
import { StreakState } from '../shared/streak';
import { SkillStore } from '../storage/skillStore';

export type RouteId = 'setup' | 'puzzle' | 'result' | 'skills' | 'journal';

export interface NavigationProps {
  activeRoute: RouteId;
  onNavigate: (route: RouteId) => void;
  streak?: StreakState;
  userXP?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeRoute,
  onNavigate,
  streak,
  userXP,
}) => {
  // Acceptance criterion: nav links are Play, Skill map, and Journal only!
  const navRoutes: { id: RouteId; label: string }[] = [
    { id: 'setup', label: 'Play' },
    { id: 'skills', label: 'Skill map' },
    { id: 'journal', label: 'Journal' },
  ];

  const currentStreak = streak?.currentStreak ?? 0;
  const xp = userXP ?? SkillStore.getUserXP();

  return (
    <nav
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderBottom: '1px solid var(--border-neutral)',
        padding: '0.625rem 1rem',
      }}
      aria-label="Main navigation"
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate('setup')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
            aria-label="Bug Hunt Arena play"
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
              }}
            >
              Bug Hunt Arena
            </span>
          </button>

          <ul
            style={{
              display: 'flex',
              gap: 'var(--space-1)',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
            role="tablist"
          >
            {navRoutes.map((r) => {
              const isActive =
                activeRoute === r.id ||
                (r.id === 'setup' && (activeRoute === 'puzzle' || activeRoute === 'result'));
              return (
                <li key={r.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onNavigate(r.id)}
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${isActive ? 'var(--ink)' : 'transparent'}`,
                      backgroundColor: isActive ? 'var(--ink)' : 'transparent',
                      color: isActive ? 'var(--surface-panel)' : 'var(--ink-muted)',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {r.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Gamification chips: Streak and XP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-neutral)',
              fontSize: 'var(--text-caption)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
            }}
            title={`Current streak: ${currentStreak} days`}
            aria-label={`Streak: ${currentStreak} days`}
          >
            <span aria-hidden="true">🔥</span>
            <span style={{ fontWeight: 700 }}>{currentStreak}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-pass-subtle)',
              border: '1px solid var(--diagnostic-pass)',
              fontSize: 'var(--text-caption)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--diagnostic-pass)',
            }}
            title={`Total experience: ${xp} XP`}
            aria-label={`Experience: ${xp} XP`}
          >
            <span aria-hidden="true">⚡</span>
            <span style={{ fontWeight: 700 }}>{xp} XP</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
