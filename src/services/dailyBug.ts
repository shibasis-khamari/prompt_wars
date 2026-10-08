import { Puzzle, SupportedLanguage } from '../data/puzzle';

/**
 * Returns the local date string in YYYY-MM-DD format.
 */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministically hashes a string into a non-negative 32-bit integer.
 */
export function hashDateString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Chooses one validated puzzle per language per day by hashing the local date string
 * into the puzzle pool, so everyone gets the same one.
 */
export function selectDailyBug(
  puzzles: Puzzle[],
  language: SupportedLanguage | string,
  dateString: string
): Puzzle | null {
  // Pool must be validated puzzles matching language
  const matchingPool = puzzles.filter(
    (p) => p.language.toLowerCase() === language.toLowerCase() && p.validated === true
  );

  if (matchingPool.length === 0) {
    return null;
  }

  // Sort pool deterministically by puzzle ID so order is identical everywhere
  matchingPool.sort((a, b) => a.id.localeCompare(b.id));

  // Hash the combination of language and date string
  const hash = hashDateString(`${language.toLowerCase()}-${dateString}`);
  const selectedIndex = hash % matchingPool.length;

  return matchingPool[selectedIndex];
}
