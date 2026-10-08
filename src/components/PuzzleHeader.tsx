import React from 'react';
import { Puzzle, PuzzleDifficulty } from '../types/puzzle';

export interface PuzzleHeaderProps {
  puzzles: Puzzle[];
  currentPuzzle: Puzzle;
  onSelectPuzzle: (puzzleId: string) => void;
  onOpenGenerator: () => void;
}

export const PuzzleHeader: React.FC<PuzzleHeaderProps> = ({
  puzzles,
  currentPuzzle,
  onSelectPuzzle,
  onOpenGenerator,
}) => {
  const getDifficultyBadgeStyle = (diff: PuzzleDifficulty) => {
    switch (diff) {
      case 'easy':
        return {
          backgroundColor: 'var(--surface-pass-subtle)',
          color: 'var(--diagnostic-pass)',
          border: '1px solid var(--diagnostic-pass)',
        };
      case 'medium':
        return {
          backgroundColor: 'var(--surface-highlight)',
          color: 'var(--diagnostic-warn)',
          border: '1px solid var(--diagnostic-warn)',
        };
      case 'hard':
        return {
          backgroundColor: 'var(--surface-error-subtle)',
          color: 'var(--diagnostic-error)',
          border: '1px solid var(--diagnostic-error)',
        };
      default:
        return {
          backgroundColor: 'var(--surface-highlight)',
          color: 'var(--ink)',
          border: '1px solid var(--border-neutral)',
        };
    }
  };

  return (
    <header
      style={{
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--surface-panel)',
        borderBottom: '1px solid var(--border-neutral)',
        color: 'var(--ink)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Bug Hunt Arena
        </h1>
        <span style={{ color: 'var(--border-neutral)' }}>|</span>
        <label htmlFor="puzzle-select" className="sr-only">
          Select puzzle
        </label>
        <select
          id="puzzle-select"
          value={currentPuzzle.id}
          onChange={(e) => onSelectPuzzle(e.target.value)}
          style={{
            padding: '0.375rem 0.625rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {puzzles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.difficulty})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
          Category: {currentPuzzle.category}
        </span>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            ...getDifficultyBadgeStyle(currentPuzzle.difficulty),
          }}
        >
          Difficulty: Level {currentPuzzle.difficulty}
        </span>
        <button
          type="button"
          onClick={onOpenGenerator}
          style={{
            backgroundColor: 'var(--ink)',
            color: 'var(--surface-panel)',
            border: '1px solid var(--ink)',
            borderRadius: 'var(--radius-md)',
            padding: '0.375rem 0.75rem',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Generate AI puzzle
        </button>
      </div>
    </header>
  );
};
