// src/lib/db.ts
import mongoose from 'mongoose';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local',
  );
}

const cached = (globalThis as any)._mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  (globalThis as any)._mongooseCache = cached;

  return cached.conn;
}
