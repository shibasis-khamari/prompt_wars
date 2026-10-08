import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../api/lib/db';
import seedPuzzles from '../src/data/seed.json';

async function seed() {
  console.log('Connecting to MongoDB...');
  const { db, client } = await connectToDatabase();

  try {
    console.log('Creating database indexes...');
    
    // 1. Puzzles collection indexes
    const puzzlesCollection = db.collection('puzzles');
    await puzzlesCollection.createIndex({ id: 1 }, { unique: true });
    await puzzlesCollection.createIndex({ language: 1, difficulty: 1, topic: 1, validated: 1 });

    // 2. Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // 3. Progress collection indexes
    const progressCollection = db.collection('progress');
    await progressCollection.createIndex({ userId: 1, puzzleId: 1 }, { unique: true });

    // 4. Skills collection indexes
    const skillsCollection = db.collection('skills');
    await skillsCollection.createIndex({ userId: 1, language: 1, topic: 1 }, { unique: true });

    // 5. Streaks collection indexes
    const streaksCollection = db.collection('streaks');
    await streaksCollection.createIndex({ userId: 1 }, { unique: true });

    console.log('Indexes created successfully.');

    // Load seed puzzles and puzzles.json
    let allPuzzles = [...seedPuzzles];

    const puzzlesJsonPath = path.resolve('src/data/puzzles.json');
    if (fs.existsSync(puzzlesJsonPath)) {
      try {
        const extraPuzzles = JSON.parse(fs.readFileSync(puzzlesJsonPath, 'utf-8'));
        if (Array.isArray(extraPuzzles)) {
          allPuzzles = [...allPuzzles, ...extraPuzzles];
        }
      } catch (e) {
        console.warn('Could not parse extra puzzles from puzzles.json:', e);
      }
    }

    console.log(`Upserting ${allPuzzles.length} puzzles into database...`);
    for (const puzzle of allPuzzles) {
      await puzzlesCollection.updateOne(
        { id: puzzle.id },
        { $set: { ...puzzle, validated: true } },
        { upsert: true }
      );
    }

    console.log('Seeding completed successfully!');
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seeding script failed:', err);
  process.exit(1);
});
