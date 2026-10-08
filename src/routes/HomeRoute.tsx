import React from 'react';
import { HeroBugSnippet } from '../components/HeroBugSnippet';
import { Button } from '../components/ui/Button';
import { StreakStore } from '../storage/streakStore';

export interface HomeRouteProps {
  onPlayGuest: () => void;
  onNavigateSignup: () => void;
  onNavigateLogin: () => void;
}

export const HomeRoute: React.FC<HomeRouteProps> = ({
  onPlayGuest,
  onNavigateSignup,
}) => {
  const currentStreak = StreakStore.getStreak().currentStreak;

  return (
    <main id="main-content" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1120px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section
        aria-label="Introduction"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          alignItems: 'center',
          marginBottom: 'var(--space-12)',
        }}
      >
        <div style={{ maxWidth: '64ch' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--ink)',
              margin: '0 0 var(--space-4) 0',
              letterSpacing: '-0.025em',
            }}
          >
            Find the bug in 8 lines of code.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.125rem',
              color: 'var(--ink-muted)',
              lineHeight: 1.6,
              margin: '0 0 var(--space-6) 0',
            }}
          >
            Every puzzle has one real flaw and a fix of a line or two. Read the program, inspect the
            failing output, and test your diagnostic instinct.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={onPlayGuest}>
              Play as guest
            </Button>
            <Button variant="secondary" onClick={onNavigateSignup}>
              Create account
            </Button>
          </div>
        </div>

        {/* Hero Code Snippet */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <HeroBugSnippet />
        </div>
      </section>

      {/* How It Works (Sequential 1, 2, 3) */}
      <section
        aria-label="How it works"
        style={{
          marginBottom: 'var(--space-12)',
          borderTop: '1px solid var(--border-neutral)',
          paddingTop: 'var(--space-8)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h2)',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: 'var(--space-6)',
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ borderLeft: '3px solid var(--ink)', paddingLeft: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', fontWeight: 600 }}>
              01
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', margin: '0.25rem 0 0.5rem 0', color: 'var(--ink)' }}>
              Pick a language and level
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Choose Python, JavaScript, Java, C, or C++ across five calibrated difficulty tiers.
            </p>
          </div>

          <div style={{ borderLeft: '3px solid var(--diagnostic-error)', paddingLeft: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--diagnostic-error)', fontWeight: 600 }}>
              02
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', margin: '0.25rem 0 0.5rem 0', color: 'var(--ink)' }}>
              Hunt the bug
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Inspect expected output beside actual results, identify the failure point, and apply the fix.
            </p>
          </div>

          <div style={{ borderLeft: '3px solid var(--diagnostic-pass)', paddingLeft: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--diagnostic-pass)', fontWeight: 600 }}>
              03
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', margin: '0.25rem 0 0.5rem 0', color: 'var(--ink)' }}>
              Learn why it happened
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Review a side-by-side diff against the clean reference repair and read the breakdown.
            </p>
          </div>
        </div>
      </section>

      {/* Fairness & Daily Teaser Grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr)))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-12)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h3)',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 var(--space-2) 0',
            }}
          >
            Fairness guarantee
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            Every puzzle is verified automatically by an 8-point suite before publication. Each bug is
            deterministic, contains exactly one defect, and requires at most 1 to 2 changed lines to fix.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h3)',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 var(--space-2) 0',
            }}
          >
            Daily Bug and streak
          </h2>
          <p style={{ margin: '0 0 var(--space-4) 0', color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            Solve today’s community puzzle to maintain your debugging streak. One attempt per day counts toward the leaderboard.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.25rem' }}>🔥</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--ink)', fontSize: 'var(--text-sm)' }}>
              Current streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </section>

      {/* Languages & Levels */}
      <section
        style={{
          borderTop: '1px solid var(--border-neutral)',
          paddingTop: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
            Languages:
          </span>{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            Python · JavaScript · Java · C · C++
          </span>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>
            Skill tiers:
          </span>{' '}
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            Level 1 (Novice) to Level 5 (Master)
          </span>
        </div>
      </section>
    </main>
  );
};
