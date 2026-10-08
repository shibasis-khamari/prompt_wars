import React from 'react';
import { SupportedLanguage } from '../../data/puzzle';
import { TOPIC_CATALOG } from '../../data/topics';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Slider } from '../ui/Slider';
import { Chip } from '../ui/Chip';

export interface SetupFormProps {
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  difficulty: number;
  onChangeDifficulty: (diff: number) => void;
  mode: 'mixed' | 'topic';
  onChangeMode: (mode: 'mixed' | 'topic') => void;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
}

const DIFFICULTY_STOPS = [
  { value: 1, label: 'Novice' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Expert' },
];

export const SetupForm: React.FC<SetupFormProps> = ({
  language,
  onChangeLanguage,
  difficulty,
  onChangeDifficulty,
  mode,
  onChangeMode,
  selectedTopic,
  onSelectTopic,
}) => {
  const availableTopics = TOPIC_CATALOG[language] || [];

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
      {/* 1. Language Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label
          htmlFor="setup-language-ctrl"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          Language
        </label>
        <SegmentedControl
          ariaLabel="Choose programming language"
          value={language}
          onChange={(val) => {
            onChangeLanguage(val as SupportedLanguage);
            onSelectTopic(null);
          }}
          options={[
            { value: 'python', label: 'Python' },
            { value: 'javascript', label: 'JavaScript' },
          ]}
          fullWidth
        />
      </div>

      {/* 2. Difficulty Slider with 5 labeled stops */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="setup-diff-slider"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Difficulty
          </label>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-caption)',
              color: 'var(--ink-muted)',
            }}
          >
            Level {difficulty} of 5
          </span>
        </div>
        <Slider
          id="setup-diff-slider"
          ariaLabel="Difficulty tier"
          min={1}
          max={5}
          step={1}
          value={difficulty}
          stops={DIFFICULTY_STOPS}
          onChange={onChangeDifficulty}
          ariaValueText={`Level ${difficulty}: ${DIFFICULTY_STOPS[difficulty - 1]?.label}`}
        />
      </div>

      {/* 3. Practice Mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          Practice mode
        </label>
        <SegmentedControl
          ariaLabel="Choose practice mode"
          value={mode}
          onChange={(val) => onChangeMode(val as 'mixed' | 'topic')}
          options={[
            { value: 'mixed', label: 'Mixed bag' },
            { value: 'topic', label: 'Focus on a topic' },
          ]}
          fullWidth
        />
      </div>

      {/* 4. Topic Chips (shown only in topic mode) */}
      {mode === 'topic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Topic focus
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            {availableTopics.map((t) => {
              const isSelected = selectedTopic === t.topic;
              return (
                <Chip
                  key={t.topic}
                  label={t.topic}
                  selected={isSelected}
                  onClick={() => onSelectTopic(isSelected ? null : t.topic)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
