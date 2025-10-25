import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Please define the MONGODB_URI environment variable in .env.local",
  );
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// ⚡ در محیط توسعه (Hot Reload)، اتصال MongoDB را در حافظه‌ی global نگه داریم
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// تابع اتصال اصلی
export async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    // ✅ از اتصال کش‌شده استفاده کن
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", false);

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("🚀 MongoDB Connected:", mongoose.connection.name);
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", err);
    throw err;
  }

  return cached.conn;
}

// تابع سلامت (Health Check)
export const dbHealth = () => {
  const connection = mongoose.connection;
  return {
    connected: connection.readyState === 1,
    readyState: connection.readyState, // 0=disconnected, 1=connected
    name: connection.name,
    host: connection.host,
    port: connection.port,
  };
};
