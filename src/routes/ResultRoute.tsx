import React from 'react';
import { Puzzle } from '../data/puzzle';
import { ResultWinView } from '../components/result/ResultWinView';
import { ResultSurrenderView } from '../components/result/ResultSurrenderView';
import { Button } from '../components/ui/Button';

export interface ResultRouteProps {
  puzzle: Puzzle;
  learnerCode: string;
  isWin: boolean;
  isGivenUp?: boolean;
  earnedXP?: number;
  newRank?: string;
  isRankUp?: boolean;
  onPlayNext: () => void;
  onTryAgain?: () => void;
  onPracticeTopic?: (topic: string) => void;
  onViewJournal?: () => void;
}

export const ResultRoute: React.FC<ResultRouteProps> = ({
  puzzle,
  learnerCode,
  isWin,
  isGivenUp = false,
  earnedXP = 0,
  newRank,
  isRankUp = false,
  onPlayNext,
  onTryAgain,
  onPracticeTopic,
  onViewJournal,
}) => {
  return (
    <main
      id="main-content"
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {isWin ? (
        <ResultWinView
          puzzle={puzzle}
          learnerCode={learnerCode}
          earnedXP={earnedXP}
          newRank={newRank}
          isRankUp={isRankUp}
          onNextBug={onPlayNext}
          onPracticeTopic={onPracticeTopic}
          onViewJournal={onViewJournal}
        />
      ) : isGivenUp ? (
        <ResultSurrenderView
          puzzle={puzzle}
          onTrySimilar={onPlayNext}
          onViewJournal={onViewJournal}
        />
      ) : (
        /* Diagnostic test run failure fallback view */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-error-subtle)',
                color: 'var(--diagnostic-error)',
                border: '1px solid var(--diagnostic-error)',
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              ✕
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Tests failed
            </h2>
          </div>

          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
            <strong>What happened: </strong>
            Your submitted fix produced unexpected output or threw an error on one or more test cases.
          </p>

          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-neutral)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>
              What to do next:
            </strong>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
              Click "Try again" to return to the editor. Inspect the test case outputs and bug line hint to isolate the flaw.
            </p>
          </div>

          {onTryAgain && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
              <Button variant="primary" onClick={onTryAgain}>
                Try again
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
