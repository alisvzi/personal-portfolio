/**
 * Shared domain types.
 *
 * These describe the *serialised* shape that crosses the server/client
 * boundary. Mongoose documents are never passed to Client Components directly:
 * ObjectId instances are not serialisable, so the data layer maps `_id` to a
 * plain string `id` first.
 */

import type { Locale } from "@/i18n/config";

export type { Locale };

/** Anchor ids of the landing page sections, in document order. */
export type SectionId = "home" | "about" | "experience" | "work" | "contact";

/** One image in a project gallery, with its optional ThumbHash placeholder. */
export interface ProjectImage {
  url: string;
  placeholder?: string;
}

export interface Project {
  id: string;
  /**
   * URL segment of the project's detail page.
   *
   * Always present on the serialised shape: the data layer derives one from the
   * title for records that predate the field, so every project has a stable,
   * linkable page.
   */
  slug: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  /** Long-form case study, stored as plain paragraphs. */
  longDescription?: string;
  longDescriptionFa?: string;
  /** The owner's role on the project, e.g. "Front-end lead". */
  role?: string;
  /** Free-form year label, e.g. "2024" or "2023–2024". */
  year?: string;
  client?: string;
  imageUrl: string;
  imagePlaceholderUrl?: string;
  gallery?: ProjectImage[];
  githubUrl?: string;
  projectUrl?: string;
  /** Comma-separated list, as stored in the database. */
  technologies: string;
  featured: boolean;
  order: number;
  /** ISO timestamps from Mongoose, used by the sitemap and structured data. */
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  nameFa?: string;
  category?: string;
  level?: number;
  icon?: string;
  order: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
}

export interface Content {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;

  /**
   * Persian variants. Optional so an existing document — and the built-in
   * defaults — remain valid; the renderer falls back to the base value.
   */
  heroTitleFa?: string;
  heroSubtitleFa?: string;
  heroDescriptionFa?: string;
  aboutTextFa?: string;

  /** ISO timestamp of the last content edit, for the sitemap and JSON-LD. */
  updatedAt?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/** Everything the public landing page needs, fetched in a single round trip. */
export interface PortfolioData {
  content: Content;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
}
