import React, { useState } from 'react';
import { Puzzle, TestCase } from '../data/puzzle';
import { CodeEditor } from '../components/CodeEditor';
import { HintLadder } from '../components/HintLadder';
import { GiveUpModal } from '../components/GiveUpModal';
import { PuzzleTopBar } from '../components/puzzle/PuzzleTopBar';
import { SymptomBlock } from '../components/puzzle/SymptomBlock';
import { PuzzleActionBar } from '../components/puzzle/PuzzleActionBar';
import { TestResultsList, TestRunResult } from '../components/puzzle/TestResultsList';
import { Tabs } from '../components/ui/Tabs';
import { runPuzzleCheck } from '../services/unifiedRunner';

export interface PuzzleRouteProps {
  puzzle: Puzzle;
  userCode: string;
  onChangeCode: (code: string) => void;
  onSubmitWin: (learnerCode: string) => void;
  onGiveUp: () => void;
  onResetCode: () => void;
  unlockedHintIndices: number[];
  onUnlockHint: (index: number, cost: number) => void;
  totalHintCostDeducted: number;
  unlockedHints?: Record<number, string>;
}

export const PuzzleRoute: React.FC<PuzzleRouteProps> = ({
  puzzle,
  userCode,
  onChangeCode,
  onSubmitWin,
  onGiveUp,
  onResetCode,
  unlockedHintIndices,
  onUnlockHint,
  totalHintCostDeducted,
  unlockedHints,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [testResults, setTestResults] = useState<TestRunResult[]>([]);
  const [submissionFailure, setSubmissionFailure] = useState<{
    failedTest: TestCase;
    actualOutput?: unknown;
  } | null>(null);
  const [mobileTab, setMobileTab] = useState<'brief' | 'code' | 'results'>('code');

  const executeCheck = async () => {
    const check = await runPuzzleCheck(puzzle, userCode);
    if (check.testResults) {
      setTestResults(
        check.testResults.map((r, i) => ({
          testId: r.testId || `t${i + 1}`,
          description: r.description || `Test case ${i + 1}`,
          input: [],
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          passed: r.passed,
          error: r.error,
        }))
      );
    }
    return check;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setSubmissionFailure(null);
    try {
      await executeCheck();
      setMobileTab('results');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionFailure(null);
    try {
      const check = await executeCheck();
      if (check.passed) {
        onSubmitWin(userCode);
      } else {
        setSubmissionFailure({
          failedTest: {
            id: check.failedTest?.id,
            description: check.failedTest?.description || 'Test assertion',
            input: check.failedTest?.input || [],
            expectedOutput: check.failedTest?.expectedOutput,
          },
          actualOutput: check.failedTest?.actualOutput,
        });
        setMobileTab('results');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentXPAtStake = Math.max(5, (puzzle.difficulty * 15) - totalHintCostDeducted);

  return (
    <main
      id="main-content"
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <PuzzleTopBar puzzle={puzzle} xpAtStake={currentXPAtStake} />

      {/* Mobile viewport tab switcher */}
      <div className="puzzle-mobile-tabs-bar">
        <Tabs
          ariaLabel="Puzzle workspace sections"
          activeTab={mobileTab}
          onChange={(tab) => setMobileTab(tab as 'brief' | 'code' | 'results')}
          tabs={[
            { id: 'brief', label: 'Brief' },
            { id: 'code', label: 'Code editor' },
            { id: 'results', label: 'Test results', badge: (testResults || []).length > 0 ? testResults.length : undefined },
          ]}
        />
      </div>

      {/* Main layout: 2 columns on desktop */}
      <div className="puzzle-layout-grid">
        {/* Left Column: Symptom + Editor + Action Bar */}
        <div
          className="puzzle-col-left"
          style={{
            display: mobileTab !== 'code' && mobileTab !== 'brief' ? 'none' : 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {(mobileTab === 'brief' || mobileTab === 'code') && (
            <SymptomBlock puzzle={puzzle} />
          )}

          <div
            className="puzzle-editor-container"
            style={{
              display: mobileTab === 'brief' ? 'none' : 'block',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-neutral)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <CodeEditor
              value={userCode}
              language={puzzle.language === 'python' ? 'python' : 'javascript'}
              onChange={onChangeCode}
              ariaLabel="Diagnostic code editor"
            />
          </div>

          <div className="puzzle-desktop-actions-bar">
            <PuzzleActionBar
              onRunTests={handleRun}
              onSubmitFix={handleSubmit}
              onResetCode={onResetCode}
              onGiveUp={() => setShowGiveUpModal(true)}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column: Hint Ladder + TestRow results */}
        <div
          className="puzzle-col-right"
          style={{
            display: mobileTab === 'code' ? 'none' : 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <HintLadder
            hints={puzzle.hints}
            difficulty={puzzle.difficulty}
            unlockedHintIndices={unlockedHintIndices}
            onUnlockHint={onUnlockHint}
            totalCostDeducted={totalHintCostDeducted}
            unlockedHints={unlockedHints}
          />

          {submissionFailure && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--surface-error-subtle)',
                border: '1px solid var(--diagnostic-error)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--diagnostic-error)', fontWeight: 700 }}>✕</span>
                <strong style={{ color: 'var(--diagnostic-error)', fontFamily: 'var(--font-heading)' }}>
                  Submission failed
                </strong>
              </div>
              <p style={{ margin: 0, color: 'var(--ink)' }}>
                Your code failed test: <em>{submissionFailure.failedTest.description}</em>.
              </p>
            </div>
          )}

          <TestResultsList tests={puzzle.tests} testResults={testResults} />
        </div>
      </div>

      {/* Sticky action bar on mobile */}
      <div
        className="puzzle-mobile-actions-bar"
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--surface-panel)',
          borderTop: '1px solid var(--border-neutral)',
          padding: 'var(--space-3) var(--space-4)',
          margin: 'var(--space-4) -1rem -1rem -1rem',
          zIndex: 40,
        }}
      >
        <PuzzleActionBar
          onRunTests={handleRun}
          onSubmitFix={handleSubmit}
          onResetCode={onResetCode}
          onGiveUp={() => setShowGiveUpModal(true)}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />
      </div>

      <GiveUpModal
        isOpen={showGiveUpModal}
        onConfirm={() => {
          setShowGiveUpModal(false);
          onGiveUp();
        }}
        onCancel={() => setShowGiveUpModal(false)}
      />
    </main>
  );
};
