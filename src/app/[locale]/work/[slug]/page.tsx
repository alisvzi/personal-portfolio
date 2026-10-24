import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import { thumbHashToDataURL } from "thumbhash";

import AmbientBackground from "@/components/visual/AmbientBackground";
import LinkPending from "@/components/ui/LinkPending";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { localized } from "@/i18n/format";
import { PERSON } from "@/lib/constants";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { siteUrl } from "@/lib/env";
import {
  buildProjectStructuredData,
  canonicalFor,
  localeAlternates,
  ogImageUrl,
  projectPath,
} from "@/lib/seo";
import { base64ToUint8Array, formatTechnologies, getGithubUrl, getProjectUrl } from "@/lib/utils";
import type { Project } from "@/types";

/**
 * Project detail page.
 *
 * Lives outside the `(site)` route group on purpose: that group wraps its
 * children in the horizontal chapter scroller, which is a one-page experience
 * and would fight a long-form article. The page therefore brings its own
 * backdrop and keeps the global language switcher from the locale layout.
 *
 * Revalidated every 5 minutes. Server Actions call `revalidatePath` on save,
 * so edits in the admin panel appear immediately.
 */
export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Absolute URL for a stored image (local uploads are root-relative). */
function absoluteImage(url: string): string {
  if (!url) return ogImageUrl("fa");
  return url.startsWith("http") ? url : `${siteUrl()}${url}`;
}

