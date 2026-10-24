"use server";

import bcrypt from "bcrypt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { actionError, actionOk, type ActionResult } from "@/lib/api";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  requireAdmin,
  sessionCookieOptions,
} from "@/lib/auth";
import { connectDB } from "@/lib/db/mongodb";
import { jwtSecret } from "@/lib/env";
import UserModel from "@/lib/models/User";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isEmail } from "@/lib/validation";

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

/**
 * Changing the admin's own e-mail and password.
 *
 * Three decisions worth stating:
 *
 * 1. **The current password is required**, even though the caller already holds
 *    a session. A stolen session (an unattended laptop, a copied cookie) would
 *    otherwise be enough to take the account over permanently; asking for the
 *    password turns that into a dead end.
 * 2. **The session is not invalidated** on success. The JWT identifies the user
 *    by id, not by e-mail or password, so a rename or a new password keeps the
 *    current tab signed in — which is what someone who just changed their own
 *    credentials expects. Every *other* session expires within its own day.
 * 3. **Failures are rate-limited** on the same budget as sign-in. Without it,
 *    the "current password" field would be an offline-free oracle for guessing
 *    the password of whoever left a session open.
 */
const MIN_PASSWORD_LENGTH = 12;

export async function updateAdminCredentials(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const currentPassword = formData.get("currentPassword");
    const email = formData.get("email");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return { success: false, error: "currentPasswordRequired" };
    }
    if (typeof email !== "string" || !isEmail(email.trim())) {
      return { success: false, error: "emailInvalid" };
    }

    const wantsNewPassword = typeof newPassword === "string" && newPassword.length > 0;

    if (wantsNewPassword) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return {
          success: false,
          error: "passwordTooShort",
          values: { min: MIN_PASSWORD_LENGTH },
        };
      }
      if (newPassword !== confirmPassword) {
        return { success: false, error: "passwordMismatch" };
      }
    }

    const limit = rateLimit(clientKey(await headers(), "credentials"), {
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

    await connectDB();

    const user = await UserModel.findById(session.userId).exec();
    if (!user) {
      return { success: false, error: "unauthorized" };
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return { success: false, error: "currentPasswordInvalid" };
    }

    const nextEmail = email.trim().toLowerCase();
    if (nextEmail !== user.email) {
      const taken = await UserModel.exists({
        email: nextEmail,
        _id: { $ne: user._id },
      });
      if (taken) {
        return { success: false, error: "emailTaken" };
      }
      user.email = nextEmail;
    }

    if (wantsNewPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return actionOk();
  } catch (error) {
    console.error("[auth] credential update failed:", error);
    return actionError(error, "saveFailed");
  }
}
