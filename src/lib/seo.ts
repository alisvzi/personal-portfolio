import { type Locale, defaultLocale, htmlLang } from "@/i18n/config";
import { PERSON } from "@/lib/constants";
import { siteUrl } from "@/lib/env";

/**
 * Technical SEO helpers.
 *
 * Canonical/hreflang URLs are derived from the environment (`siteUrl()`) rather
 * than a hardcoded domain, so the same build serves `localhost`, a Vercel
 * preview and the production domain without edits.
 */

function absolute(path: string): string {
  const base = siteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Canonical URL plus the `hreflang` cluster for a locale-agnostic path.
 *
 * Each alternate is a real, self-referencing URL: `/fa/...` declares itself,
 * `/en/...` and `x-default` point at the default locale. Search engines are
 * never redirected by `Accept-Language`, so these URLs are what they index.
 */
export function localeAlternates(path = ""): {
  canonical: string;
  languages: Record<string, string>;
} {
  return {
    canonical: absolute(`/${defaultLocale}${path}`),
    languages: {
      "fa-IR": absolute(`/fa${path}`),
      en: absolute(`/en${path}`),
      "x-default": absolute(`/${defaultLocale}${path}`),
    },
  };
}

/** Canonical URL for one specific locale's copy of a page. */
export function canonicalFor(locale: Locale, path = ""): string {
  return absolute(`/${locale}${path}`);
}

/** Absolute URL of the generated Open Graph card for a locale. */
export function ogImageUrl(locale: Locale): string {
  return absolute(`/${locale}/opengraph-image`);
}

/** Path of a project's detail page, locale-agnostic. */
export function projectPath(slug: string): string {
  return `/work/${slug}`;
}

/**
 * Stable, site-wide `@id` for the person.
 *
 * Deliberately *not* locale-scoped: the Persian and English pages describe the
 * same human, and giving them two different `@id`s would ask Google to treat
 * them as two unrelated people. One id, declared on both pages, is what makes
 * the two language versions consolidate into a single entity.
 */
export function personEntityId(): string {
  return `${siteUrl()}/#person`;
}

interface StructuredDataInput {
  locale: Locale;
  /** Display name of the person in the page's language. */
  name: string;
  /** The same person's name in the other script — the other half of the entity. */
  alternateName: string;
  jobTitle: string;
  description: string;
  email: string;
  telephone: string;
  /** Human-readable locality, e.g. `Mashhad, Iran` / `مشهد، ایران`. */
  addressLocality: string;
  sameAs: string[];
  /** Skill names → `knowsAbout`. */
  knowsAbout?: string[];
  /** Employer names → `worksFor`. */
  worksFor?: string[];
  /** Absolute URL of a portrait, when one exists. */
  image?: string;
  /** ISO timestamp of the last content change, when known. */
  dateModified?: string;
  /** Published projects → `ItemList` so the work section is machine-readable. */
  projects?: { title: string; slug: string }[];
}

/**
 * JSON-LD for the landing page.
 *
 * Emitted as a single `@graph` so the nodes can reference each other by `@id`
 * instead of being repeated, and restricted to types that are actually true of
 * this site: a `ProfilePage`, the `Person` it is about, and the `WebSite` they
 * publish. No `aggregateRating`, no `SearchAction`, no invented `award` — made
 * up properties are exactly what gets structured data ignored.
 *
 * `ProfilePage.mainEntity` is the strongest signal a personal site can send:
 * it tells Google "this URL is the canonical entity page for this person",
 * which is what feeds a name query into a knowledge panel.
 */
export function buildStructuredData({
  locale,
  name,
  alternateName,
  jobTitle,
  description,
  email,
  telephone,
  addressLocality,
  sameAs,
  knowsAbout,
  worksFor,
  image,
  dateModified,
  projects,
}: StructuredDataInput): Record<string, unknown> {
  const url = canonicalFor(locale);
  const personId = personEntityId();
  const websiteId = `${url}#website`;

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": personId,
    name,
    // Both spellings on both pages: this is what ties «علی سویزی» and
    // "Ali Soveizi" together as one entity instead of two lookalikes.
    alternateName,
    jobTitle,
    description,
    url,
    email: `mailto:${email}`,
    telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality,
      addressCountry: "IR",
    },
    sameAs,
    knowsLanguage: ["fa-IR", "en"],
    mainEntityOfPage: { "@id": `${url}#profilepage` },
  };

  if (image) person.image = image;

  if (knowsAbout && knowsAbout.length > 0) {
    person.knowsAbout = knowsAbout;
  }

  if (worksFor && worksFor.length > 0) {
    person.worksFor = worksFor.map((company) => ({
      "@type": "Organization",
      name: company,
    }));
  }

  const profilePage: Record<string, unknown> = {
    "@type": "ProfilePage",
    "@id": `${url}#profilepage`,
    url,
    name,
    description,
    inLanguage: htmlLang[locale],
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    mainEntity: { "@id": personId },
  };

  if (dateModified) {
    profilePage.dateModified = dateModified;
  }

  const graph: Record<string, unknown>[] = [
    profilePage,
    person,
    {
      "@type": "WebSite",
      "@id": websiteId,
      url,
      name,
      description,
      inLanguage: htmlLang[locale],
      about: { "@id": personId },
      publisher: { "@id": personId },
    },
  ];

  if (projects && projects.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#work`,
      name: locale === "fa" ? "نمونه‌کارها" : "Work",
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonicalFor(locale, projectPath(p.slug)),
        name: p.title,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

interface ProjectStructuredDataInput {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  /** Absolute URLs: cover first, then the gallery. */
  images: string[];
  technologies: string[];
  datePublished?: string;
  dateModified?: string;
  /** Absolute URL of the live deployment, when one exists. */
  liveUrl?: string;
  /** Absolute URL of the source repository, when one exists. */
  codeUrl?: string;
  /** Breadcrumb labels in the page's language. */
  breadcrumbs: { home: string; work: string };
}

/**
 * JSON-LD for a project detail page.
 *
 * `CreativeWork` with `author`/`creator` pointing at the site-wide `Person`
 * node. The breadcrumb trail is a separate node because Google renders it as
 * the URL path under the result, and because it is the one rich result a
 * portfolio project page can realistically earn.
 */
export function buildProjectStructuredData({
  locale,
  slug,
  title,
  description,
  images,
  technologies,
  datePublished,
  dateModified,
  liveUrl,
  codeUrl,
  breadcrumbs,
}: ProjectStructuredDataInput): Record<string, unknown> {
  const url = canonicalFor(locale, projectPath(slug));
  const personId = personEntityId();
  const workUrl = canonicalFor(locale, "/#work");

  const project: Record<string, unknown> = {
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: title,
    headline: title,
    description,
    url,
    inLanguage: htmlLang[locale],
    creator: { "@id": personId },
    author: { "@id": personId },
    keywords: technologies.join(", "),
    genre: "Web development",
  };

  if (images.length > 0) project.image = images;
  if (datePublished) project.datePublished = datePublished;
  if (dateModified) project.dateModified = dateModified;
  if (liveUrl) project.sameAs = [liveUrl];
  if (codeUrl) project.codeRepository = codeUrl;

  return {
    "@context": "https://schema.org",
    "@graph": [
      project,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: breadcrumbs.home,
            item: canonicalFor(locale),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: breadcrumbs.work,
            item: workUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: url,
          },
        ],
      },
      {
        "@type": "Person",
        "@id": personId,
        name: locale === "fa" ? PERSON.nameFa : PERSON.nameEn,
        alternateName: locale === "fa" ? PERSON.nameEn : PERSON.nameFa,
        url: canonicalFor(locale),
      },
    ],
  };
}
