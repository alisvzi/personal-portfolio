import mongoose, { type Connection } from "mongoose";

import { mongoUri } from "@/lib/env";

/**
 * Cached Mongo connection.
 *
 * Serverless runtimes reuse one process across many invocations, so the
 * connection promise is stashed on `globalThis` to survive hot reloads in
 * development and to avoid opening a new pool per invocation in production.
 */

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = (globalThis.__mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);

    cached.promise = mongoose
      .connect(mongoUri(), {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      })
      .then((instance) => instance.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("[db] MongoDB connection failed:", error);
    throw error;
  }

  return cached.conn;
}

/**
 * Lightweight readiness probe.
 *
 * Deliberately returns no host, port or database name: this used to be exposed
 * verbatim through the public `/api` health endpoint.
 */
export function dbHealth(): { connected: boolean } {
  return { connected: mongoose.connection.readyState === 1 };
}

/**
 * Guards route parameters that are used as document ids.
 *
 * A malformed id would otherwise reach Mongoose as a cast error, which the old
 * handlers surfaced to the caller as a 500 with the internal message attached.
 */
export function isValidObjectId(id: string | undefined): boolean {
  return typeof id === "string" && mongoose.isValidObjectId(id);
}

