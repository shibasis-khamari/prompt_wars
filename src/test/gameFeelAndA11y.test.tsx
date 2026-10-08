import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PyodideLoadingModal } from '../components/PyodideLoadingModal';
import { ResultRoute } from '../routes/ResultRoute';
import { JournalRoute } from '../routes/JournalRoute';
import { JournalStore } from '../storage/journalStore';
import { Puzzle } from '../data/puzzle';

const dummyPuzzle: Puzzle = {
  id: 'py-dummy-1',
  language: 'python',
  difficulty: 2,
  topic: 'Loops and conditions',
  bugType: 'Off-by-One',
  title: 'Loop Counter Bug',
  theme: 'Counter Game',
  buggyCode: 'def counter(): pass',
  correctCode: 'def counter(): return 42',
  tests: [{ id: 't1', input: [], expectedOutput: 42 }],
  expectedOutput: 42,
  symptomOutput: 'Returned None',
  bugLine: 1,
  explanation: 'Return statement missing in counter function.',
  hints: ['Area 1', 'Operator', 'Value 42'],
  timeLimitMs: 3000,
  validated: true,
  createdAt: '2026-10-08T00:00:00.000Z',
};

describe('Game Feel, Empty States & Accessibility (A11y)', () => {
  beforeEach(() => {
    JournalStore.clear();
  });

  it('renders Pyodide loading modal with accessible progressbar and helpful tip', () => {
    const handleDismiss = vi.fn();
    render(
      <PyodideLoadingModal
        isOpen={true}
        percent={45}
        stage="Downloading Pyodide core..."
        onDismiss={handleDismiss}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Preparing Python runtime/i)).toBeInTheDocument();
    expect(screen.getByText('Downloading Pyodide core...')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '45');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');

    // Friendly debugging tip is visible
    expect(screen.getByText(/Debugging tip while you wait/i)).toBeInTheDocument();

    // Dismiss button works
    const dismissBtn = screen.getByRole('button', { name: /Run in background/i });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders ResultRoute win state with celebration icon, XP, and rank promotion', () => {
    render(
      <ResultRoute
        puzzle={dummyPuzzle}
        learnerCode="def counter(): return 42"
        isWin={true}
        earnedXP={20}
        newRank="Bug Spotter"
        isRankUp={true}
        onPlayNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    expect(screen.getByText(/Puzzle solved!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+20 XP Earned/i)).toBeInTheDocument();
    expect(screen.getByText(/Rank promoted!/i)).toBeInTheDocument();
    expect(screen.getByText('Bug Spotter')).toBeInTheDocument();
  });

  it('renders ResultRoute surrender and failure states with what happened and what to do next', () => {
    // Failure state
    const { rerender } = render(
      <ResultRoute
        puzzle={dummyPuzzle}
        learnerCode="def counter(): return 0"
        isWin={false}
        onPlayNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    expect(screen.getByText(/Tests failed/i)).toBeInTheDocument();
    expect(screen.getByText(/What happened:/i)).toBeInTheDocument();
    expect(screen.getByText(/What to do next:/i)).toBeInTheDocument();

    // Surrender state
    rerender(
      <ResultRoute
        puzzle={dummyPuzzle}
        learnerCode="def counter(): pass"
        isWin={false}
        isGivenUp={true}
        onPlayNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    expect(screen.getByText(/Puzzle surrendered/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Correct reference code/i })).toBeInTheDocument();
    expect(screen.getByText(/What to do next:/i)).toBeInTheDocument();
  });

  it('renders JournalRoute empty state with what happened and what to do next guidance', () => {
    render(<JournalRoute />);

    expect(screen.getByText(/Your bug journal is currently empty/i)).toBeInTheDocument();
    expect(screen.getByText(/What happened:/i)).toBeInTheDocument();
    expect(screen.getByText(/What to do next:/i)).toBeInTheDocument();
  });

  it('verifies index.css includes prefers-reduced-motion media query and focus indicators', () => {
    const cssPath = path.resolve(__dirname, '../index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('*:focus-visible');
    expect(cssContent).toContain('outline: 2px solid');
  });
});
