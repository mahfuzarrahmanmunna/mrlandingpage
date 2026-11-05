import mongoose from "mongoose";

/**
 * Reusable Mongoose connection. Cached on globalThis so dev hot-reload and
 * serverless warm starts reuse one pool instead of opening new connections.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { __mriMongoose?: Cache };
const cache: Cache = globalForMongoose.__mriMongoose ?? { conn: null, promise: null };
globalForMongoose.__mriMongoose = cache;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

export async function connectDB(uri = process.env.MONGODB_URI, dbName = process.env.MONGODB_DB || "mrimperial") {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  if (!uri) throw new DatabaseNotConfiguredError();

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(uri, {
        dbName,
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
