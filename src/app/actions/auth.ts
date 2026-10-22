"use server";

import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import { connectDB } from "@/lib/db/mongodb";
import { jwtSecret } from "@/lib/env";
import UserModel from "@/lib/models/User";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/**
 * Sign-in returns a dictionary key rather than a sentence, so the login page
 * renders the failure in the language it is currently showing.
 */
export type LoginErrorKey = keyof Dictionary["login"]["errors"];

export type LoginResult =
  | { success: true }
  | { success: false; error: LoginErrorKey; values?: Record<string, string | number> };

/**
 * A structurally valid bcrypt hash used as a decoy when no user matches.
 *
 * Comparing against it keeps the response time for "unknown account" close to
 * "wrong password", so timing cannot be used to enumerate admin emails.
 */
const DECOY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function loginAdmin(formData: FormData): Promise<LoginResult> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { success: false, error: "emailPasswordRequired" };
  }

  try {
    // Touch the secret up front so a missing JWT_SECRET fails loudly here
    // rather than silently signing with a guessable default.
    jwtSecret();
  } catch {
    console.error("[auth] JWT_SECRET is not configured");
    return { success: false, error: "unavailable" };
  }

  const limit = rateLimit(clientKey(await headers(), "login"), {
    max: 10,
    windowSeconds: 300,
  });

  if (!limit.allowed) {
    return {
      success: false,
      error: "tooManyAttempts",
      values: { seconds: limit.retryAfterSeconds },
    };
  }

  try {
    await connectDB();

    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    }).exec();

    const passwordMatches = await bcrypt.compare(
      password,
      user?.password ?? DECOY_HASH,
    );

    if (!user || !passwordMatches) {
      return { success: false, error: "invalidCredentials" };
    }

    const token = await createSessionToken({
      userId: String(user._id),
      role: "admin",
    });

    (await cookies()).set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(SESSION_MAX_AGE),
    );

    return { success: true };
  } catch (error) {
    console.error("[auth] login failed:", error);
    return { success: false, error: "unavailable" };
  }
}

/**
 * Clears the session and sends the visitor to the sign-in page.
 *
 * `locale` is supplied by the calling page so the redirect stays inside the
 * language the admin was using. It is re-validated here rather than trusted:
 * the value is interpolated into a redirect target, and an unvalidated
 * `//evil.com` would become a protocol-relative URL and an open redirect.
 * Clearing the cookie intentionally does not require a valid session, so an
 * expired session can still sign out.
 */
export async function logoutAdmin(locale: string): Promise<void> {
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  (await cookies()).set(SESSION_COOKIE, "", sessionCookieOptions(0));
  redirect(`/${safeLocale}/auth/login`);
}
