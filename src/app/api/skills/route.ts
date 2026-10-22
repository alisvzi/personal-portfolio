import { handleRouteError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getSkills } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Read endpoint for the admin skill list. Mutations are Server Actions. */
export async function GET() {
  try {
    await requireAdmin();
    return jsonOk({ skills: await getSkills() });
  } catch (error) {
    return handleRouteError(error, "GET /api/skills");
  }
}
