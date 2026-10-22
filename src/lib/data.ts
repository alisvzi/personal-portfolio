import { cache } from "react";

import { connectDB } from "@/lib/db/mongodb";
import { PERSON } from "@/lib/constants";
import { slugify, uniqueSlug } from "@/lib/slug";
import ContentModel from "@/lib/models/Content";
import ExperienceModel from "@/lib/models/Experience";
import MessageModel from "@/lib/models/Message";
import ProjectModel from "@/lib/models/Project";
import SkillModel from "@/lib/models/Skill";
import type {
  Content,
  Experience,
  Message,
  PortfolioData,
  Project,
  ProjectImage,
  Skill,
} from "@/types";

/**
 * Data access layer.
 *
 * All database reads for the UI go through here so that query shape, sorting,
 * projections and serialisation are defined once. Route Handlers and Server
 * Components both call these functions instead of talking to Mongoose directly.
 *
 * Each reader is wrapped in React's `cache()`. Within a single render pass the
 * landing page previously issued four identical `ContentModel.findOne()` calls
 * (layout sidebar, hero, about and contact sections); they now collapse to one
 * query and one document parse.
 */

/**
 * Converts a lean Mongoose document to the plain, serialisable shape the UI
 * consumes: `_id` becomes a string `id`, internal fields are dropped.
 *
 * The result is typed as `Record<string, unknown>` on purpose — each reader
 * below narrows the fields it knows about. Casting to the domain type happens
 * once, at the end, where the shape is actually guaranteed by the schema.
 */
function toPlain(doc: unknown): Record<string, unknown> {
  const { _id, ...rest } = doc as Record<string, unknown> & { _id: unknown };
  delete rest.__v;
  return { ...rest, id: String(_id) };
}

/** Sensible defaults so the site renders before the admin has saved anything. */
export const DEFAULT_CONTENT: Content = {
  heroTitle: PERSON.nameEn,
  heroSubtitle: "Frontend Developer",
  heroDescription: "I build things for the web.",
  aboutText: `Hi, I'm ${PERSON.nameEn}, a front-end developer building clean, responsive web experiences with React and Next.js.`,
  contactEmail: "ali.soveizi@example.com",
  contactPhone: "+98 912 345 6789",

  // Persian defaults for the persisted copy. Authored, not machine-translated:
  // these are the words the site shows when the owner has not written their own.
  //
  // `heroTitleFa` is the Persian spelling of the name. A name is not
  // translated, but it *is* transliterated — and a Persian reader searching for
  // the Persian spelling must land on a page that shows it. Defaulting it here
  // means the Persian page is correct even before the owner saves the content
  // document, instead of silently falling back to the Latin spelling.
  heroTitleFa: PERSON.nameFa,
  heroSubtitleFa: "توسعهدهنده فرانتاند",
  heroDescriptionFa: "برای وب چیزهایی میسازم.",
  aboutTextFa:
    "سلام، من علی سویزی هستم؛ توسعهدهنده فرانتاند که تجربههای وب تمیز و واکنشگرا با React و Next.js میسازد.",
};

const CONTENT_FIELDS =
  "heroTitle heroSubtitle heroDescription aboutText contactEmail contactPhone heroTitleFa heroSubtitleFa heroDescriptionFa aboutTextFa";

/**
 * Empty strings in the Persian variants are normalised to `undefined` so the
 * renderer's fallback check is a single truthiness test.
 */
