import { GENERATOR_MODEL_ID } from '../src/config/models';
import type { ApiRequest, ApiResponse } from './types';

export async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
  }

  const { topic = 'JavaScript', difficulty = 'medium', modelId = GENERATOR_MODEL_ID } = req.body || {};

  try {
    // Call Gemini API using process.env.GEMINI_API_KEY server-side
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const prompt = `Generate a programming puzzle for a bug-fixing game.
Topic: ${topic}
Difficulty: ${difficulty}

Respond strictly with a JSON object with keys:
{
  "id": "unique-slug",
  "title": "Short title",
  "description": "Problem description",
  "difficulty": "${difficulty}",
  "category": "${topic}",
  "buggyCode": "function solution(...) { ... }",
  "correctCode": "function solution(...) { ... }",
  "explanation": "Explanation of the bug and fix",
  "hints": ["Hint 1", "Hint 2"],
  "testCases": [
    { "id": "t1", "description": "Test 1", "input": [arg1], "expectedOutput": result }
  ]
}`;

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from AI model');
    }

    const puzzlePayload = JSON.parse(jsonMatch[0]);
    return res.status(200).json(puzzlePayload);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate puzzle',
    });
  }
}

export default handler;
