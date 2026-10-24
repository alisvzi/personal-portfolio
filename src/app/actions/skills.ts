"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionErrorKey, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { execute, isValidId, query } from "@/lib/db/postgres";
import { LIMITS, formNumber, formString } from "@/lib/validation";

/** Skill mutations. Every entry point is gated behind an admin session. */

const INSERT_SKILL = `insert into skills
  (name, name_fa, category, level, icon, sort_order)
  values ($1, $2, $3, $4, $5, $6)`;

const UPDATE_SKILL = `update skills set
  name = $1, name_fa = $2, category = $3, level = $4, icon = $5,
  sort_order = $6, updated_at = now()
  where id = $7
  returning id`;

function skillValues(form: FormData): unknown[] {
  return [
    formString(form, "name"),
    formString(form, "nameFa") ?? null,
    formString(form, "category") ?? null,
    formNumber(form, "level", 50, { min: 0, max: 100 }),
    formString(form, "icon") ?? null,
    formNumber(form, "order", 0),
  ];
}

function validate(form: FormData): ActionErrorKey | null {
  const name = formString(form, "name");
  if (!name) return "nameRequired";
  if (name.length > LIMITS.skillName) return "nameTooLong";

  const nameFa = formString(form, "nameFa");
  if (nameFa && nameFa.length > LIMITS.skillName) return "nameFaTooLong";

  const category = formString(form, "category");
  if (category && category.length > LIMITS.category) return "categoryTooLong";

  return null;
}

export async function createSkill(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const error = validate(form);
    if (error) return { success: false, error };

    await execute(INSERT_SKILL, skillValues(form));

    revalidatePath("/", "layout");
    return actionOk();
  } catch (err) {
    console.error("[actions] createSkill failed:", err);
    return actionError(err, "saveFailed");
  }
}

export async function updateSkill(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = formString(form, "id");
    if (!isValidId(id)) return { success: false, error: "idRequired" };

    const error = validate(form);
    if (error) return { success: false, error };

    const updated = await query<{ id: string }>(UPDATE_SKILL, [
      ...skillValues(form),
      id,
    ]);

    if (updated.length === 0) return { success: false, error: "notFound" };

    revalidatePath("/", "layout");
    return actionOk();
  } catch (err) {
    console.error("[actions] updateSkill failed:", err);
    return actionError(err, "saveFailed");
  }
}

export async function deleteSkill(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = formString(form, "id");
    if (!isValidId(id)) return { success: false, error: "idRequired" };

    const deleted = await query<{ id: string }>(
      "delete from skills where id = $1 returning id",
      [id],
    );
    if (deleted.length === 0) return { success: false, error: "notFound" };

    revalidatePath("/", "layout");
    return actionOk();
  } catch (err) {
    console.error("[actions] deleteSkill failed:", err);
    return actionError(err, "deleteFailed");
  }
}
