"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionErrorKey, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongodb";
import ExperienceModel from "@/lib/models/Experience";
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

    await connectDB();
    await ExperienceModel.create(parsed.data);

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
    if (!id) return { success: false, error: "idRequired" };

    const parsed = parse(form);
    if ("error" in parsed) return { success: false, error: parsed.error };

    await connectDB();
    const updated = await ExperienceModel.findByIdAndUpdate(id, parsed.data, {
      runValidators: true,
    }).exec();

    if (!updated) return { success: false, error: "notFound" };

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
    if (!id) return { success: false, error: "idRequired" };

    await connectDB();
    const deleted = await ExperienceModel.findByIdAndDelete(id).exec();
    if (!deleted) return { success: false, error: "notFound" };

    revalidatePath("/", "layout");
    return actionOk();
  } catch (error) {
    console.error("[actions] deleteExperience failed:", error);
    return actionError(error, "deleteFailed");
  }
}
