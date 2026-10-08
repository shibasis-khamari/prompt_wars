import { z } from 'zod';

export const SupportedLanguages = ['python', 'javascript', 'java', 'c', 'cpp'] as const;
export type SupportedLanguage = (typeof SupportedLanguages)[number];

export const TestCaseSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),
  input: z.array(z.unknown()),
  expectedOutput: z.unknown(),
});

export type TestCase = z.infer<typeof TestCaseSchema>;

export const PuzzleSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  language: z.enum(SupportedLanguages),
  difficulty: z.number().int().min(1).max(5),
  topic: z.string().min(1, 'Topic is required'),
  bugType: z.string().min(1, 'Bug type is required'),
  title: z.string().min(1, 'Title is required'),
  theme: z.string().min(1, 'Theme is required'),
  buggyCode: z.string().min(1, 'Buggy code is required'),
  correctCode: z.string().min(1, 'Correct code is required'),
  tests: z.array(TestCaseSchema).min(1, 'At least one test case is required'),
  expectedOutput: z.unknown(),
  symptomOutput: z.string(),
  bugLine: z.number().int().min(1, 'Bug line must be at least 1'),
  explanation: z.string().min(1, 'Explanation is required'),
  hints: z
    .tuple([z.string().min(1), z.string().min(1), z.string().min(1)])
    .refine((val) => val.length === 3, { message: 'Must contain exactly 3 hints' }),
  compileFlags: z.string().optional(),
  entryClass: z.string().optional(),
  timeLimitMs: z.number().int().positive().default(3000),
  validated: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type Puzzle = z.infer<typeof PuzzleSchema>;
