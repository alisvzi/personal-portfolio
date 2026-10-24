import { dbHealth, isDbConfigured } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

/**
 * Liveness probe.
 *
 * Deliberately returns no host, port, database name or connection string. The
 * previous version echoed the whole health object, including the cluster
 * hostname, through a fully public endpoint.
 *
 * The three states exist because they are fixed in different places:
 *
 * - `not_configured` — `DATABASE_URL` is absent from this environment.
 * - `unreachable`    — the URL exists but the query failed; usually a suspended
 *                      Neon branch or a rotated password.
 * - `ok`             — connected.
 *
 * Without the distinction, both failures surface in the browser as React error
 * #441 with no further detail.
 */
export async function GET() {
  if (!isDbConfigured()) {
    return Response.json(
      { status: "misconfigured", database: "not_configured" },
      { status: 503 },
    );
  }

  const { connected } = await dbHealth();

  if (!connected) {
    return Response.json(
      { status: "unavailable", database: "unreachable" },
      { status: 503 },
    );
  }

  return Response.json({ status: "ok", database: "connected" });
}
