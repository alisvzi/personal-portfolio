"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionErrorKey, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { execute, isValidId, query } from "@/lib/db/postgres";
import { LIMITS, formNumber, formString, parseTechnologies } from "@/lib/validation";

/** Experience mutations. Every entry point is gated behind an admin session. */

interface ExperienceInput {
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
}

const INSERT_EXPERIENCE = `insert into experiences
  (title, company, period, description, technologies, sort_order)
  values ($1, $2, $3, $4, $5, $6)`;

const UPDATE_EXPERIENCE = `update experiences set
  title = $1, company = $2, period = $3, description = $4,
  technologies = $5, sort_order = $6, updated_at = now()
  where id = $7
  returning id`;

/**
 * The `technologies` column is jsonb, so the array is serialised explicitly —
 * passing a JS array would be sent as a Postgres array literal instead.
 */
function experienceValues(data: ExperienceInput): unknown[] {
  return [
    data.title,
    data.company,
    data.period,
    data.description,
    JSON.stringify(data.technologies),
    data.order,
  ];
}

function parse(
  form: FormData,
): { data: ExperienceInput } | { error: ActionErrorKey } {
  const title = formString(form, "title");
  const company = formString(form, "company");
  const period = formString(form, "period");
  const description = formString(form, "description");
  const technologiesRaw = formString(form, "technologies");

  if (!title || !company || !period || !description || !technologiesRaw) {
    return { error: "experienceFieldsRequired" };
  }
  if (title.length > LIMITS.title || company.length > LIMITS.company) {
    return { error: "roleCompanyTooLong" };
  }
  if (period.length > LIMITS.period) {
    return { error: "periodTooLong" };
  }
  if (description.length > LIMITS.description) {
    return { error: "descriptionTooLong" };
  }

  const technologies = parseTechnologies(technologiesRaw);
  if (technologies.length === 0) {
    return { error: "technologiesRequired" };
  }

  return {
    data: {
      title,
      company,
      period,
      description,
      technologies,
      order: formNumber(form, "order", 0),
    },
  };
}

export async function createExperience(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = parse(form);
    if ("error" in parsed) return { success: false, error: parsed.error };

    await execute(INSERT_EXPERIENCE, experienceValues(parsed.data));

    revalidatePath("/", "layout");
    return actionOk();
  } catch (error) {
    console.error("[actions] createExperience failed:", error);
    return actionError(error, "saveFailed");
  }
}

export async function updateExperience(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = formString(form, "id");
    if (!isValidId(id)) return { success: false, error: "idRequired" };

    const parsed = parse(form);
    if ("error" in parsed) return { success: false, error: parsed.error };

    const updated = await query<{ id: string }>(UPDATE_EXPERIENCE, [
      ...experienceValues(parsed.data),
      id,
    ]);

    if (updated.length === 0) return { success: false, error: "notFound" };

    revalidatePath("/", "layout");
    return actionOk();
  } catch (error) {
    console.error("[actions] updateExperience failed:", error);
    return actionError(error, "saveFailed");
  }
}

export async function deleteExperience(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = formString(form, "id");
    if (!isValidId(id)) return { success: false, error: "idRequired" };

    const deleted = await query<{ id: string }>(
      "delete from experiences where id = $1 returning id",
      [id],
    );
    if (deleted.length === 0) return { success: false, error: "notFound" };

    revalidatePath("/", "layout");
    return actionOk();
  } catch (error) {
    console.error("[actions] deleteExperience failed:", error);
    return actionError(error, "deleteFailed");
  }
}
