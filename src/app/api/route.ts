import { connectDB, dbHealth, isMongoConfigured } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

/**
 * Liveness probe.
 *
 * Deliberately returns no host, port, database name or connection string. The
 * previous version echoed the whole `dbHealth()` object, including the Atlas
 * cluster hostname, through a fully public endpoint.
 *
 * The three states exist because they are fixed in different places:
 *
 * - `not_configured` — `MONGODB_URI` is absent from this environment.
 * - `unreachable`    — the URI exists but the connection failed; almost always
 *                      the cluster's IP allow-list or a wrong password.
 * - `ok`             — connected.
 *
 * Without the distinction, both failures surface in the browser as React error
 * #441 with no further detail.
 */
export async function GET() {
  if (!isMongoConfigured()) {
    return Response.json(
      { status: "misconfigured", database: "not_configured" },
      { status: 503 },
    );
  }

  try {
    await connectDB();
  } catch {
    return Response.json(
      { status: "unavailable", database: "unreachable" },
      { status: 503 },
    );
  }

  const { connected } = dbHealth();

  return Response.json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "connecting",
  });
}
