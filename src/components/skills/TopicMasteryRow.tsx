import React from 'react';
import { SupportedLanguage } from '../../data/puzzle';
import { SegmentedProgress } from '../ui/SegmentedProgress';
import { Button } from '../ui/Button';

export interface TopicMasteryRowProps {
  language: SupportedLanguage;
  topicName: string;
  level: number;
  solvesCount: number;
  onPractice: (language: SupportedLanguage, topic: string) => void;
}

export const TopicMasteryRow: React.FC<TopicMasteryRowProps> = ({
  language,
  topicName,
  level,
  solvesCount,
  onPractice,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-sm)',
        transition: 'background-color 120ms ease',
      }}
    >
      <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          {topicName}
        </span>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
          {solvesCount} {solvesCount === 1 ? 'puzzle' : 'puzzles'} solved
        </span>
      </div>

      <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <SegmentedProgress
          value={level}
          totalSegments={5}
          ariaLabel={`${topicName} level ${level} of 5`}
          size="md"
        />
        <span
          style={{
            fontSize: 'var(--text-xs, 0.8125rem)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
          }}
        >
          Level {level}/5
        </span>
      </div>

      <div>
        <Button
          variant="secondary"
          onClick={() => onPractice(language, topicName)}
          style={{ fontSize: 'var(--text-xs, 0.8125rem)', padding: '0.375rem 0.75rem' }}
        >
          Practice topic
        </Button>
      </div>
    </div>
  );
};
