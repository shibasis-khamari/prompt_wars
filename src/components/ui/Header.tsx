import React from 'react';

export interface HeaderProps {
  userEmail?: string | null;
  onNavigateHome: () => void;
  onNavigatePlay?: () => void;
  onNavigateSkills?: () => void;
  onNavigateJournal?: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onPlayGuest?: () => void;
  onLogout?: () => void;
  currentPath?: string;
  streak?: number;
  xp?: number;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail,
  onNavigateHome,
  onNavigatePlay,
  onNavigateSkills,
  onNavigateJournal,
  onNavigateLogin,
  onNavigateSignup,
  onPlayGuest,
  onLogout,
  currentPath = '/',
  streak = 0,
  xp = 0,
}) => {
  const isPlayActive = currentPath === '/play' || currentPath === '/setup';
  const isSkillsActive = currentPath === '/skills';
  const isJournalActive = currentPath === '/journal';

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${isActive ? 'var(--ink)' : 'transparent'}`,
    padding: '0.5rem 0.625rem',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
    cursor: 'pointer',
    transition: 'color 120ms ease, border-color 120ms ease',
    textDecoration: 'none',
    marginBottom: '-1px',
  });

  return (
    <header
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderBottom: '1px solid var(--border-neutral)',
        padding: '0.625rem 1rem',
      }}
    >
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 9999,
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.left = '1rem';
          e.currentTarget.style.top = '1rem';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.backgroundColor = 'var(--ink)';
          e.currentTarget.style.color = 'var(--surface-panel)';
          e.currentTarget.style.padding = '0.5rem 1rem';
          e.currentTarget.style.borderRadius = 'var(--radius-sm)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onNavigateHome}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
            aria-label="Bug Hunt Arena home"
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
              }}
            >
              Bug Hunt Arena
            </span>
          </button>

          {/* Nav links: Play, Skill map, Journal only */}
          <nav aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <button
              type="button"
              onClick={onNavigatePlay || onPlayGuest}
              style={navItemStyle(isPlayActive)}
              aria-current={isPlayActive ? 'page' : undefined}
            >
              Play
            </button>
            <button
              type="button"
              onClick={onNavigateSkills}
              style={navItemStyle(isSkillsActive)}
              aria-current={isSkillsActive ? 'page' : undefined}
            >
              Skill map
            </button>
            <button
              type="button"
              onClick={onNavigateJournal}
              style={navItemStyle(isJournalActive)}
              aria-current={isJournalActive ? 'page' : undefined}
            >
              Journal
            </button>
          </nav>
        </div>

        {/* Gamification chips & Account controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
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
            title={`Current streak: ${streak} days`}
            aria-label={`Streak: ${streak} days`}
          >
            <span aria-hidden="true">🔥</span>
            <span style={{ fontWeight: 700 }}>{streak}</span>
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

          <nav aria-label="Account navigation" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {userEmail ? (
              <>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
                  {userEmail}
                </span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-neutral)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.375rem 0.75rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    Log out
                  </button>
                )}
              </>
            ) : (
              <>
                {currentPath !== '/login' && (
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.375rem 0.625rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    Log in
                  </button>
                )}
                {currentPath !== '/signup' && (
                  <button
                    type="button"
                    onClick={onNavigateSignup}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-neutral)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.375rem 0.75rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    Create account
                  </button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
