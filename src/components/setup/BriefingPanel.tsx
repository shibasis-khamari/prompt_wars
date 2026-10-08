import React from 'react';
import { Button } from '../ui/Button';

export interface BriefingMeta {
  name: string;
  description: string;
  size: string;
  xp: number;
  hintCost: number;
  bugExample: string;
}

export const DIFFICULTY_METADATA: Record<number, BriefingMeta> = {
  1: {
    name: 'Novice',
    description: 'Short functions with basic operators and loop conditions.',
    size: '5–10 lines',
    xp: 10,
    hintCost: 1,
    bugExample: 'Off-by-one in range iteration',
  },
  2: {
    name: 'Easy',
    description: 'Conditionals, lists, and basic string transformations.',
    size: '10–15 lines',
    xp: 20,
    hintCost: 2,
    bugExample: 'Inverted boolean check in guard clause',
  },
  3: {
    name: 'Medium',
    description: 'Dictionaries, nested iteration, and algorithmic logic.',
    size: '15–25 lines',
    xp: 35,
    hintCost: 3,
    bugExample: 'State key overwritten inside accumulator loop',
  },
  4: {
    name: 'Hard',
    description: 'Recursive state accumulation and boundary edge cases.',
    size: '25–40 lines',
    xp: 50,
    hintCost: 5,
    bugExample: 'Base case returns stale accumulator reference',
  },
  5: {
    name: 'Expert',
    description: 'Complex data structures and algorithmic optimization.',
    size: '40+ lines',
    xp: 80,
    hintCost: 8,
    bugExample: 'In-place array mutation during iteration',
  },
};

export interface BriefingPanelProps {
  difficulty: number;
  onStartHunting: () => void;
  isLoading?: boolean;
}

export const BriefingPanel: React.FC<BriefingPanelProps> = ({
  difficulty,
  onStartHunting,
  isLoading = false,
}) => {
  const meta = DIFFICULTY_METADATA[difficulty] || DIFFICULTY_METADATA[2];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        gap: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <div
            style={{
              fontSize: 'var(--text-caption)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink-muted)',
              marginBottom: '2px',
            }}
          >
            Session briefing
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Level {difficulty}: {meta.name}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-muted)',
              marginTop: 'var(--space-1)',
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            {meta.description}
          </p>
        </div>

        {/* Live specification rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ink-muted)' }}>Program size</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>
              {meta.size}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ink-muted)' }}>XP reward</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--diagnostic-pass)' }}>
              +{meta.xp} XP
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ink-muted)' }}>Hint penalty</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--diagnostic-warn)' }}>
              -{meta.hintCost} XP per hint
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-neutral)',
              paddingTop: 'var(--space-2)',
              marginTop: 'var(--space-1)',
            }}
          >
            <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: 'var(--text-caption)' }}>
              Typical bug pattern:
            </span>
            <span style={{ color: 'var(--ink)', fontWeight: 500, fontStyle: 'italic' }}>
              {meta.bugExample}
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={onStartHunting}
        isLoading={isLoading}
      >
        Start hunting
      </Button>
    </div>
  );
};
