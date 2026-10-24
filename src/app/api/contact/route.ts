import type { NextRequest } from "next/server";

import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/csrf";
import { getMessages } from "@/lib/data";
import { query } from "@/lib/db/postgres";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { LIMITS, isEmail, isNonEmptyString } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/contact — inbox for the admin panel.
 *
 * Returns a bare array (the admin panel consumes it directly). This endpoint
 * previously had no authorization at all, so every visitor's name, email and
 * message body was readable by anyone who requested this URL.
 */
export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await getMessages());
  } catch (error) {
    return handleRouteError(error, "GET /api/contact");
  }
}

/**
 * POST /api/contact — public contact form submission.
 *
 * This is the only unauthenticated write in the application, so it carries the
 * full public-endpoint guard set: same-origin check, per-IP rate limit, strict
 * length and format validation, and an error body that never echoes internals.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return jsonError("This request was blocked.", 403);
    }

    const limit = rateLimit(clientKey(request.headers, "contact"), {
      max: 5,
      windowSeconds: 600,
    });
    if (!limit.allowed) {
      return jsonError(
        "Too many messages sent. Please try again later.",
        429,
      );
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const body = (payload ?? {}) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!isNonEmptyString(name, LIMITS.name)) {
      return jsonError("Please provide a valid name.", 400);
    }
    if (!isEmail(email)) {
      return jsonError("Please provide a valid email address.", 400);
    }
    if (subject.length > LIMITS.subject) {
      return jsonError("The subject is too long.", 400);
    }
    if (!isNonEmptyString(message, LIMITS.message)) {
      return jsonError("Please provide a valid message.", 400);
    }

    const created = await query<{ id: string }>(
      `insert into messages (name, email, subject, message)
       values ($1, $2, $3, $4)
       returning id`,
      [name, email, subject || null, message],
    );

    return jsonOk({ id: created[0]?.id }, 201);
  } catch (error) {
    return handleRouteError(error, "POST /api/contact");
  }
}
