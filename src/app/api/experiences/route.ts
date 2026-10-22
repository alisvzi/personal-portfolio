import { handleRouteError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getExperiences } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Read endpoint for the admin experience list. Mutations are Server Actions. */
export async function GET() {
  try {
    await requireAdmin();
    return jsonOk({ experiences: await getExperiences() });
  } catch (error) {
    return handleRouteError(error, "GET /api/experiences");
  }
}
