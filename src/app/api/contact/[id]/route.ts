import type { NextRequest } from "next/server";

import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isValidObjectId } from "@/lib/db/mongodb";
import MessageModel from "@/lib/models/Message";

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
    if (!isValidObjectId(id)) {
      return jsonError("Message not found.", 404);
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body.read !== "boolean") {
      return jsonError("Only the `read` flag can be updated.", 400);
    }

    await connectDB();
    const updated = await MessageModel.findByIdAndUpdate(
      id,
      { $set: { read: body.read } },
      { new: true, runValidators: true },
    );

    if (!updated) {
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
    if (!isValidObjectId(id)) {
      return jsonError("Message not found.", 404);
    }

    await connectDB();
    const deleted = await MessageModel.findByIdAndDelete(id);
    if (!deleted) {
      return jsonError("Message not found.", 404);
    }

    return jsonOk({ success: true });
  } catch (error) {
    return handleRouteError(error, "DELETE /api/contact/[id]");
  }
}
