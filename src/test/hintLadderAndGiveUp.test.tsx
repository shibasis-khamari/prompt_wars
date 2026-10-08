import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HintLadder, getHintCost } from '../components/HintLadder';
import { GiveUpModal } from '../components/GiveUpModal';
import { ResultRoute } from '../routes/ResultRoute';
import { Puzzle } from '../data/puzzle';

const mockPuzzle: Puzzle = {
  id: 'test-puzzle-diff-4',
  language: 'python',
  difficulty: 4,
  topic: 'Recursion',
  bugType: 'Missing State',
  title: 'Test Route Planner',
  theme: 'Delivery',
  buggyCode: 'def solution(): pass',
  correctCode: 'def solution(): return 42',
  explanation: 'This was a missing recursive parameter state bug.',
  hints: [
    'Look at the recursive call arguments',
    'Notice that fuel is not accumulating',
    'Add distances[current_index] to current_fuel',
  ],
  tests: [{ id: 't1', input: [], expectedOutput: 42 }],
  expectedOutput: 42,
  symptomOutput: 'Returned None instead of 42',
  bugLine: 6,
  timeLimitMs: 3000,
  validated: true,
  createdAt: '2026-10-08T12:00:00.000Z',
};

describe('Hint Ladder: Cost Calculation & Order', () => {
  it('calculates hint cost correctly based on puzzle difficulty (1, 2, 3, 5, 8)', () => {
    expect(getHintCost(1)).toBe(1);
    expect(getHintCost(2)).toBe(2);
    expect(getHintCost(3)).toBe(3);
    expect(getHintCost(4)).toBe(5);
    expect(getHintCost(5)).toBe(8);
  });

  it('shows cost before confirming and reveals hints in sequential order', () => {
    const handleUnlockHint = vi.fn();

    // Render with 0 hints unlocked (Level 4 -> cost 5 points)
    const { rerender } = render(
      <HintLadder
        hints={mockPuzzle.hints}
        difficulty={4}
        unlockedHintIndices={[]}
        onUnlockHint={handleUnlockHint}
        totalCostDeducted={0}
      />
    );

    // Initial state: "Unlock hint 1 (5 points)"
    const unlockBtn = screen.getByRole('button', { name: /unlock hint 1 \(5 points\)/i });
    expect(unlockBtn).toBeInTheDocument();

    // Click button: reveals confirmation dialog showing cost BEFORE unlocking
    fireEvent.click(unlockBtn);
    expect(screen.getByText(/unlock hint 1 for/i)).toBeInTheDocument();
    expect(screen.getByText(/5 points/i)).toBeInTheDocument();

    // Click confirm unlock
    const confirmBtn = screen.getByRole('button', { name: /confirm unlock/i });
    fireEvent.click(confirmBtn);

    expect(handleUnlockHint).toHaveBeenCalledWith(0, 5);

    // Re-render with Hint 1 unlocked
    rerender(
      <HintLadder
        hints={mockPuzzle.hints}
        difficulty={4}
        unlockedHintIndices={[0]}
        onUnlockHint={handleUnlockHint}
        totalCostDeducted={5}
      />
    );

    // Hint 1 is now displayed
    expect(screen.getByText(mockPuzzle.hints[0])).toBeInTheDocument();
    expect(screen.getByText(/total cost: -5 pts/i)).toBeInTheDocument();

    // Next button offers Hint 2
    expect(screen.getByRole('button', { name: /unlock hint 2 \(5 points\)/i })).toBeInTheDocument();
  });

  it('ensures unrevealed hints are strictly not rendered in the DOM beforehand', () => {
    // When only Hint 1 (index 0) is unlocked
    render(
      <HintLadder
        hints={mockPuzzle.hints}
        difficulty={4}
        unlockedHintIndices={[0]}
        onUnlockHint={() => {}}
        totalCostDeducted={5}
      />
    );

    // Revealed hint is in the DOM
    expect(screen.getByText(mockPuzzle.hints[0])).toBeInTheDocument();

    // Unrevealed hints (Hint 2 and Hint 3) MUST NOT be in the DOM
    expect(screen.queryByText(mockPuzzle.hints[1])).not.toBeInTheDocument();
    expect(screen.queryByText(mockPuzzle.hints[2])).not.toBeInTheDocument();
  });

  it('renders safely when hints array is undefined and displays unlockedHints map', () => {
    const handleUnlockHint = vi.fn();
    render(
      <HintLadder
        hints={undefined}
        difficulty={2}
        unlockedHintIndices={[0]}
        onUnlockHint={handleUnlockHint}
        totalCostDeducted={2}
        unlockedHints={{ 0: 'Dynamic fetched hint text' }}
      />
    );

    expect(screen.getByText(/hint ladder \(1\/3\)/i)).toBeInTheDocument();
    expect(screen.getByText('Dynamic fetched hint text')).toBeInTheDocument();
  });
});

describe('Give Up Option', () => {
  it('asks for confirmation before surrendering', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <GiveUpModal
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText(/give up on this puzzle\?/i)).toBeInTheDocument();
    expect(screen.getByText(/0 xp/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm give up/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders explanation and correct code with 0 XP when puzzle is surrendered', () => {
    render(
      <ResultRoute
        puzzle={mockPuzzle}
        learnerCode="def solution(): pass"
        isWin={false}
        isGivenUp={true}
        onPlayNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    expect(screen.getByText(/puzzle surrendered/i)).toBeInTheDocument();
    expect(screen.getByText(/0 xp is awarded/i)).toBeInTheDocument();
    expect(screen.getByText(mockPuzzle.correctCode)).toBeInTheDocument();
    expect(screen.getByText(mockPuzzle.explanation)).toBeInTheDocument();
  });
});