/** Plain-text paragraphs from the case study field. */
function paragraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = await getProjectBySlug(safeDecode(slug));
  if (!project) {
    notFound();
  }

  const dict = getDictionary(locale);
  const title = localized(locale, project.title, project.titleFa);
  const description = localized(
    locale,
    project.description,
    project.descriptionFa,
  );
  const path = projectPath(project.slug);
  const canonical = canonicalFor(locale, path);
  const cover = absoluteImage(project.imageUrl);
  const technologies = formatTechnologies(project.technologies);

  return {
    title,
    description,
    keywords: [
      ...technologies,
      title,
      PERSON.nameEn,
      PERSON.nameFa,
      dict.meta.siteName,
    ],
    alternates: {
      canonical,
      languages: localeAlternates(path).languages,
    },
    openGraph: {
      type: "article",
      siteName: dict.meta.siteName,
      title,
      description,
      url: canonical,
      images: [{ url: cover, alt: title }],
      publishedTime: project.createdAt,
      modifiedTime: project.updatedAt,
      authors: [PERSON.nameEn],
      section: "Case study",
      tags: technologies,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;

  const project = await getProjectBySlug(safeDecode(slug));
  if (!project) notFound();

  const dict = getDictionary(locale);
  const labels = dict.project;

  const title = localized(locale, project.title, project.titleFa);
  const description = localized(
    locale,
    project.description,
    project.descriptionFa,
  );
  const body = paragraphs(
    localized(locale, project.longDescription ?? "", project.longDescriptionFa),
  );

  const technologies = formatTechnologies(project.technologies);
  const githubUrl = getGithubUrl(project);
  const projectUrl = getProjectUrl(project);
  const coverPlaceholder = project.imagePlaceholderUrl
    ? thumbHashToDataURL(base64ToUint8Array(project.imagePlaceholderUrl))
    : undefined;

  const gallery = project.gallery ?? [];

  // Prev / next walk the same order the work section shows, so the sequence a
  // visitor sees on the landing page is the sequence they get here. With a
  // single project there is no meaningful neighbour, and linking a page to
  // itself would be worse than showing nothing.
  const all = await getProjects();
  const index = all.findIndex((item) => item.id === project.id);
  const previous =
    all.length > 1 ? all[(index - 1 + all.length) % all.length] : undefined;
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined;

  const structuredData = buildProjectStructuredData({
    locale,
    slug: project.slug,
    title,
    description,
    images: [absoluteImage(project.imageUrl), ...gallery.map((image) => absoluteImage(image.url))],
    technologies,
    datePublished: project.createdAt,
    dateModified: project.updatedAt,
    liveUrl: projectUrl,
    codeUrl: githubUrl,
    breadcrumbs: { home: dict.nav.home, work: dict.nav.work },
  });

  const facts: { label: string; value: string }[] = [
    { label: labels.role, value: project.role ?? "" },
    { label: labels.year, value: project.year ?? "" },
    { label: labels.client, value: project.client ?? "" },
  ].filter((fact) => fact.value.trim().length > 0);

  return (
    <div className="relative min-h-dvh text-text">
      <AmbientBackground />

      <script
        type="application/ld+json"
        // Built from a literal object in this module; every value is a string
        // that came from the database or the dictionary, and JSON.stringify
        // escapes it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="relative z-10 border-b border-border-soft/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href={`/${locale}/#work`}
            className="inline-flex items-center gap-2 rounded-full border border-border-soft px-4 py-2 font-mono text-xs text-text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            {labels.backToWork}
            <LinkPending className="h-3 w-3" />
          </Link>

          {/* The language switcher is fixed top-end by the locale layout; this
              spacer keeps the header from running underneath it. */}
          <span aria-hidden="true" className="w-28 sm:w-32" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-text-faint">
            <li>
              <Link href={`/${locale}`} className="hover:text-accent">
                {dict.nav.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/${locale}/#work`} className="hover:text-accent">
                {dict.nav.work}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-text-muted">
              {title}
            </li>
          </ol>
        </nav>

        <p className="font-mono text-xs tracking-[var(--ls-eyebrow)] text-accent">
          {dict.work.caseStudy}
        </p>

        <h1
          className="text-safe mt-3 font-bold tracking-[var(--ls-display)] text-text"
          style={{ fontSize: "var(--fs-4)", lineHeight: "var(--lh-display)" }}
        >
          {title}
        </h1>

        <p className="text-safe mt-5 max-w-3xl leading-relaxed text-text-muted" style={{ fontSize: "var(--fs-0)" }}>
          {description}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-xs font-semibold text-bg transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {labels.liveSite}
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent/50 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              {labels.sourceCode}
            </a>
          )}
        </div>

        {/* Cover */}
        <figure className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-border-strong bg-surface-2 shadow-lg">
          <Image
            src={project.imageUrl}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            placeholder={coverPlaceholder ? "blur" : "empty"}
            blurDataURL={coverPlaceholder || undefined}
          />
        </figure>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Case study */}
          <article className="min-w-0 lg:col-span-8">
            <h2 className="mb-5 font-mono text-xs tracking-[var(--ls-eyebrow)] text-text-faint uppercase">
              {labels.overview}
            </h2>

            {body.length > 0 ? (
              <div className="space-y-5">
                {body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-safe leading-[1.9] text-text-muted"
                    style={{ fontSize: "var(--fs-0)" }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-text-faint">—</p>
            )}

            {gallery.length > 0 && (
              <section className="mt-14">
                <h2 className="mb-5 font-mono text-xs tracking-[var(--ls-eyebrow)] text-text-faint uppercase">
                  {labels.gallery}
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {gallery.map((image, i) => {
                    const placeholder = image.placeholder
                      ? thumbHashToDataURL(base64ToUint8Array(image.placeholder))
                      : undefined;

                    return (
                      <li
                        key={`${image.url}-${i}`}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border-soft bg-surface-2"
                      >
                        <Image
                          src={image.url}
                          alt={`${title} — ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 45vw"
                          className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                          placeholder={placeholder ? "blur" : "empty"}
                          blurDataURL={placeholder || undefined}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </article>

          {/* Facts */}
          <aside className="min-w-0 lg:col-span-4">
            <div className="rounded-xl border border-border-soft bg-surface/60 p-6 backdrop-blur-sm">
              <h2 className="mb-4 font-mono text-xs tracking-[var(--ls-eyebrow)] text-text-faint uppercase">
                {labels.details}
              </h2>

              {facts.length > 0 && (
                <dl className="space-y-3 border-b border-border-soft/60 pb-5">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-baseline justify-between gap-4">
                      <dt className="font-mono text-xs text-text-faint">{fact.label}</dt>
                      <dd className="text-end text-sm text-text">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="pt-5">
                <p className="mb-3 font-mono text-xs tracking-[var(--ls-eyebrow)] text-text-faint uppercase">
                  {labels.stack}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1 font-mono text-xs text-accent"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Prev / next */}
        <nav
          aria-label={labels.navigation}
          className="mt-20 grid grid-cols-1 gap-4 border-t border-border-soft/60 pt-8 sm:grid-cols-2"
        >
          <ProjectNeighbour project={previous} locale={locale} direction="previous" label={labels.previous} />
          <ProjectNeighbour project={next} locale={locale} direction="next" label={labels.next} />
        </nav>
      </main>
    </div>
  );
}

function ProjectNeighbour({
  project,
  locale,
  direction,
  label,
}: {
  project: Project | undefined;
  locale: "fa" | "en";
  direction: "previous" | "next";
  label: string;
}) {
  if (!project) return <span aria-hidden="true" />;

  const title = localized(locale, project.title, project.titleFa);
  const isNext = direction === "next";

  return (
    <Link
      href={`/${locale}${projectPath(project.slug)}`}
      className={`group flex min-w-0 flex-col gap-1.5 rounded-xl border border-border-soft bg-surface/40 p-5 transition-colors hover:border-accent/40 hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
        isNext ? "sm:items-end sm:text-end" : ""
      }`}
    >
      <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[var(--ls-label)] text-text-faint uppercase">
        {!isNext && <ArrowLeft className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />}
        {label}
        {isNext && <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />}
      </span>
      <span className="text-safe text-sm font-semibold text-text transition-colors group-hover:text-accent">
        {title}
      </span>
    </Link>
  );
}
