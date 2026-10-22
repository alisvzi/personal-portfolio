/**
 * Creates (or updates) the single admin account.
 *
 * Run explicitly with `npm run seed:admin`. The previous implementation called
 * an `ensureAdmin()` helper from the landing page's render path, which created
 * a hardcoded `admin@example.com` account whose password was committed to the
 * repository — a publicly known credential guarding the whole dashboard. (That
 * account is still present in databases seeded before this change; rotate or
 * remove it there.)
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

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

import { connectDB } from "../lib/db/mongodb";
import { mongoUri } from "../lib/env";
import UserModel from "../lib/models/User";

// Load `.env.local` exactly the way `next dev` does, so the script sees the
// same MONGODB_URI the application uses.
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
  // missing, instead of letting Mongoose buffer the query indefinitely.
  mongoUri();

  await connectDB();

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await UserModel.findOne({ email }).exec();

  if (existing) {
    existing.password = passwordHash;
    existing.role = "admin";
    await existing.save();
    console.log(`Updated the password for existing admin "${email}".`);
  } else {
    await UserModel.create({ email, password: passwordHash, role: "admin" });
    console.log(`Created admin "${email}".`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
