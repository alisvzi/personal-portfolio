/**
 * Creates the database schema.
 *
 * Run with `npm run db:init`. Idempotent — every statement is `if not exists`,
 * so running it against an already-provisioned database is a no-op.
 *
 * Statements are executed one at a time rather than as a single multi-statement
 * query: the Neon HTTP driver speaks the extended protocol, which permits
 * exactly one statement per request. The split is on `;` after stripping `--`
 * comments, which is safe here because no string literal in the schema contains
 * a semicolon.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { neon } from "@neondatabase/serverless";
import { loadEnvConfig } from "@next/env";

import { databaseUrl } from "../lib/env";

loadEnvConfig(process.cwd());

function statements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function main(): Promise<void> {
  const sql = neon(databaseUrl());
  const source = readFileSync(
    join(process.cwd(), "src", "lib", "db", "schema.sql"),
    "utf8",
  );

  const all = statements(source);
  for (const [index, statement] of all.entries()) {
    await sql.query(statement);
    console.log(`  [${index + 1}/${all.length}] ok`);
  }

  const tables = await sql.query(
    "select table_name from information_schema.tables " +
      "where table_schema = 'public' order by table_name",
  );
  console.log(`\nTables: ${tables.map((row) => row.table_name).join(", ")}`);
}

main().catch((error) => {
  console.error("Schema creation failed:", error);
  process.exitCode = 1;
});
