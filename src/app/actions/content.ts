"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_CONTENT } from "@/lib/data";
import { execute, query } from "@/lib/db/postgres";
import { isEmail } from "@/lib/validation";
import type { Content } from "@/types";

/**
 * Editing the landing-page copy.
 *
 * Each field is a named key rather than an arbitrary property write. The
 * previous implementation assigned `doc[key] = value` straight from the
 * request, which let a caller write any schema path they could guess.
 *
 * The map below is also the SQL allow-list: the column name interpolated into
 * the `update` statement comes from this literal table, never from the request.
 */

const EDITABLE_FIELDS = {
  heroTitle: { column: "hero_title", max: 160 },
  heroSubtitle: { column: "hero_subtitle", max: 160 },
  heroDescription: { column: "hero_description", max: 600 },
  aboutText: { column: "about_text", max: 4000 },
  contactEmail: { column: "contact_email", max: 254 },
  contactPhone: { column: "contact_phone", max: 40 },
  heroTitleFa: { column: "hero_title_fa", max: 160 },
  heroSubtitleFa: { column: "hero_subtitle_fa", max: 160 },
  heroDescriptionFa: { column: "hero_description_fa", max: 600 },
  aboutTextFa: { column: "about_text_fa", max: 4000 },
} as const;

type EditableField = keyof typeof EDITABLE_FIELDS;

function isEditableField(key: string): key is EditableField {
  return Object.prototype.hasOwnProperty.call(EDITABLE_FIELDS, key);
}

/**
 * Fields the table marks `not null`.
 *
 * The `*Fa` translations are deliberately absent: they are optional, and
 * clearing one must be allowed so the site falls back to the base value.
 * For a required field an empty submission has to be rejected *here*, because
 * the database would otherwise reject the row and the panel would show a
 * generic "could not save" instead of "a value is required".
 */
const REQUIRED_FIELDS = new Set<EditableField>([
  "heroTitle",
  "heroSubtitle",
  "heroDescription",
  "aboutText",
  "contactEmail",
  "contactPhone",
]);

const INSERT_CONTENT = `insert into contents
  (hero_title, hero_subtitle, hero_description, about_text, contact_email,
   contact_phone, hero_title_fa, hero_subtitle_fa, hero_description_fa,
   about_text_fa)
  values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

function contentValues(content: Content): unknown[] {
  return [
    content.heroTitle,
    content.heroSubtitle,
    content.heroDescription,
    content.aboutText,
    content.contactEmail,
    content.contactPhone,
    content.heroTitleFa ?? null,
    content.heroSubtitleFa ?? null,
    content.heroDescriptionFa ?? null,
    content.aboutTextFa ?? null,
  ];
}

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

    const field = EDITABLE_FIELDS[key];
    const trimmed = value.trim();

    if (REQUIRED_FIELDS.has(key) && trimmed.length === 0) {
      return { success: false, error: "valueRequired" };
    }
    if (trimmed.length > field.max) {
      return { success: false, error: "valueTooLong" };
    }
    if (key === "contactEmail" && !isEmail(trimmed)) {
      return { success: false, error: "emailInvalid" };
    }

    const existing = await query<{ id: string }>(
      "select id from contents order by created_at asc limit 1",
    );

    if (existing[0]) {
      // `field.column` is one of the literal column names above, never input.
      await execute(
        `update contents set ${field.column} = $1, updated_at = now() where id = $2`,
        [trimmed, existing[0].id],
      );
    } else {
      const seeded: Content = { ...DEFAULT_CONTENT, [key]: trimmed };
      await execute(INSERT_CONTENT, contentValues(seeded));
    }

    revalidatePath("/", "layout");
    return actionOk();
  } catch (error) {
    console.error("[actions] updateContent failed:", error);
    return actionError(error, "saveFailed");
  }
}
