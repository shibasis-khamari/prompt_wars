import React from 'react';
import { Puzzle } from '../../data/puzzle';
import { Button } from '../ui/Button';
import { DiffView } from '../ui/DiffView';
import { SegmentedProgress } from '../ui/SegmentedProgress';

export interface ResultWinViewProps {
  puzzle: Puzzle;
  learnerCode: string;
  earnedXP: number;
  newRank?: string;
  isRankUp?: boolean;
  onNextBug: () => void;
  onPracticeTopic?: (topic: string) => void;
  onViewJournal?: () => void;
}

export const ResultWinView: React.FC<ResultWinViewProps> = ({
  puzzle,
  learnerCode,
  earnedXP,
  newRank,
  isRankUp = false,
  onNextBug,
  onPracticeTopic,
  onViewJournal,
}) => {
  const baseXP = puzzle.difficulty * 15;
  const hintDeductions = Math.max(0, baseXP - earnedXP);

  // Derive three structured diagnostic takeaways from explanation
  const explanation = puzzle.explanation || 'The fix successfully addressed the logic defect.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      {/* 1. Headline & XP Breakdown */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          borderBottom: '1px solid var(--border-neutral)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-pass-subtle)',
                color: 'var(--diagnostic-pass)',
                border: '1px solid var(--diagnostic-pass)',
                fontWeight: 700,
                fontSize: '14px',
              }}
              aria-hidden="true"
            >
              ✓
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
              Puzzle solved!
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
            Your submitted code passed 100% of the diagnostic test cases.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            backgroundColor: 'var(--surface-pass-subtle)',
            border: '1px solid var(--diagnostic-pass)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--diagnostic-pass)' }}>
            +{earnedXP} XP Earned
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
            {baseXP} base XP {hintDeductions > 0 ? `- ${hintDeductions} hint cost` : '- 0 hints used'}
          </span>
        </div>
      </div>

      {/* 2. Rank Promotion / Celebration Moment (only motion celebration) */}
      {isRankUp && newRank && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            backgroundColor: 'var(--surface-highlight)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            animation: 'squiggle-pulse 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '2rem' }} aria-hidden="true">🏆</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--ink)' }}>
              Rank promoted!
            </h3>
            <p style={{ margin: '2px 0 var(--space-2) 0', fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
              Your diagnostic skill elevated you to <strong style={{ color: 'var(--ink)' }}>{newRank}</strong>.
            </p>
            <SegmentedProgress value={4} totalSegments={5} ariaLabel="Mastery progress" variant="pass" />
          </div>
        </div>
      )}

      {/* 3. DiffView: Learner's Fix vs Reference Solution */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink)' }}>
          Code comparison
        </h3>
        <DiffView
          originalCode={learnerCode}
          modifiedCode={puzzle.correctCode}
          originalLabel="Your fix"
          modifiedLabel="Reference solution"
        />
      </div>

      {/* 4. Three Short Diagnostic Text Blocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}
        >
          <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-xs, 0.8125rem)', fontWeight: 700, color: 'var(--ink)' }}>
            What went wrong
          </h4>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            {explanation}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}
        >
          <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-xs, 0.8125rem)', fontWeight: 700, color: 'var(--ink)' }}>
            Why it happens
          </h4>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Bugs of type <em>{puzzle.bugType}</em> typically occur when assumptions regarding boundaries or variable lifecycles differ between code author and runtime.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}
        >
          <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-xs, 0.8125rem)', fontWeight: 700, color: 'var(--ink)' }}>
            How to avoid it
          </h4>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Write concise test cases checking boundary inputs, and employ early assertions before transforming mutable state.
          </p>
        </div>
      </div>

      {/* 5. Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--border-neutral)',
          paddingTop: 'var(--space-4)',
        }}
      >
        {onViewJournal && (
          <Button variant="secondary" onClick={onViewJournal}>
            View journal
          </Button>
        )}

        {onPracticeTopic && (
          <Button variant="secondary" onClick={() => onPracticeTopic(puzzle.topic)}>
            Practice this topic
          </Button>
        )}

        <Button variant="primary" onClick={onNextBug}>
          Next bug
        </Button>
      </div>
    </div>
  );
};
