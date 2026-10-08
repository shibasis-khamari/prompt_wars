import React, { useState } from 'react';
import { JournalEntry } from '../../storage/journalStore';
import { Tag } from '../ui/Tag';
import { DiffView } from '../ui/DiffView';

export interface JournalEntryItemProps {
  entry: JournalEntry & {
    difficulty?: number;
    buggyCode?: string;
    correctCode?: string;
  };
}

export const JournalEntryItem: React.FC<JournalEntryItemProps> = ({ entry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract first sentence as one-line summary
  const summaryLine = entry.explanation
    ? entry.explanation.split('.')[0] + '.'
    : 'Fixed logic defect in program flow.';

  return (
    <article
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-neutral)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            {entry.title}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Tag label={entry.language} variant="default" size="sm" />
            {entry.difficulty && <Tag label={`Level ${entry.difficulty}`} variant="default" size="sm" />}
            <Tag label={entry.topic} variant="muted" size="sm" />
            <Tag label={`Bug: ${entry.bugType}`} variant="warn" size="sm" />
          </div>
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 8px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs, 0.8125rem)',
            fontWeight: 600,
            color: 'var(--ink)',
            cursor: 'pointer',
            backgroundColor: 'var(--surface)',
            transition: 'background-color 120ms ease',
          }}
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        {summaryLine}
      </p>

      {isExpanded && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            borderTop: '1px solid var(--border-neutral)',
            paddingTop: 'var(--space-3)',
            marginTop: 'var(--space-1)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-neutral)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>
              Explanation:
            </strong>
            <p style={{ margin: 0, color: 'var(--ink-muted)', lineHeight: 1.55 }}>
              {entry.explanation}
            </p>
          </div>

          {entry.buggyCode && entry.correctCode && (
            <DiffView
              originalCode={entry.buggyCode}
              modifiedCode={entry.correctCode}
              originalLabel="Buggy original"
              modifiedLabel="Correct solution"
            />
          )}
        </div>
      )}
    </article>
  );
};
