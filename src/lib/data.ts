import { cache } from "react";

import { getAdminSession } from "@/lib/auth";
import { PERSON } from "@/lib/constants";
import { isValidId, query } from "@/lib/db/postgres";
import {
  toContent,
  toExperience,
  toMessage,
  toProject,
  toSkill,
  type ContentRow,
  type ExperienceRow,
  type MessageRow,
  type ProjectRow,
  type SkillRow,
} from "@/lib/db/rows";
import { slugify, uniqueSlug } from "@/lib/slug";
import { normalizePersianFields } from "@/lib/utils/persian";
import type {
  Content,
  Experience,
  Message,
  PortfolioData,
  Project,
  Skill,
} from "@/types";

/**
 * Data access layer.
 *
 * All database reads for the UI go through here so that query shape, sorting,
 * column selection and serialisation are defined once. Route Handlers and
 * Server Components both call these functions instead of issuing SQL directly.
 *
 * Each reader is wrapped in React's `cache()`. Within a single render pass the
 * landing page would otherwise issue four identical content queries (layout
 * sidebar, hero, about and contact sections); they collapse to one.
 */

/**
 * Raised when a page has no honest fallback because the read itself failed.
 *
 * The project detail route is the only caller: a missing project and an
 * unreachable database look identical to `getProjectBySlug`, and answering
 * "404" for the second one would tell crawlers the page had been deleted.
 * Throwing lets the route error boundary offer a retry instead.
 */
export class DataUnavailableError extends Error {
  constructor(scope: string) {
    super(`Could not read "${scope}" from the database.`);
    this.name = "DataUnavailableError";
  }
}

/**
 * Runs a public read, falling back to a default when the database is
 * unreachable.
 *
 * Every page is server-rendered and reads the database on each request.
 * Without this guard a single unreachable database — a missing `DATABASE_URL`,
 * a suspended Neon branch, a cold-start timeout — throws inside the Server
 * Component render. React reports that only as "An error occurred in the
 * Server Components render" (production error #441), so the visitor sees a
 * blank error page and the real cause never leaves the function log.
 *
 * Degrading to defaults keeps the portfolio online through exactly the kind of
 * transient failure a serverless deployment sees most often. The real error is
 * logged with its scope so it stays diagnosable.
 *
 * Admin reads deliberately do *not* use this: an empty dashboard is
 * indistinguishable from lost data, so the owner should see the failure.
 */
