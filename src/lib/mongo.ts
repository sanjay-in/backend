import { MongoClient, Db } from "mongodb";
import mongoose from "mongoose";

const MONGODB_URI: string = Bun.env.MONGODB_URI!;
console.log("MongoDB URI:", MONGODB_URI);

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in environment variables");
}

try {
  await mongoose.connect(MONGODB_URI);
  console.log("Successfully connected to MongoDB");
} catch (error) {
  console.error("MongoDB connection error:", error);
}

// let client = null;
// let clientPromise = null;

// if (!global._mongoClientPromise && uri) {
//   client = new MongoClient(uri);
//   global._mongoClientPromise = client.connect();
// }

// clientPromise = global._mongoClientPromise;

// async function getDb() {
//   if (clientPromise === null) {
//     return null;
//   }
//   const client = await clientPromise;
//   const dbName = process.env.MONGODB_DB || "eduledger";
//   return client.db(dbName);
// }

const client = new MongoClient(MONGODB_URI);

let db: Db | null = null;

export async function connectToDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    await client.connect();
    db = client.db(Bun.env.MONGO_DB);
    console.log(`Connected to MongoDB database: ${Bun.env.MONGO_DB}`);
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// module.exports = { getDb };