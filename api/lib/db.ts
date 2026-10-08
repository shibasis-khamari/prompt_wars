import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error(
      'Missing required environment variable: MONGODB_URI. Please set MONGODB_URI in your environment or .env file.'
    );
  }

  if (!dbName) {
    throw new Error(
      'Missing required environment variable: MONGODB_DB. Please set MONGODB_DB in your environment or .env file.'
    );
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
