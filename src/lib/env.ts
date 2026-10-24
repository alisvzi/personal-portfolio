/**
 * Centralised server-side configuration.
 *
 * Every value is read lazily so that importing this module never throws during
 * a build step that does not actually touch the resource. The first real use
 * fails loudly with an actionable message instead of failing silently later
 * (for example, signing a session with a fallback secret).
 *
 * This module must only be imported from server code (Server Components,
 * Server Actions, Route Handlers, `proxy.ts`).
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function required(name: string, hint: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ${hint} See .env.example.`,
    );
  }
  return value;
}

/**
 * PostgreSQL connection string.
 *
 * Provisioned by the Neon integration on Vercel, which injects `DATABASE_URL`
 * (the pooled endpoint). `POSTGRES_URL` is accepted as a fallback because the
 * integration also exposes that alias, and older deployments may only have it.
 */
export function databaseUrl(): string {
  const value = read("DATABASE_URL") ?? read("POSTGRES_URL");
  if (!value) {
    throw new Error(
      'Missing required environment variable "DATABASE_URL". Set it to your ' +
        "PostgreSQL connection string (the Neon integration on Vercel injects " +
        "it automatically). See .env.example.",
    );
  }
  return value;
}

/** Whether a connection string is present, without throwing when it is not. */
export function hasDatabaseUrl(): boolean {
  return Boolean(read("DATABASE_URL") ?? read("POSTGRES_URL"));
}

/**
 * Secret used to sign and verify admin session tokens.
 *
 * There is deliberately no fallback value: a predictable default secret would
 * let anyone mint a valid admin token.
 */
export function jwtSecret(): string {
  const secret = required(
    "JWT_SECRET",
    "Generate one with `openssl rand -base64 32` and set it in your Vercel project.",
  );
  if (secret.length < 32) {
    throw new Error(
      'Environment variable "JWT_SECRET" is too short. Use at least 32 characters (`openssl rand -base64 32`).',
    );
  }
  return secret;
}

/**
 * Public origin the site is served from, without a trailing slash.
 *
 * Used for canonical URLs, Open Graph metadata, `sitemap.xml` and `robots.txt`.
 * Read at request/build time from the environment so that a custom `.ir`
 * domain can be configured without touching source files.
 */
export function siteUrl(): string {
  const configured =
    read("NEXT_PUBLIC_SITE_URL") ?? read("VERCEL_PROJECT_PRODUCTION_URL");
  const raw = configured
    ? configured.startsWith("http")
      ? configured
      : `https://${configured}`
    : "http://localhost:3000";

  return raw.replace(/\/+$/, "");
}

/** Vercel Blob read/write token. Optional: local development falls back to disk. */
export function blobReadWriteToken(): string | undefined {
  return read("BLOB_READ_WRITE_TOKEN");
}
