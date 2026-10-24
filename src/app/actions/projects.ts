"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionOk, type ActionErrorKey, type ActionResult } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { execute, isValidId, query } from "@/lib/db/postgres";
import { toProject, type ProjectRow } from "@/lib/db/rows";
import { blobReadWriteToken } from "@/lib/env";
import { isValidSlug, slugify } from "@/lib/slug";
import {
  ImageValidationError,
  deleteImage,
  saveGeneratedImage,
  saveImage,
} from "@/lib/storage";
import { createPlaceholderBuffer } from "@/lib/utils/image/placeholder";
import {
  LIMITS,
  formCheckbox,
  formNumber,
  formString,
  isSafeHttpUrl,
} from "@/lib/validation";
import type { ProjectImage } from "@/types";

/**
 * Project mutations.
 *
 * Every exported function starts by calling `requireAdmin()`. Server Actions
 * are public HTTP endpoints: hiding the admin UI does not protect them, and a
 * `proxy.ts` matcher must not be the only gate because a matcher can silently
 * stop covering a route when files move.
 *
 * Validation failures are returned as dictionary keys (`admin.errors.*`) so the
 * panel renders them in the admin's current language.
 */

const PROJECT_COLUMNS = `id, slug, title, title_fa, description, description_fa,
  long_description, long_description_fa, role, year, client, image_url,
  image_placeholder_url, gallery, github_url, project_url, technologies,
  featured, sort_order, created_at, updated_at`;

/**
 * The complete writable state of a project row.
 *
 * Both insert and update take this shape and pass it to a statement with a
 * fixed column list. Nothing here is derived from request keys, so no column
 * name is ever interpolated from user input.
 */
interface ProjectFields {
  slug: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  longDescription?: string;
  longDescriptionFa?: string;
  role?: string;
  year?: string;
  client?: string;
  imageUrl: string;
  imagePlaceholderUrl?: string;
  gallery: ProjectImage[];
  githubUrl?: string;
  projectUrl?: string;
  technologies: string;
  featured: boolean;
  order: number;
}

const INSERT_PROJECT = `insert into projects
  (slug, title, title_fa, description, description_fa, long_description,
   long_description_fa, role, year, client, image_url, image_placeholder_url,
   gallery, github_url, project_url, technologies, featured, sort_order)
  values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18)
  returning id`;

const UPDATE_PROJECT = `update projects set
  slug = $1, title = $2, title_fa = $3, description = $4, description_fa = $5,
  long_description = $6, long_description_fa = $7, role = $8, year = $9,
  client = $10, image_url = $11, image_placeholder_url = $12, gallery = $13,
  github_url = $14, project_url = $15, technologies = $16, featured = $17,
  sort_order = $18, updated_at = now()
  where id = $19
  returning id`;

/** `gallery` is jsonb, so the array is serialised rather than sent as-is. */
function projectValues(project: ProjectFields): unknown[] {
  return [
    project.slug,
    project.title,
    project.titleFa ?? null,
    project.description,
    project.descriptionFa ?? null,
    project.longDescription ?? null,
    project.longDescriptionFa ?? null,
    project.role ?? null,
    project.year ?? null,
    project.client ?? null,
    project.imageUrl,
    project.imagePlaceholderUrl ?? null,
    JSON.stringify(project.gallery),
    project.githubUrl ?? null,
    project.projectUrl ?? null,
    project.technologies,
    project.featured,
    project.order,
  ];
}

function revalidatePublicPages(): void {
  // Revalidates every route underneath the root layout, covering both locales
  // and every project detail page.
  revalidatePath("/", "layout");
}

function readImageField(form: FormData): File | null {
  const value = form.get("imageUrl");
  return value instanceof File && value.size > 0 ? value : null;
}

/** Gallery uploads, capped so a single save cannot fan out into dozens of writes. */
function readGalleryFiles(form: FormData): File[] {
  return form
    .getAll("gallery")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, LIMITS.gallery);
}

/** URLs of existing gallery images the admin ticked for removal. */
function readRemovedGalleryUrls(form: FormData): Set<string> {
  return new Set(
    form
      .getAll("galleryRemove")
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  );
}

/**
 * A year label: `2024`, or a range like `2023–2024`.
 *
 * Kept deliberately loose — this is a display label, not a date column — but
 * strict enough that a stray sentence cannot end up in the `<time>` element.
 */
const YEAR_PATTERN = /^\d{4}(?:\s*[-–—]\s*\d{4})?$/;

