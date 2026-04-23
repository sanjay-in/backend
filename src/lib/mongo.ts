// db.ts
import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDB(uri: string, dbName: string): Promise<Db> {
  if (db) return db; // Return existing connection if already connected

  if (!client) {
    client = new MongoClient(uri);
  }

  await client.connect();

  db = client.db(dbName);
  console.log('Connected to MongoDB');
  return db;
}

export async function getDB(): Promise<Db> {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
}