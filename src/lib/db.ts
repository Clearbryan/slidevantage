import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in .env.local')

const cache = globalThis as typeof globalThis & {
  _mc?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}
if (!cache._mc) cache._mc = { conn: null, promise: null }

export async function connectDB() {
  if (cache._mc!.conn) return cache._mc!.conn
  if (!cache._mc!.promise) {
    cache._mc!.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cache._mc!.conn = await cache._mc!.promise
  return cache._mc!.conn
}