async function safeRead<T>(
  scope: string,
  fallback: T,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[data] "${scope}" read failed; serving fallback.`, error);
    return fallback;
  }
}

/** Sensible defaults so the site renders before the admin has saved anything. */
export const DEFAULT_CONTENT: Content = {
  heroTitle: PERSON.nameEn,
  heroSubtitle: "Frontend Developer",
  heroDescription:
    "I'm based in Mashhad, Iran, and build web apps with React, Next.js and TypeScript — mostly dashboards, admin panels and product interfaces that people use all day.",
  aboutText: `I started with a bachelor's in computer engineering, then a master's in software engineering at Azad University of Mashhad — both finished. The browser is the part I kept coming back to: it is where a design either holds up or falls apart.`,
  contactEmail: "ali.soveizi@example.com",
  contactPhone: "+98 912 345 6789",

  // Persian defaults for the persisted copy. Authored, not machine-translated:
  // these are the words the site shows when the owner has not written their own.
  //
  // `heroTitleFa` is the Persian spelling of the name. A name is not
  // translated, but it *is* transliterated — and a Persian reader searching for
  // the Persian spelling must land on a page that shows it. Defaulting it here
  // means the Persian page is correct even before the owner saves the content
  // row, instead of silently falling back to the Latin spelling.
  heroTitleFa: PERSON.nameFa,
  heroSubtitleFa: "توسعه‌دهنده فرانت‌اند",
  heroDescriptionFa:
    "در مشهد کار می‌کنم و با React، Next.js و TypeScript اپلیکیشن‌های وب می‌سازم؛ بیشتر داشبورد، پنل مدیریت و رابط‌های محصولی که کاربر در طول روز با آن‌ها کار می‌کند.",
  aboutTextFa:
    "کارشناسی مهندسی کامپیوتر را تمام کرده‌ام و بعد از آن، کارشناسی ارشد مهندسی نرم‌افزار را در دانشگاه آزاد مشهد خوانده‌ام. اما چیزی که همیشه مرا برمی‌گرداند، مرورگر بود: همان جایی که معلوم می‌شود یک طراحی سرپا می‌ماند یا از هم می‌پاشد. از همان زمان تمرکزم را گذاشتم روی ساختن رابط‌هایی که سریع، دسترس‌پذیر و قابل نگهداری باشند.",
};

const CONTENT_COLUMNS = `id, hero_title, hero_subtitle, hero_description, about_text,
  contact_email, contact_phone, hero_title_fa, hero_subtitle_fa,
  hero_description_fa, about_text_fa, updated_at`;

const PROJECT_COLUMNS = `id, slug, title, title_fa, description, description_fa,
  long_description, long_description_fa, role, year, client, image_url,
  image_placeholder_url, gallery, github_url, project_url, technologies,
  featured, sort_order, created_at, updated_at`;

/**
 * Empty strings in the Persian variants are normalised to `undefined` so the
 * renderer's fallback check is a single truthiness test.
 */
function optionalText(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Fields whose text may be Persian, per collection.
 *
 * Used with `normalizePersianFields`: the owner types this copy into the admin
 * panel, usually on a keyboard with no half-space key, so the stored strings
 * arrive as `توسعه دهنده` or `پروژهها`. Normalising on read — never on write —
 * keeps the database exactly as entered while every surface that renders it
 * (page, metadata, JSON-LD, dashboard) shows the same correct orthography.
 */
const PERSIAN_FIELDS = {
  content: [
    "heroTitleFa",
    "heroSubtitleFa",
    "heroDescriptionFa",
    "aboutTextFa",
  ],
  project: ["titleFa", "descriptionFa", "longDescriptionFa"],
  skill: ["nameFa"],
  // Experience records are single-language: the same field holds either script.
  // `normalizePersian` returns Latin-only text untouched, so this is safe.
  experience: ["title", "company", "period", "description"],
} as const;

export const getContent = cache(async (): Promise<Content> =>
  safeRead("content", DEFAULT_CONTENT, async () => {
    const rows = await query<ContentRow>(
      `select ${CONTENT_COLUMNS} from contents order by created_at asc limit 1`,
    );

    if (rows.length === 0) return DEFAULT_CONTENT;

    const doc = toContent(rows[0]);

    return normalizePersianFields(
      {
        heroTitle: doc.heroTitle || DEFAULT_CONTENT.heroTitle,
        heroSubtitle: doc.heroSubtitle || DEFAULT_CONTENT.heroSubtitle,
        heroDescription: doc.heroDescription || DEFAULT_CONTENT.heroDescription,
        aboutText: doc.aboutText || DEFAULT_CONTENT.aboutText,
        contactEmail: doc.contactEmail || DEFAULT_CONTENT.contactEmail,
        contactPhone: doc.contactPhone || DEFAULT_CONTENT.contactPhone,
        heroTitleFa:
          optionalText(doc.heroTitleFa) ?? DEFAULT_CONTENT.heroTitleFa,
        heroSubtitleFa:
          optionalText(doc.heroSubtitleFa) ?? DEFAULT_CONTENT.heroSubtitleFa,
        heroDescriptionFa:
          optionalText(doc.heroDescriptionFa) ??
          DEFAULT_CONTENT.heroDescriptionFa,
        aboutTextFa:
          optionalText(doc.aboutTextFa) ?? DEFAULT_CONTENT.aboutTextFa,
        updatedAt: doc.updatedAt,
      } satisfies Content,
      PERSIAN_FIELDS.content,
    );
  }),
);

/**
 * Projects, plus whether the read actually succeeded.
 *
 * The grid has a usable fallback (an empty state); the detail route does not.
 * Keeping the flag lets each consumer tell "the owner has no projects yet"
 * apart from "the database is unreachable", which need different answers.
 *
 * The slug is normally persisted by the admin panel, but records created before
 * detail pages existed have none — and a project without a slug would have no
 * page at all. Deriving one here (and de-duplicating with a numeric suffix)
 * means every project is addressable immediately, with no migration step.
 */
const readProjects = cache(
  async (): Promise<{ projects: Project[]; ok: boolean }> => {
    try {
      const rows = await query<ProjectRow>(
        `select ${PROJECT_COLUMNS} from projects
         order by featured desc, sort_order asc, id desc`,
      );

      const taken = new Set<string>();

      const projects = rows.map((row) => {
        const project = toProject(row);
        const stored = project.slug.trim();
        const base =
          (stored && slugify(stored)) ||
          slugify(project.title) ||
          `project-${project.id}`;
        const slug = uniqueSlug(base, taken);
        taken.add(slug);

        return normalizePersianFields(
          { ...project, slug } satisfies Project,
          PERSIAN_FIELDS.project,
        );
      });

      return { projects, ok: true };
    } catch (error) {
      console.error('[data] "projects" read failed.', error);
      return { projects: [], ok: false };
    }
  },
);

export const getProjects = cache(
  async (): Promise<Project[]> => (await readProjects()).projects,
);

/**
 * One project by its URL slug.
 *
 * Resolved from the cached list rather than a query: the collection is small,
 * the list is already in memory for this render pass, and a string comparison
 * cannot be turned into a query operator — which keeps an attacker-supplied
 * slug from ever reaching the database as anything but a plain string.
 *
 * A failed read throws rather than returning `undefined`: `undefined` means
 * "this project does not exist", and the route turns that into a 404. If the
 * database is down, answering 404 would quietly tell search engines that every
 * case study had been removed.
 */
export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const { projects, ok } = await readProjects();
  if (!ok) throw new DataUnavailableError("projects");
  return projects.find((project) => project.slug === slug);
}

export const getSkills = cache(async (): Promise<Skill[]> =>
  safeRead("skills", [], async () => {
    const rows = await query<SkillRow>(
      `select id, name, name_fa, category, level, icon, sort_order
       from skills order by sort_order asc, name asc`,
    );

    return rows.map((row) =>
      normalizePersianFields(toSkill(row), PERSIAN_FIELDS.skill),
    );
  }),
);

export const getExperiences = cache(async (): Promise<Experience[]> =>
  safeRead("experiences", [], async () => {
    const rows = await query<ExperienceRow>(
      `select id, title, company, period, description, technologies, sort_order
       from experiences order by sort_order asc, id desc`,
    );

    return rows.map((row) =>
      normalizePersianFields(toExperience(row), PERSIAN_FIELDS.experience),
    );
  }),
);

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
  const rows = await query<MessageRow>(
    `select id, name, email, subject, message, read, created_at
     from messages order by created_at desc limit 500`,
  );

  return rows.map(toMessage);
});

/**
 * Admin-only. The signed-in account, for pre-filling the account tab.
 *
 * Returns `null` when there is no session or the user behind it has been
 * deleted, which lets the page render the form empty instead of throwing.
 * Only the address is read — the password hash never leaves this function.
 */
export const getAdminAccount = cache(
  async (): Promise<{ email: string } | null> => {
    const session = await getAdminSession();
    if (!session) return null;

    // A token minted before the migration carries an ObjectId, which Postgres
    // would reject as a malformed uuid. Treat it as a missing account instead.
    if (!isValidId(session.userId)) return null;

    const rows = await query<{ id: string; email: string }>(
      `select id, email from users where id = $1 limit 1`,
      [session.userId],
    );

    if (!rows[0]?.email) return null;
    return { email: rows[0].email };
  },
);
