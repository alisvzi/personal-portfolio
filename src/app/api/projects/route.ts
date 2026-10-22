import { handleRouteError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Read endpoint for the admin project list.
 *
 * Mutations live in Server Actions (`src/app/actions/projects.ts`); the
 * duplicate POST/PUT/DELETE handlers that used to sit here were unreachable
 * from the UI and were entirely unauthenticated.
 */
export async function GET() {
  try {
    await requireAdmin();
    return jsonOk({ projects: await getProjects() });
  } catch (error) {
    return handleRouteError(error, "GET /api/projects");
  }
}
