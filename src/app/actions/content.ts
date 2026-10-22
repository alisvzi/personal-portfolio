"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_CONTENT } from "@/lib/data";
import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";
import { isEmail } from "@/lib/validation";
import type { Content } from "@/types";

/**
 * Editing the landing-page copy.
 *
 * Each field is a named key rather than an arbitrary property write. The
 * previous implementation assigned `doc[key] = value` straight from the
 * request, which let a caller write any schema path they could guess.
 */

const EDITABLE_FIELDS = {
  heroTitle: 160,
  heroSubtitle: 160,
  heroDescription: 600,
  aboutText: 4000,
  contactEmail: 254,
  contactPhone: 40,
  heroTitleFa: 160,
  heroSubtitleFa: 160,
  heroDescriptionFa: 600,
  aboutTextFa: 4000,
} as const satisfies Record<keyof Content, number>;

type EditableField = keyof typeof EDITABLE_FIELDS;

function isEditableField(key: string): key is EditableField {
  return Object.prototype.hasOwnProperty.call(EDITABLE_FIELDS, key);
}

/**
 * Fields the schema marks `required`.
 *
 * The `*Fa` translations are deliberately absent: they are optional, and
 * clearing one must be allowed so the site falls back to the base value.
 * For a required field an empty submission has to be rejected *here*, because
 * `runValidators` would otherwise throw and the panel would show a generic
 * "could not save" instead of "a value is required".
 */
const REQUIRED_FIELDS = new Set<EditableField>([
  "heroTitle",
  "heroSubtitle",
  "heroDescription",
  "aboutText",
  "contactEmail",
  "contactPhone",
]);

export async function updateContent(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const key = formData.get("key");
    const value = formData.get("value");

    if (typeof key !== "string" || !isEditableField(key)) {
      return { success: false, error: "unknownField" };
    }
    if (typeof value !== "string") {
      return { success: false, error: "valueRequired" };
    }

    const trimmed = value.trim();
    if (REQUIRED_FIELDS.has(key) && trimmed.length === 0) {
      return { success: false, error: "valueRequired" };
    }
    if (trimmed.length > EDITABLE_FIELDS[key]) {
      return { success: false, error: "valueTooLong" };
    }
    if (key === "contactEmail" && !isEmail(trimmed)) {
      return { success: false, error: "emailInvalid" };
    }

    await connectDB();
    const existing = await ContentModel.findOne().exec();

    if (existing) {
      await ContentModel.findByIdAndUpdate(
        existing._id,
        { [key]: trimmed },
        { runValidators: true },
      ).exec();
    } else {
      await ContentModel.create({ ...DEFAULT_CONTENT, [key]: trimmed });
    }

    revalidatePath("/", "layout");
    return actionOk();
  } catch (error) {
    console.error("[actions] updateContent failed:", error);
    return actionError(error, "saveFailed");
  }
}
