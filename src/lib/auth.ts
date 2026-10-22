import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { jwtSecret } from "@/lib/env";

export const SESSION_COOKIE = "token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day
const ALGORITHM = "HS256";

export interface AdminSession {
  userId: string;
  role: "admin";
}

export interface SessionCookieOptions {
  httpOnly: true;
  sameSite: "strict";
  secure: boolean;
  path: "/";
  maxAge: number;
}

/**
 * Cookie attributes shared by login/logout so the two can never drift apart.
 * `secure` is only enabled in production so local HTTP development still works.
 */
export function sessionCookieOptions(maxAge: number): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(jwtSecret());
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<AdminSession | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: [ALGORITHM],
    });

    if (payload.role !== "admin" || typeof payload.sub !== "string") {
      return null;
    }

    return { userId: payload.sub, role: "admin" };
  } catch {
    // Expired, tampered with or signed with a different secret.
    return null;
  }
}

/**
 * Resolves the current admin session from the request cookies.
 *
 * This is a read-only convenience helper, not an authorisation gate on its own:
 * every protected operation must call it (or `requireAdmin`) itself.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Authorisation gate for Server Actions and Route Handlers.
 *
 * Next.js documentation is explicit that a `proxy.ts` matcher must never be the
 * only protection for a Server Function, because the matcher can silently stop
 * covering a route when files move. Calling this inside the operation that
 * touches data is the authoritative check.
 *
 * Throws `UnauthorizedError` when there is no valid admin session.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
