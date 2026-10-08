import React, { useState } from 'react';
import { Puzzle, PuzzleDifficulty } from '../types/puzzle';
import { generateNewPuzzle } from '../services/puzzleGenerator';

export interface PuzzleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPuzzleGenerated: (puzzle: Puzzle) => void;
}

export const PuzzleGeneratorModal: React.FC<PuzzleGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPuzzleGenerated,
}) => {
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const newPuzzle = await generateNewPuzzle({ topic, difficulty });
      onPuzzleGenerated(newPuzzle);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a valid puzzle.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="generator-modal-title"
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-neutral)', paddingBottom: 'var(--space-3)' }}>
          <h2
            id="generator-modal-title"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h3)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Generate AI puzzle
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="topic-input" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)', marginBottom: 'var(--space-1)' }}>
              Topic or concept
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Strings, Arrays, Recursion"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-neutral)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label htmlFor="difficulty-select" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)', marginBottom: 'var(--space-1)' }}>
              Difficulty level
            </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as PuzzleDifficulty)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border-neutral)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--surface-error-subtle)',
                border: '1px solid var(--diagnostic-error)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                color: 'var(--diagnostic-error)',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-neutral)',
                color: 'var(--ink)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--ink)',
                border: '1px solid var(--ink)',
                color: 'var(--surface-panel)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                opacity: isGenerating ? 0.6 : 1,
              }}
            >
              {isGenerating ? 'Generating and validating...' : 'Generate puzzle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
