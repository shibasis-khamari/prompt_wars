import React, { useState, useEffect } from 'react';
import { Puzzle } from '../../data/puzzle';
import { Tag } from '../ui/Tag';

export interface PuzzleTopBarProps {
  puzzle: Puzzle;
  xpAtStake: number;
}

export const PuzzleTopBar: React.FC<PuzzleTopBarProps> = ({ puzzle, xpAtStake }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzle.id]);

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Tag label={puzzle.language || 'code'} variant="default" />
          <Tag label={`Level ${puzzle.difficulty ?? 1}`} variant="default" />
          <Tag label={puzzle.topic || 'General'} variant="muted" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h3)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '2px 0 0 0',
          }}
        >
          {puzzle.title || 'Diagnostic Puzzle'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink)',
          }}
          title="Session timer"
          aria-label={`Time elapsed: ${formattedTime}`}
        >
          <span aria-hidden="true">⏱</span>
          <span>{formattedTime}</span>
        </div>

        <Tag
          label={`+${xpAtStake} XP at stake`}
          variant="pass"
          icon="⚡"
        />
      </div>
    </div>
  );
};
