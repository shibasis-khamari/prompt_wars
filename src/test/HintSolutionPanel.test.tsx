import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HintSolutionPanel } from '../components/HintSolutionPanel';
import { Puzzle } from '../types/puzzle';

const dummyPuzzle: Puzzle = {
  id: 'p1',
  title: 'Dummy',
  description: 'Desc',
  difficulty: 'easy',
  category: 'Strings',
  buggyCode: 'function solution() {}',
  correctCode: 'function solution() { return true; }',
  explanation: 'Hidden Secret Explanation',
  hints: ['First hint statement'],
  testCases: [],
};

describe('Rule 4: Hint & Solution Panel Security', () => {
  it('hides correct code and explanation when puzzle status is unsolved', () => {
    render(
      <HintSolutionPanel
        puzzle={dummyPuzzle}
        status="unsolved"
        unlockedHintIndices={[]}
        solutionRevealed={false}
        onUnlockHint={() => {}}
        onGiveUp={() => {}}
      />
    );

    expect(screen.queryByText('Hidden Secret Explanation')).not.toBeInTheDocument();
    expect(screen.getByText(/correct code and explanation are locked/i)).toBeInTheDocument();
  });

  it('reveals correct code and explanation when puzzle status is solved', () => {
    render(
      <HintSolutionPanel
        puzzle={dummyPuzzle}
        status="solved"
        unlockedHintIndices={[]}
        solutionRevealed={false}
        onUnlockHint={() => {}}
        onGiveUp={() => {}}
      />
    );

    expect(screen.getByText('Hidden Secret Explanation')).toBeInTheDocument();
    expect(screen.getByText('function solution() { return true; }')).toBeInTheDocument();
  });

  it('triggers onGiveUp when Give up button is clicked', () => {
    const handleGiveUp = vi.fn();
    render(
      <HintSolutionPanel
        puzzle={dummyPuzzle}
        status="unsolved"
        unlockedHintIndices={[]}
        solutionRevealed={false}
        onUnlockHint={() => {}}
        onGiveUp={handleGiveUp}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /give up and reveal solution/i }));
    expect(handleGiveUp).toHaveBeenCalledTimes(1);
  });
});
