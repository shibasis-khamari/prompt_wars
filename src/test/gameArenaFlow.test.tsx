import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameArena } from '../routes/GameArena';
import { PuzzleRoute } from '../routes/PuzzleRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SelectingPuzzleModal } from '../components/SelectingPuzzleModal';
import seedPuzzles from '../data/seed.json';

describe('GameArena & PuzzleRoute Flow Stability', () => {
  it('renders PuzzleRoute with full seed puzzle without crashing', () => {
    const puzzle = seedPuzzles[0] as any;
    render(
      <PuzzleRoute
        puzzle={puzzle}
        userCode={puzzle.buggyCode}
        onChangeCode={() => {}}
        onSubmitWin={() => {}}
        onGiveUp={() => {}}
        onResetCode={() => {}}
        unlockedHintIndices={[]}
        onUnlockHint={() => {}}
        totalHintCostDeducted={0}
      />
    );
    expect(screen.getByText(puzzle.title)).toBeInTheDocument();
  });

  it('renders PuzzleRoute safely when hints array is omitted (sanitized dynamic puzzle)', () => {
    const sanitized = { ...seedPuzzles[0] } as any;
    delete sanitized.hints;

    render(
      <PuzzleRoute
        puzzle={sanitized}
        userCode={sanitized.buggyCode}
        onChangeCode={() => {}}
        onSubmitWin={() => {}}
        onGiveUp={() => {}}
        onResetCode={() => {}}
        unlockedHintIndices={[]}
        onUnlockHint={() => {}}
        totalHintCostDeducted={0}
      />
    );

    expect(screen.getByText(sanitized.title)).toBeInTheDocument();
    expect(screen.getByText(/hint ladder \(0\/3\)/i)).toBeInTheDocument();
  });

  it('successfully transitions from Setup to Puzzle when Start hunting is pressed with sanitized API puzzle', async () => {
    const sanitizedApiPuzzle = {
      id: 'dynamic-unseen-1',
      language: 'python',
      difficulty: 2,
      topic: 'Conditionals',
      bugType: 'Wrong comparison',
      title: 'Dynamic Arena Puzzle',
      theme: 'Testing',
      buggyCode: 'def verify(): return False',
      tests: [{ id: 't1', description: 'check truthy', input: [], expectedOutput: true }],
      symptomOutput: 'Returned False instead of True',
      timeLimitMs: 3000,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sanitizedApiPuzzle,
    } as any);

    render(<GameArena />);
    const startBtns = screen.getAllByRole('button', { name: /start hunting/i });
    fireEvent.click(startBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Dynamic Arena Puzzle')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('ErrorBoundary renders friendly error UI if a child component throws an error', () => {
    const BuggyComponent = () => {
      throw new Error('Test rendering crash');
    };

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallbackTitle="Challenge interrupted">
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Challenge interrupted')).toBeInTheDocument();
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to setup/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders SelectingPuzzleModal when loading', () => {
    render(<SelectingPuzzleModal isOpen={true} message="Generating custom challenge..." />);
    expect(screen.getByText('Preparing Your Challenge')).toBeInTheDocument();
    expect(screen.getByText('Generating custom challenge...')).toBeInTheDocument();
  });
});
