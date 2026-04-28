import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB using Mongoose
 * @param uri MongoDB connection string
 */
export async function connectDB(uri: string): Promise<typeof mongoose> {
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return mongoose;
  }

  try {
    await mongoose.connect(uri); // no options needed in Mongoose 7+
    isConnected = true;
    console.log("Connected to MongoDB via Mongoose");
    return mongoose;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

/**
 * Get the mongoose connection
 */
export function getDB(): mongoose.Connection {
  if (!isConnected) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return mongoose.connection;
}