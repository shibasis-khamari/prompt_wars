export interface JournalEntry {
  id: string;
  puzzleId: string;
  title: string;
  language: string;
  topic: string;
  bugType: string;
  explanation: string;
  solvedDate: string; // ISO string or formatted date
}

export interface JournalFilters {
  language?: string | null;
  topic?: string | null;
}

const JOURNAL_STORAGE_KEY = 'bughunt_journal_v1';

/**
 * Pure filter function for bug journal entries.
 */
export function filterJournalEntries(
  entries: JournalEntry[],
  filters: JournalFilters
): JournalEntry[] {
  return entries.filter((entry) => {
    // Language filter
    if (filters.language && filters.language !== 'all') {
      if (entry.language.toLowerCase() !== filters.language.toLowerCase()) {
        return false;
      }
    }

    // Topic filter
    if (filters.topic && filters.topic !== 'all') {
      if (entry.topic.toLowerCase() !== filters.topic.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

export class JournalStore {
  public static getEntries(): JournalEntry[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static addEntry(
    entry: Omit<JournalEntry, 'id' | 'solvedDate'> & Partial<JournalEntry>
  ): JournalEntry {
    const entries = this.getEntries();
    const newEntry: JournalEntry = {
      id: entry.id || `${entry.puzzleId}-${Date.now()}`,
      puzzleId: entry.puzzleId,
      title: entry.title,
      language: entry.language,
      topic: entry.topic,
      bugType: entry.bugType,
      explanation: entry.explanation,
      solvedDate: entry.solvedDate || new Date().toISOString(),
    };

    // Prepend newest first
    const updated = [newEntry, ...entries];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // storage quota fallback
      }
    }
    return newEntry;
  }

  public static clear(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(JOURNAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
