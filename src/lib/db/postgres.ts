import { neon } from "@neondatabase/serverless";

import { databaseUrl, hasDatabaseUrl } from "@/lib/env";

/**
 * PostgreSQL access.
 *
 * Replaces the previous Mongoose connection. The Neon HTTP driver is used
 * rather than a TCP pool because every request on Vercel is a fresh
 * invocation: a per-invocation pool would exhaust the database's connection
 * limit, while the HTTP driver multiplexes onto the pooler and needs no
 * lifecycle management at all.
 *
 * The client is cached on the module scope. It holds no sockets — only the
 * connection string and the fetch implementation — so caching it is safe
 * across invocations and hot reloads.
 */

type SqlClient = ReturnType<typeof neon>;

let client: SqlClient | null = null;

function sql(): SqlClient {
  if (!client) {
    client = neon(databaseUrl());
  }
  return client;
}

/**
 * Runs one parameterised statement.
 *
 * Always use `$1, $2, …` placeholders; the driver sends the statement and the
 * values separately, so no caller-supplied string is ever interpolated into
 * SQL. That is the entire injection defence, and it is why the actions below
 * never build a query by concatenation.
 */
export async function query<T>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const rows = await sql().query(text, params);
  return rows as T[];
}

/** Convenience for statements whose result is not needed. */
export async function execute(
  text: string,
  params: unknown[] = [],
): Promise<void> {
  await sql().query(text, params);
}

/**
 * Whether a connection string is present at all.
 *
 * Lets the health check separate "misconfigured deployment" from "database
 * unreachable", which are fixed in different places.
 */
export function isDbConfigured(): boolean {
  return hasDatabaseUrl();
}

/**
 * Readiness probe.
 *
 * Returns a boolean only: the previous health endpoint leaked the cluster
 * hostname through a fully public URL.
 */
export async function dbHealth(): Promise<{ connected: boolean }> {
  try {
    await query("select 1 as ok");
    return { connected: true };
  } catch {
    return { connected: false };
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guards route parameters and form ids before they reach a `uuid` column.
 *
 * Postgres rejects a malformed uuid with a syntax error rather than returning
 * no rows, which would surface to the caller as a 500. Checking here keeps a
 * bad id a 404/validation failure instead.
 */
export function isValidId(id: string | undefined): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}