function validateProjectFields(form: FormData): ActionErrorKey | null {
  const title = formString(form, "title");
  const description = formString(form, "description");

  if (!title) return "titleRequired";
  if (title.length > LIMITS.title) return "titleTooLong";

  if (!description) return "descriptionRequired";
  if (description.length > LIMITS.description) return "descriptionTooLong";

  if (!formString(form, "technologies")) return "technologiesRequired";

  const slug = formString(form, "slug");
  if (slug && !isValidSlug(slug)) return "slugInvalid";

  const year = formString(form, "year");
  if (year && !YEAR_PATTERN.test(year)) return "yearInvalid";

  const longDescription = formString(form, "longDescription");
  if (longDescription && longDescription.length > LIMITS.longDescription) {
    return "descriptionTooLong";
  }

  const longDescriptionFa = formString(form, "longDescriptionFa");
  if (longDescriptionFa && longDescriptionFa.length > LIMITS.longDescription) {
    return "descriptionTooLong";
  }

  const role = formString(form, "role");
  if (role && role.length > LIMITS.role) return "descriptionTooLong";

  const client = formString(form, "client");
  if (client && client.length > LIMITS.client) return "descriptionTooLong";

  const projectUrl = formString(form, "projectUrl");
  if (projectUrl && !isSafeHttpUrl(projectUrl)) return "projectUrlInvalid";

  const githubUrl = formString(form, "githubUrl");
  if (githubUrl && !isSafeHttpUrl(githubUrl)) return "githubUrlInvalid";

  return null;
}

/** The form fields other than slug, image and gallery. */
function buildProjectData(form: FormData) {
  return {
    title: formString(form, "title")!,
    titleFa: formString(form, "titleFa"),
    description: formString(form, "description")!,
    descriptionFa: formString(form, "descriptionFa"),
    longDescription: formString(form, "longDescription"),
    longDescriptionFa: formString(form, "longDescriptionFa"),
    role: formString(form, "role"),
    year: formString(form, "year"),
    client: formString(form, "client"),
    projectUrl: formString(form, "projectUrl"),
    githubUrl: formString(form, "githubUrl"),
    technologies: formString(form, "technologies")!,
    featured: formCheckbox(form, "featured"),
    order: formNumber(form, "order", 0),
  };
}

/**
 * Resolves a unique slug for a project.
 *
 * The submitted value wins when it is valid; otherwise one is derived from the
 * title. A suffix is appended only on an actual collision, so the common case
 * produces exactly the URL the owner expects.
 */
async function resolveSlug(
  submitted: string | undefined,
  title: string,
  excludeId?: string,
): Promise<string> {
  const desired =
    (submitted && slugify(submitted)) ||
    slugify(title) ||
    `project-${Date.now().toString(36)}`;

  let candidate = desired;
  let counter = 2;

  // Bounded: 50 attempts is far beyond any realistic number of collisions and
  // guarantees the loop cannot spin forever on a corrupted table.
  while (counter < 50) {
    const clash = await query<{ id: string }>(
      excludeId
        ? "select id from projects where slug = $1 and id <> $2 limit 1"
        : "select id from projects where slug = $1 limit 1",
      excludeId ? [candidate, excludeId] : [candidate],
    );
    if (clash.length === 0) break;
    candidate = `${desired}-${counter}`;
    counter += 1;
  }

  return candidate;
}

async function findProject(id: string) {
  const rows = await query<ProjectRow>(
    `select ${PROJECT_COLUMNS} from projects where id = $1 limit 1`,
    [id],
  );
  return rows[0] ? toProject(rows[0]) : null;
}

export async function createProject(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const error = validateProjectFields(form);
    if (error) return { success: false, error };

    const token = blobReadWriteToken();
    const slug = await resolveSlug(formString(form, "slug"), formString(form, "title")!);

    const file = readImageField(form);
    const image = file
      ? await saveImage(file, token)
      : await saveGeneratedImage(
          await createPlaceholderBuffer({ text: formString(form, "title") ?? "" }),
          token,
        );

    const gallery: ProjectImage[] = [];
    const uploadedUrls: string[] = [image.url];

    for (const galleryFile of readGalleryFiles(form)) {
      const saved = await saveImage(galleryFile, token);
      gallery.push({ url: saved.url, placeholder: saved.placeholder ?? undefined });
      uploadedUrls.push(saved.url);
    }

    try {
      await execute(INSERT_PROJECT, [
        ...projectValues({
          ...buildProjectData(form),
          slug,
          imageUrl: image.url,
          imagePlaceholderUrl: image.placeholder ?? undefined,
          gallery,
        }),
      ]);
    } catch (error) {
      // The uploads already succeeded, so a failed insert would otherwise leave
      // orphaned objects in the blob store forever. Best-effort cleanup: the
      // original database error is the one worth surfacing.
      for (const url of uploadedUrls) {
        try {
          await deleteImage(url, token);
        } catch (cleanupError) {
          console.error("[actions] createProject: image cleanup failed:", cleanupError);
        }
      }
      throw error;
    }

    revalidatePublicPages();
    return actionOk();
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return { success: false, error: error.key, values: error.values };
    }
    console.error("[actions] createProject failed:", error);
    return actionError(error, "saveFailed");
  }
}

