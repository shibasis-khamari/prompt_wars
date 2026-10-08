import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry, JournalStore } from '../storage/journalStore';
import { Toolbar } from '../components/ui/Toolbar';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { JournalEntryItem } from '../components/journal/JournalEntryItem';

export interface JournalRouteProps {
  onNavigatePlay?: () => void;
}

export const JournalRoute: React.FC<JournalRouteProps> = ({ onNavigatePlay }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  useEffect(() => {
    setEntries(JournalStore.getEntries());
  }, []);

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.topic) set.add(e.topic);
    });
    return Array.from(set).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedLanguage !== 'all' && entry.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
        return false;
      }
      if (selectedTopic !== 'all' && entry.topic.toLowerCase() !== selectedTopic.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = entry.title?.toLowerCase().includes(q);
        const matchesBug = entry.bugType?.toLowerCase().includes(q);
        const matchesExpl = entry.explanation?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBug && !matchesExpl) {
          return false;
        }
      }
      return true;
    });
  }, [entries, selectedLanguage, selectedTopic, searchQuery]);

  const formatDateGroup = (isoOrDateStr: string) => {
    try {
      const d = new Date(isoOrDateStr);
      if (isNaN(d.getTime())) return isoOrDateStr;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoOrDateStr;
    }
  };

  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};
    const visibleEntries = filteredEntries.slice(0, visibleCount);
    visibleEntries.forEach((entry) => {
      const dateKey = formatDateGroup(entry.solvedDate);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });
    return groups;
  }, [filteredEntries, visibleCount]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSelectedTopic('all');
    setSelectedLevel('all');
  };

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border-neutral)',
    color: 'var(--ink)',
    borderRadius: 'var(--radius-md)',
    padding: '0.375rem 0.625rem',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
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
          Bug Journal
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-muted)', margin: 0 }}>
          Review your solved puzzles, diagnostic root causes, and debugging history.
        </p>
      </div>

      {/* Toolbar: Search + Language, Topic, Level filters + Result Count */}
      <Toolbar ariaLabel="Journal filter toolbar">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          <input
            type="search"
            aria-label="Search solved bugs"
            placeholder="Search by title or bug pattern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-neutral)',
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
            }}
          />

          <select
            aria-label="Filter by language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>

          <select
            aria-label="Filter by topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All topics</option>
            {availableTopics.map((top) => (
              <option key={top} value={top}>{top}</option>
            ))}
          </select>

          <select
            aria-label="Filter by level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>

        <span style={{ fontSize: 'var(--text-xs, 0.8125rem)', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
          {filteredEntries.length} {filteredEntries.length === 1 ? 'bug' : 'bugs'} recorded
        </span>
      </Toolbar>

      {/* Grouped Entries List or Empty States */}
      {filteredEntries.length === 0 ? (
        entries.length === 0 ? (
          <EmptyState
            icon="📖"
            title="Your bug journal is currently empty"
            whatHappened="No solved bugs have been recorded in your local browser history yet."
            whatToDoNext="Visit the Setup tab to start hunting bugs, or tackle today's Daily Bug to begin recording your journal."
            action={
              onNavigatePlay && (
                <Button variant="primary" onClick={onNavigatePlay}>
                  Start hunting bugs
                </Button>
              )
            }
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No bugs match the active filters"
            whatHappened={`None of your ${entries.length} solved bugs match the selected filter criteria.`}
            whatToDoNext="Click Clear filters or broaden your search criteria to see your full record."
            action={
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear filters
              </Button>
            }
          />
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {Object.entries(groupedEntries).map(([dateKey, groupItems]) => (
            <section key={dateKey} aria-label={`Entries for ${dateKey}`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }} aria-hidden="true">▼</span>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    color: 'var(--ink-muted)',
                    margin: 0,
                  }}
                >
                  {dateKey}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {groupItems.map((entry) => (
                  <JournalEntryItem key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}

          {visibleCount < filteredEntries.length && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setVisibleCount((c) => c + 10)}>
                Load more bugs
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
