import { NextResponse } from "next/server";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { UnauthorizedError } from "@/lib/auth";
import { AppError } from "@/lib/errors";

/**
 * Uniform JSON responses for Route Handlers.
 *
 * Internal error details are logged server-side but never serialised to the
 * client: the previous implementation returned `error.message` for every
 * failure, which leaked Mongoose validation internals, database names and
 * stack-derived messages to anonymous callers.
 */

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Keys of the admin error dictionary. Server Actions return one of these
 * instead of an English sentence, so the admin panel renders the message in
 * whichever language the dashboard is currently in.
 */
export type ActionErrorKey = keyof Dictionary["admin"]["errors"];

/** Result shape returned by Server Actions to client components. */
export type ActionResult =
  | { success: true }
  | {
      success: false;
      error: ActionErrorKey;
      /** Values for `{placeholder}` slots in the error message. */
      values?: Record<string, string | number>;
    };

export function actionOk(): ActionResult {
  return { success: true };
}

export function actionError(
  error: unknown,
  fallback: ActionErrorKey,
): ActionResult {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: "unauthorized" };
  }
  return { success: false, error: fallback };
}

/**
 * Maps a thrown error to a safe HTTP response.
 *
 * `context` is a short human-readable label used for the server log line, so
 * production logs stay diagnosable without exposing anything to the caller.
 */
export function handleRouteError(error: unknown, context: string): NextResponse {
  if (error instanceof UnauthorizedError) {
    return jsonError("Authentication required", 401);
  }

  if (error instanceof AppError) {
    return jsonError(error.message, error.statusCode);
  }

  const name = error instanceof Error ? error.name : "UnknownError";
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[api] ${context}: ${name}: ${message}`);

  return jsonError("Something went wrong. Please try again later.", 500);
}
