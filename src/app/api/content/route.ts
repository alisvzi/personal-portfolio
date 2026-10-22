import { handleRouteError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Read endpoint for the admin content editor.
 *
 * The public site reads the same document through the data layer during server
 * rendering, so this route is admin-only.
 */
export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await getContent());
  } catch (error) {
    return handleRouteError(error, "GET /api/content");
  }
}
