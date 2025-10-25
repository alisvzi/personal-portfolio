import { connectDB, dbHealth } from "@/lib/db/mongodb";

export async function GET() {
  await connectDB();

  const health = dbHealth();

  return Response.json({
    status: health.connected ? "healthy ✅" : "unhealthy ❌",
    database: health,
    timestamp: new Date().toISOString(),
  });
}
