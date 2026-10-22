import { connectDB, dbHealth } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

/**
 * Liveness probe.
 *
 * Deliberately returns no host, port or database name. The previous version
 * echoed the whole `dbHealth()` object, including the Atlas cluster hostname,
 * through a fully public endpoint.
 */
export async function GET() {
  try {
    await connectDB();
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }

  return Response.json({ status: dbHealth().connected ? "ok" : "unavailable" });
}
