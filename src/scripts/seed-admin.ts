/**
 * Creates (or updates) the single admin account.
 *
 * Run explicitly with `npm run seed:admin`. The previous implementation called
 * an `ensureAdmin()` helper from the landing page's render path, which created
 * a hardcoded `admin@example.com` account whose password was committed to the
 * repository — a publicly known credential guarding the whole dashboard.
 *
 * The password is deliberately not repeated in this file: documenting a
 * credential in source is how it leaks again.
 *
 * Credentials come from the environment and are never defaulted:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 *
 * Usage (PowerShell):
 *   $env:SEED_ADMIN_EMAIL="you@example.com"; $env:SEED_ADMIN_PASSWORD="..."; npm run seed:admin
 */

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import { loadEnvConfig } from "@next/env";

import { databaseUrl } from "../lib/env";

// Load `.env.local` exactly the way `next dev` does, so the script sees the
// same DATABASE_URL the application uses.
loadEnvConfig(process.cwd());

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 12;

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `SEED_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
    process.exitCode = 1;
    return;
  }

  // Fail loudly before touching the database when the connection string is
  // missing, instead of letting the driver report a generic network error.
  const sql = neon(databaseUrl());

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await sql.query("select id from users where email = $1", [
    email,
  ]);

  if (existing.length > 0) {
    await sql.query(
      "update users set password = $1, role = 'admin', updated_at = now() where email = $2",
      [passwordHash, email],
    );
    console.log(`Updated the password for existing admin "${email}".`);
  } else {
    await sql.query(
      "insert into users (email, password, role) values ($1, $2, 'admin')",
      [email, passwordHash],
    );
    console.log(`Created admin "${email}".`);
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
