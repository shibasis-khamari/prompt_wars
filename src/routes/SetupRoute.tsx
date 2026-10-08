import React, { useState } from 'react';
import { SupportedLanguage } from '../data/puzzle';
import { PuzzleSelectionOptions } from '../services/puzzleSelector';
import { SetupForm } from '../components/setup/SetupForm';
import { BriefingPanel, DIFFICULTY_METADATA } from '../components/setup/BriefingPanel';
import { DailyBugStrip } from '../components/setup/DailyBugStrip';
import { WarmUpModal } from '../components/WarmUpModal';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

export interface SetupRouteProps {
  onStartPuzzle: (options: PuzzleSelectionOptions) => void;
  onStartDailyBug?: (language: SupportedLanguage) => void;
  hasPlayedToday?: boolean;
  fallbackNotice?: string | null;
}

export const SetupRoute: React.FC<SetupRouteProps> = ({
  onStartPuzzle,
  onStartDailyBug,
  hasPlayedToday,
  fallbackNotice,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [mode, setMode] = useState<'mixed' | 'topic'>('mixed');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showWarmUpModal, setShowWarmUpModal] = useState<boolean>(false);

  const proceedWithLaunch = (levelToLaunch: number) => {
    onStartPuzzle({
      language,
      difficulty: levelToLaunch,
      mode,
      topic: mode === 'topic' ? selectedTopic : null,
    });
  };

  const handleStartClick = () => {
    if (difficulty >= 4) {
      setShowWarmUpModal(true);
    } else {
      proceedWithLaunch(difficulty);
    }
  };

  const currentDiffMeta = DIFFICULTY_METADATA[difficulty] || DIFFICULTY_METADATA[2];

  return (
    <main
      id="main-content"
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '0 0 var(--space-1) 0',
            letterSpacing: '-0.02em',
          }}
        >
          Hunt Bugs
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--ink-muted)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Configure your diagnostic practice session or tackle today's Daily Bug.
        </p>
      </div>

      {fallbackNotice && (
        <Alert type="warning" title="Difficulty adjusted">
          {fallbackNotice}
        </Alert>
      )}

      {/* Main 2-column layout on desktop, stacked on mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'stretch',
        }}
      >
        <SetupForm
          language={language}
          onChangeLanguage={setLanguage}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          mode={mode}
          onChangeMode={setMode}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />

        <BriefingPanel
          difficulty={difficulty}
          onStartHunting={handleStartClick}
        />
      </div>

      {/* Full-width Daily Bug strip */}
      {onStartDailyBug && (
        <DailyBugStrip
          language={language}
          onPlayDailyBug={onStartDailyBug}
          hasPlayedToday={Boolean(hasPlayedToday)}
        />
      )}

      {/* Mobile-only sticky bottom bar for quick start */}
      <div
        className="setup-mobile-actions-bar"
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--surface-panel)',
          borderTop: '1px solid var(--border-neutral)',
          padding: 'var(--space-3) var(--space-4)',
          margin: 'var(--space-4) -1rem -1rem -1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          zIndex: 40,
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            Level {difficulty} ({currentDiffMeta.name})
          </span>
          <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--diagnostic-pass)' }}>
            +{currentDiffMeta.xp} XP
          </span>
        </div>
        <Button variant="primary" onClick={handleStartClick}>
          Start hunting
        </Button>
      </div>

      <WarmUpModal
        isOpen={showWarmUpModal}
        targetLevel={difficulty}
        onAcceptWarmUp={() => {
          setShowWarmUpModal(false);
          proceedWithLaunch(difficulty);
        }}
        onDeclineWarmUp={() => {
          setShowWarmUpModal(false);
          setDifficulty(difficulty - 1);
          proceedWithLaunch(difficulty - 1);
        }}
      />
    </main>
  );
};
