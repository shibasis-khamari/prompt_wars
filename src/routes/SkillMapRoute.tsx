import React, { useState } from 'react';
import { TOPIC_CATALOG } from '../data/topics';
import { SupportedLanguage } from '../data/puzzle';
import { SkillStore } from '../storage/skillStore';
import { BADGES } from '../config/badges';
import { calculateRank } from '../shared/rules';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TopicMasteryRow } from '../components/skills/TopicMasteryRow';
import { BadgesGrid } from '../components/skills/BadgesGrid';

export interface SkillMapRouteProps {
  onPracticeTopic?: (language: SupportedLanguage, topic: string) => void;
}

export const SkillMapRoute: React.FC<SkillMapRouteProps> = ({ onPracticeTopic }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');

  const topics = TOPIC_CATALOG[selectedLanguage] || [];
  const totalXP = SkillStore.getUserXP();
  const currentRank = calculateRank(totalXP);
  const unlockedBadges = SkillStore.getUnlockedBadges();

  // Next rank computation
  const getNextRankInfo = (xp: number) => {
    if (xp < 200) return { nextRank: 'Bug Spotter', xpNeeded: 200 - xp, targetXP: 200 };
    if (xp < 800) return { nextRank: 'Exterminator', xpNeeded: 800 - xp, targetXP: 800 };
    if (xp < 2500) return { nextRank: 'Debug Master', xpNeeded: 2500 - xp, targetXP: 2500 };
    return { nextRank: 'Maximum Rank Achieved', xpNeeded: 0, targetXP: 2500 };
  };

  const nextRankInfo = getNextRankInfo(totalXP);

  // Identify weakest topic in the active language
  let weakestTopic = topics[0]?.topic || '';
  let minLevel = 999;
  topics.forEach((t) => {
    const s = SkillStore.getTopicSkill(selectedLanguage, t.topic);
    if (s.level < minLevel) {
      minLevel = s.level;
      weakestTopic = t.topic;
    }
  });

  const handlePractice = (lang: SupportedLanguage, topic: string) => {
    if (onPracticeTopic) {
      onPracticeTopic(lang, topic);
    }
  };

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
          Skill Map
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-muted)', margin: 0 }}>
          Track diagnostic mastery across language tracks and claim achievement badges.
        </p>
      </div>

      {/* Top Overview Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          padding: 'var(--space-5)',
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-neutral)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
              Learner Rank
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '2px 0 0 0',
              }}
            >
              {currentRank}
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
            <div>
              <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: 'var(--text-caption)' }}>Total XP</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--diagnostic-pass)' }}>
                {totalXP} XP
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: 'var(--text-caption)' }}>Next rank</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-h3)', fontWeight: 600, color: 'var(--ink)' }}>
                {nextRankInfo.xpNeeded > 0 ? `${nextRankInfo.xpNeeded} XP to ${nextRankInfo.nextRank}` : 'Max rank'}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: 'var(--text-caption)' }}>Badges</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--diagnostic-warn)' }}>
                {unlockedBadges.length} / {BADGES.length}
              </span>
            </div>
          </div>
        </div>

        {weakestTopic && (
          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-neutral)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink)',
            }}
          >
            <strong>Suggested next: </strong>
            Focus on <em>{weakestTopic}</em> in {selectedLanguage === 'python' ? 'Python' : 'JavaScript'} (Level {minLevel === 999 ? 1 : minLevel}) to reinforce fundamentals.
          </div>
        )}
      </div>

      {/* Language Tabs & Topic Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-h3)',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Topic mastery
          </h2>

          <SegmentedControl
            ariaLabel="Switch track language"
            value={selectedLanguage}
            onChange={(val) => setSelectedLanguage(val as SupportedLanguage)}
            options={[
              { value: 'python', label: 'Python' },
              { value: 'javascript', label: 'JavaScript' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {topics.map((t) => {
            const skill = SkillStore.getTopicSkill(selectedLanguage, t.topic);
            return (
              <TopicMasteryRow
                key={t.topic}
                language={selectedLanguage}
                topicName={t.topic}
                level={skill.level}
                solvesCount={skill.consecutiveZeroHintSolves}
                onPractice={handlePractice}
              />
            );
          })}
        </div>
      </div>

      {/* Badges Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-h3)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          Badges and achievements
        </h2>
        <BadgesGrid unlockedBadgeIds={unlockedBadges} />
      </div>
    </main>
  );
};
