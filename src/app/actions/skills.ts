"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionErrorKey, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongodb";
import SkillModel from "@/lib/models/Skill";
import { LIMITS, formNumber, formString } from "@/lib/validation";

/** Skill mutations. Every entry point is gated behind an admin session. */

function buildSkillData(form: FormData) {
  return {
    name: formString(form, "name")!,
    nameFa: formString(form, "nameFa"),
    category: formString(form, "category"),
    level: formNumber(form, "level", 50, { min: 0, max: 100 }),
    icon: formString(form, "icon"),
    order: formNumber(form, "order", 0),
  };
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

    await connectDB();
    await SkillModel.create(buildSkillData(form));

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
    if (!id) return { success: false, error: "idRequired" };

    const error = validate(form);
    if (error) return { success: false, error };

    await connectDB();
    const updated = await SkillModel.findByIdAndUpdate(id, buildSkillData(form), {
      runValidators: true,
    }).exec();

    if (!updated) return { success: false, error: "notFound" };

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
    if (!id) return { success: false, error: "idRequired" };

    await connectDB();
    const deleted = await SkillModel.findByIdAndDelete(id).exec();
    if (!deleted) return { success: false, error: "notFound" };

    revalidatePath("/", "layout");
    return actionOk();
  } catch (err) {
    console.error("[actions] deleteSkill failed:", err);
    return actionError(err, "deleteFailed");
  }
}