export async function updateProject(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = formString(form, "id");
    if (!isValidId(id)) return { success: false, error: "idRequired" };

    const error = validateProjectFields(form);
    if (error) return { success: false, error };

    const existing = await findProject(id);
    if (!existing) return { success: false, error: "notFound" };

    const token = blobReadWriteToken();
    const title = formString(form, "title")!;
    const slug = await resolveSlug(
      formString(form, "slug") || existing.slug || undefined,
      title,
      id,
    );

    /*
     * Gallery capacity is checked *before* any upload happens. The cover is
     * uploaded first, so validating afterwards would mean a rejected save still
     * left an orphaned blob behind with nothing referencing it.
     */
    const removed = readRemovedGalleryUrls(form);
    const keptGallery = (existing.gallery ?? []).filter(
      (image) => !removed.has(image.url),
    );
    const galleryFiles = readGalleryFiles(form);
    const remainingSlots = Math.max(0, LIMITS.gallery - keptGallery.length);

    if (galleryFiles.length > remainingSlots) {
      return {
        success: false,
        error: "galleryTooMany",
        values: { max: LIMITS.gallery },
      };
    }

    // --- Cover -------------------------------------------------------------
    const file = readImageField(form);
    let replacedImage: string | undefined;
    let imageUrl = existing.imageUrl;
    let imagePlaceholderUrl = existing.imagePlaceholderUrl;

    if (file) {
      const image = await saveImage(file, token);
      replacedImage = existing.imageUrl;
      imageUrl = image.url;
      imagePlaceholderUrl = image.placeholder ?? undefined;
    }

    // --- Gallery -----------------------------------------------------------
    const newGalleryImages: ProjectImage[] = [];

    for (const galleryFile of galleryFiles) {
      const saved = await saveImage(galleryFile, token);
      newGalleryImages.push({
        url: saved.url,
        placeholder: saved.placeholder ?? undefined,
      });
    }

    const nextGallery = [...keptGallery, ...newGalleryImages];

    // The whole row is written in one statement rather than a partial `$set`:
    // the column list stays fixed, so a field can never be silently omitted
    // because of a key that came from the form.
    const updated = await query<{ id: string }>(UPDATE_PROJECT, [
      ...projectValues({
        ...buildProjectData(form),
        slug,
        imageUrl,
        imagePlaceholderUrl,
        gallery: nextGallery,
      }),
      id,
    ]);

    if (updated.length === 0) return { success: false, error: "notFound" };

    // Objects are only removed once the row actually points elsewhere.
    // Deleting first would leave the project referencing files that no longer
    // exist if the update then failed.
    const orphaned = [
      ...(replacedImage ? [replacedImage] : []),
      ...Array.from(removed),
    ];

    for (const url of orphaned) {
      try {
        await deleteImage(url, token);
      } catch (cleanupError) {
        console.error("[actions] updateProject: image cleanup failed:", cleanupError);
      }
    }

    revalidatePublicPages();
    return actionOk();
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return { success: false, error: error.key, values: error.values };
    }
    console.error("[actions] updateProject failed:", error);
    return actionError(error, "saveFailed");
  }
}

export async function deleteProject(form: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const id = formString(form, "id");
    if (!isValidId(id)) return { success: false, error: "idRequired" };

    const existing = await findProject(id);
    if (!existing) return { success: false, error: "notFound" };

    const galleryUrls = (existing.gallery ?? []).map((image) => image.url);

    // Row first, files second. If a blob delete then fails we are left with an
    // orphaned object (invisible and harmless), whereas the reverse order would
    // leave a live project pointing at an image that no longer exists.
    await execute("delete from projects where id = $1", [id]);

    const token = blobReadWriteToken();
    for (const url of [existing.imageUrl, ...galleryUrls]) {
      try {
        await deleteImage(url, token);
      } catch (cleanupError) {
        console.error("[actions] deleteProject: image cleanup failed:", cleanupError);
      }
    }

    revalidatePublicPages();
    return actionOk();
  } catch (error) {
    console.error("[actions] deleteProject failed:", error);
    return actionError(error, "deleteFailed");
  }
}