function optionalText(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const getContent = cache(async (): Promise<Content> => {
  await connectDB();
  const doc = await ContentModel.findOne()
    .select(CONTENT_FIELDS)
    .lean<Content>()
    .exec();

  if (!doc) return DEFAULT_CONTENT;

  return {
    heroTitle: doc.heroTitle || DEFAULT_CONTENT.heroTitle,
    heroSubtitle: doc.heroSubtitle || DEFAULT_CONTENT.heroSubtitle,
    heroDescription: doc.heroDescription || DEFAULT_CONTENT.heroDescription,
    aboutText: doc.aboutText || DEFAULT_CONTENT.aboutText,
    contactEmail: doc.contactEmail || DEFAULT_CONTENT.contactEmail,
    contactPhone: doc.contactPhone || DEFAULT_CONTENT.contactPhone,
    heroTitleFa: optionalText(doc.heroTitleFa) ?? DEFAULT_CONTENT.heroTitleFa,
    heroSubtitleFa:
      optionalText(doc.heroSubtitleFa) ?? DEFAULT_CONTENT.heroSubtitleFa,
    heroDescriptionFa:
      optionalText(doc.heroDescriptionFa) ?? DEFAULT_CONTENT.heroDescriptionFa,
    aboutTextFa: optionalText(doc.aboutTextFa) ?? DEFAULT_CONTENT.aboutTextFa,
  };
});

/** Date → ISO string, so the serialised shape stays plain JSON. */
function toIso(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  return undefined;
}

/** Drops gallery entries without a usable URL (e.g. an aborted upload). */
function readGallery(value: unknown): ProjectImage[] {
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
 * Projects, with a guaranteed unique slug on every record.
 *
 * The slug is normally persisted by the admin panel, but records created before
 * detail pages existed have none — and a project without a slug would have no
 * page at all. Deriving one here (and de-duplicating with a numeric suffix)
 * means every project is addressable immediately, with no migration step.
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  await connectDB();
  const docs = await ProjectModel.find({})
    .sort({ featured: -1, order: 1, _id: -1 })
    .lean()
    .exec();

  const taken = new Set<string>();

  return docs.map((doc) => {
    const project = toPlain(doc);
    const stored = typeof project.slug === "string" ? project.slug.trim() : "";
    const base =
      (stored && slugify(stored)) ||
      slugify(String(project.title ?? "")) ||
      `project-${project.id}`;
    const slug = uniqueSlug(base, taken);
    taken.add(slug);

    return {
      ...project,
      slug,
      gallery: readGallery(project.gallery),
      featured: Boolean(project.featured),
      order: typeof project.order === "number" ? project.order : 0,
      createdAt: toIso(project.createdAt),
      updatedAt: toIso(project.updatedAt),
    } as unknown as Project;
  });
});

/**
 * One project by its URL slug.
 *
 * Resolved from the cached list rather than a query: the collection is small,
 * the list is already in memory for this render pass, and a string comparison
 * cannot be turned into a query operator — which keeps an attacker-supplied
 * slug from ever reaching MongoDB as anything but a plain string.
 */
export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export const getSkills = cache(async (): Promise<Skill[]> => {
  await connectDB();
  const docs = await SkillModel.find({}).sort({ order: 1, name: 1 }).lean().exec();

  return docs.map((doc) => {
    const skill = toPlain(doc);
    return {
      ...skill,
      order: typeof skill.order === "number" ? skill.order : 0,
    } as unknown as Skill;
  });
});

export const getExperiences = cache(async (): Promise<Experience[]> => {
  await connectDB();
  const docs = await ExperienceModel.find({}).sort({ order: 1, _id: -1 }).lean().exec();

  return docs.map((doc) => {
    const experience = toPlain(doc);
    return {
      ...experience,
      technologies: Array.isArray(experience.technologies)
        ? (experience.technologies as string[])
        : [],
      order: typeof experience.order === "number" ? experience.order : 0,
    } as unknown as Experience;
  });
});

/**
 * Everything the landing page needs, in one parallel round trip.
 *
 * Fetching in the page and passing props down replaces five `*Server` wrapper
 * components that each awaited their own query in sequence.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  const [content, projects, skills, experiences] = await Promise.all([
    getContent(),
    getProjects(),
    getSkills(),
    getExperiences(),
  ]);

  return { content, projects, skills, experiences };
}

/** Admin-only. Contact form submissions, newest first. */
export const getMessages = cache(async (): Promise<Message[]> => {
  await connectDB();
  const docs = await MessageModel.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean()
    .exec();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    subject: doc.subject ?? "",
    message: doc.message,
    read: Boolean(doc.read),
    createdAt: new Date(doc.createdAt).toISOString(),
  }));
});
