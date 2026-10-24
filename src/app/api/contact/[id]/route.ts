import type { NextRequest } from "next/server";

import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { isValidId, query } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/contact/:id — mark a message read/unread.
 *
 * Admin-only, and the update is restricted to the single allow-listed `read`
 * flag. The previous version passed the raw request body straight to
 * `findByIdAndUpdate`, which let an anonymous caller rewrite any field of any
 * message (mass assignment) on any document (IDOR).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    if (!isValidId(id)) {
      return jsonError("Message not found.", 404);
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body.read !== "boolean") {
      return jsonError("Only the `read` flag can be updated.", 400);
    }

    const updated = await query<{ id: string }>(
      "update messages set read = $1 where id = $2 returning id",
      [body.read, id],
    );

    if (updated.length === 0) {
      return jsonError("Message not found.", 404);
    }

    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error, "PATCH /api/contact/[id]");
  }
}

/** DELETE /api/contact/:id — permanently remove a message. Admin-only. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    if (!isValidId(id)) {
      return jsonError("Message not found.", 404);
    }

    const deleted = await query<{ id: string }>(
      "delete from messages where id = $1 returning id",
      [id],
    );
    if (deleted.length === 0) {
      return jsonError("Message not found.", 404);
    }

    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error, "DELETE /api/contact/[id]");
  }
}
