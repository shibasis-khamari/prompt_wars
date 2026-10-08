import { Puzzle } from '../types/puzzle';

export const SAMPLE_PUZZLES: Puzzle[] = [
  {
    id: 'off-by-one-sum',
    title: 'Array Sum Off-by-One',
    description: 'Fix the function so it correctly calculates the sum of all numbers in an array.',
    difficulty: 'easy',
    category: 'Arrays',
    buggyCode: `function solution(numbers) {
  let total = 0;
  // Bug: loop stops before the last element
  for (let i = 0; i < numbers.length - 1; i++) {
    total += numbers[i];
  }
  return total;
}`,
    correctCode: `function solution(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}`,
    explanation: 'The loop condition `i < numbers.length - 1` omitted the final element of the array. Changing the condition to `i < numbers.length` ensures all elements are summed.',
    hints: [
      'Look closely at the loop termination condition.',
      'Check if the last index `numbers.length - 1` is being included in the sum loop.',
    ],
    testCases: [
      { id: 't1', description: 'Sums positive integers', input: [[1, 2, 3, 4]], expectedOutput: 10 },
      { id: 't2', description: 'Handles array with single element', input: [[5]], expectedOutput: 5 },
      { id: 't3', description: 'Handles empty array', input: [[]], expectedOutput: 0 },
    ],
  },
  {
    id: 'palindrome-check',
    title: 'Case-Sensitive Palindrome Bug',
    description: 'Fix the palindrome checker so it treats upper and lower case letters equally and ignores spaces.',
    difficulty: 'easy',
    category: 'Strings',
    buggyCode: `function solution(str) {
  // Bug: fails to normalize string case and strip non-alphanumeric characters
  const reversed = str.split('').reverse().join('');
  return str === reversed;
}`,
    correctCode: `function solution(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}`,
    explanation: 'Palindromes like "Race car" require converting to lowercase and stripping whitespace before checking equality.',
    hints: [
      'Should "Race car" be considered a palindrome?',
      'Try converting the string to lowercase and stripping punctuation/spaces.',
    ],
    testCases: [
      { id: 't1', description: 'Simple word palindrome', input: ['racecar'], expectedOutput: true },
      { id: 't2', description: 'Mixed-case phrase palindrome', input: ['Race Car'], expectedOutput: true },
      { id: 't3', description: 'Non-palindrome word', input: ['hello'], expectedOutput: false },
    ],
  },
  {
    id: 'two-sum-indices',
    title: 'Two Sum Duplicate Index Bug',
    description: 'Find two numbers in the array that add up to the target. Return their 0-based indices.',
    difficulty: 'medium',
    category: 'Algorithms',
    buggyCode: `function solution(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      // Bug: j starts at 0, allowing comparing element with itself!
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`,
    correctCode: `function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    explanation: 'The buggy inner loop checked elements against themselves (`i === j`). Using a hash map or starting `j = i + 1` ensures distinct element indices.',
    hints: [
      'Can an element at index i add to itself to reach the target?',
      'Check what happens when target is 6 and nums contains [3, 2, 4].',
    ],
    testCases: [
      { id: 't1', description: 'Standard array with pair', input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { id: 't2', description: 'Does not use same element twice', input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
    ],
  },
];
