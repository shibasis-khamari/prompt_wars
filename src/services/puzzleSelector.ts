import { Puzzle, SupportedLanguage } from '../data/puzzle';

export interface PuzzleSelectionOptions {
  language: SupportedLanguage;
  difficulty: number; // 1 to 5
  mode: 'mixed' | 'topic';
  topic?: string | null;
  seenPuzzleIds?: Set<string> | string[];
}

export interface PuzzleSelectionResult {
  puzzle: Puzzle | null;
  isNearestFallback: boolean;
  fallbackNotice?: string;
}

export function selectMatchingPuzzle(
  puzzles: Puzzle[],
  options: PuzzleSelectionOptions
): PuzzleSelectionResult {
  const { language, difficulty, mode, topic, seenPuzzleIds } = options;
  const seenSet = seenPuzzleIds instanceof Set ? seenPuzzleIds : new Set(seenPuzzleIds || []);

  // 1. Filter by language and validated status
  let languagePuzzles = puzzles.filter(
    (p) => p.language === language && (p.validated === undefined || p.validated === true)
  );

  if (languagePuzzles.length === 0) {
    return { puzzle: null, isNearestFallback: false };
  }

  // 2. Filter by topic if mode is 'topic' and topic is specified
  if (mode === 'topic' && topic) {
    const topicFiltered = languagePuzzles.filter(
      (p) => p.topic.toLowerCase() === topic.toLowerCase()
    );
    if (topicFiltered.length > 0) {
      languagePuzzles = topicFiltered;
    }
  }

  // 3. Exclude previously seen puzzles if any unseen remain
  const unseenPuzzles = languagePuzzles.filter((p) => !seenSet.has(p.id));
  const candidatePool = unseenPuzzles.length > 0 ? unseenPuzzles : languagePuzzles;

  // 4. Check for exact difficulty match
  const exactMatches = candidatePool.filter((p) => p.difficulty === difficulty);
  if (exactMatches.length > 0) {
    // Pick first or random from exact matches
    return {
      puzzle: exactMatches[0],
      isNearestFallback: false,
    };
  }

  // 5. Fallback to nearest difficulty
  let bestCandidate = candidatePool[0];
  let minDiff = Math.abs(bestCandidate.difficulty - difficulty);

  for (const candidate of candidatePool) {
    const diff = Math.abs(candidate.difficulty - difficulty);
    if (diff < minDiff) {
      minDiff = diff;
      bestCandidate = candidate;
    }
  }

  return {
    puzzle: bestCandidate,
    isNearestFallback: true,
    fallbackNotice: `No exact match for Level ${difficulty}. Selected nearest Level ${bestCandidate.difficulty} puzzle.`,
  };
}
