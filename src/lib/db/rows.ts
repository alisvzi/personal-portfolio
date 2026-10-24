import type {
  Content,
  Experience,
  Message,
  Project,
  ProjectImage,
  Skill,
} from "@/types";

/**
 * Row → domain mapping.
 *
 * Kept in one place so the snake_case column names appear exactly once in the
 * codebase. Every consumer (data layer, Server Actions, route handlers) reads
 * the camelCase domain types, which is what the UI already expects — the
 * storage engine is the only thing that changed.
 */

export interface ContentRow {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  hero_title_fa: string | null;
  hero_subtitle_fa: string | null;
  hero_description_fa: string | null;
  about_text_fa: string | null;
  updated_at: string | Date | null;
}

export interface ProjectRow {
  id: string;
  slug: string | null;
  title: string;
  title_fa: string | null;
  description: string;
  description_fa: string | null;
  long_description: string | null;
  long_description_fa: string | null;
  role: string | null;
  year: string | null;
  client: string | null;
  image_url: string;
  image_placeholder_url: string | null;
  gallery: unknown;
  github_url: string | null;
  project_url: string | null;
  technologies: string;
  featured: boolean;
  sort_order: number;
  created_at: string | Date | null;
  updated_at: string | Date | null;
}

export interface SkillRow {
  id: string;
  name: string;
  name_fa: string | null;
  category: string | null;
  level: number | null;
  icon: string | null;
  sort_order: number;
}

export interface ExperienceRow {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: unknown;
  title_fa: string | null;
  company_fa: string | null;
  period_fa: string | null;
  description_fa: string | null;
  technologies_fa: unknown;
  sort_order: number;
}

export interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string | Date | null;
}

/** Date → ISO string, so the serialised shape stays plain JSON. */
export function toIso(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  return undefined;
}

/** `null` from SQL becomes `undefined` on the optional domain fields. */
function optional(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Drops gallery entries without a usable URL (e.g. an aborted upload). */
export function readGallery(value: unknown): ProjectImage[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    const item = entry as Record<string, unknown>;
    const url = typeof item.url === "string" ? item.url.trim() : "";
    if (!url) return [];
    return [
      {
        url,
        placeholder:
          typeof item.placeholder === "string" ? item.placeholder : undefined,
      },
    ];
  });
}

/**
 * Content fields only — the caller merges these over `DEFAULT_CONTENT`, so a
 * blank column falls back rather than rendering an empty heading.
 */
export function toContent(row: ContentRow): Content {
  return {
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroDescription: row.hero_description,
    aboutText: row.about_text,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    heroTitleFa: optional(row.hero_title_fa),
    heroSubtitleFa: optional(row.hero_subtitle_fa),
    heroDescriptionFa: optional(row.hero_description_fa),
    aboutTextFa: optional(row.about_text_fa),
    updatedAt: toIso(row.updated_at),
  };
}

/**
 * A project row.
 *
 * `slug` may be empty: the data layer derives and de-duplicates one at read
 * time so that a record created before detail pages existed is still
 * addressable.
 */
export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug?.trim() ?? "",
    title: row.title,
    titleFa: optional(row.title_fa),
    description: row.description,
    descriptionFa: optional(row.description_fa),
    longDescription: optional(row.long_description),
    longDescriptionFa: optional(row.long_description_fa),
    role: optional(row.role),
    year: optional(row.year),
    client: optional(row.client),
    imageUrl: row.image_url,
    imagePlaceholderUrl: optional(row.image_placeholder_url),
    gallery: readGallery(row.gallery),
    githubUrl: optional(row.github_url),
    projectUrl: optional(row.project_url),
    technologies: row.technologies,
    featured: Boolean(row.featured),
    order: typeof row.sort_order === "number" ? row.sort_order : 0,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function toSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    nameFa: optional(row.name_fa),
    category: optional(row.category),
    level: typeof row.level === "number" ? row.level : undefined,
    icon: optional(row.icon),
    order: typeof row.sort_order === "number" ? row.sort_order : 0,
  };
}

/** jsonb array → `string[]`, dropping anything that is not a usable label. */
function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry !== "string") return [];
    const trimmed = entry.trim();
    return trimmed ? [trimmed] : [];
  });
}

/**
 * An experience row.
 *
 * `technologies` and `technologies_fa` are jsonb: the driver hands back parsed
 * arrays, but a hand-written value could arrive as a bare string, so both are
 * funnelled through the same reader.
 */
export function toExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    period: row.period,
    description: row.description,
    technologies: readStringArray(row.technologies),
    titleFa: optional(row.title_fa),
    companyFa: optional(row.company_fa),
    periodFa: optional(row.period_fa),
    descriptionFa: optional(row.description_fa),
    technologiesFa: readStringArray(row.technologies_fa),
    order: typeof row.sort_order === "number" ? row.sort_order : 0,
  };
}

export function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject ?? "",
    message: row.message,
    read: Boolean(row.read),
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
  };
}
