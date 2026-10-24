import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import HeroSection from "@/components/sections/HeroSection";
import WorkSection from "@/components/sections/WorkSection";
import { ChapterPanel } from "@/components/layout/ChapterPanel";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { localized } from "@/i18n/format";
import { PERSON, SOCIAL_LINKS } from "@/lib/constants";
import { getPortfolioData } from "@/lib/data";
import { buildStructuredData } from "@/lib/seo";

/**
 * The public portfolio.
 *
 * Revalidated every 5 minutes. Server Actions call `revalidatePath("/", "layout")`
 * after every edit, so content changes in the admin panel appear immediately.
 *
 * All four collections are fetched once here, in parallel, and passed down as
 * props. The previous structure had five `*Server` wrapper components that each
 * awaited their own query in sequence, plus a layout that re-read the content
 * document — five sequential round trips and four duplicate reads of the same
 * document.
 */
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);

  return {
    // Absolute: the layout's `%s | siteName` template would otherwise append
    // the site name to a title that already contains it.
    title: { absolute: dict.meta.homeTitle },
    description: dict.meta.homeDescription,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { content, projects, skills, experiences } = await getPortfolioData();

  // `knowsAbout` and `worksFor` are derived from the managed collections so the
  // structured data can never drift from what the page actually shows.
  const knowsAbout = Array.from(
    new Set(skills.map((skill) => skill.name.trim()).filter(Boolean)),
  );
  const worksFor = Array.from(
    new Set(experiences.map((job) => job.company.trim()).filter(Boolean)),
  );

  const structuredData = buildStructuredData({
    locale,
    // The name as the page actually renders it, plus the other script as
    // `alternateName` so both spellings resolve to the same person.
    name: localized(locale, content.heroTitle, content.heroTitleFa),
    alternateName: locale === "fa" ? PERSON.nameEn : PERSON.nameFa,
    jobTitle: localized(locale, content.heroSubtitle, content.heroSubtitleFa),
    description: dict.meta.homeDescription,
    email: content.contactEmail,
    telephone: content.contactPhone,
    addressLocality: dict.contact.location,
    sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.twitter],
    knowsAbout,
    worksFor,
    dateModified: content.updatedAt,
    projects: projects.map((p) => ({
      title: localized(locale, p.title, p.titleFa),
      slug: p.slug,
    })),
  });

  // The hero's code artifact lists the stack; take it from the same managed
  // collection the skills card uses, so the two can never disagree.
  const heroStack = skills
    .slice(0, 3)
    .map((skill) => skill.name.trim())
    .filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        // The payload is built from a literal object in this module; no user
        // input reaches it, and JSON.stringify escapes the values it carries.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ChapterPanel index={0}>
        <HeroSection
          content={content}
          locale={locale}
          labels={dict.hero}
          stack={heroStack}
        />
      </ChapterPanel>
      <ChapterPanel index={1}>
        <AboutSection
          content={content}
          skills={skills}
          locale={locale}
          labels={dict.about}
        />
      </ChapterPanel>
      <ChapterPanel index={2}>
        <ExperienceSection experiences={experiences} labels={dict.experience} />
      </ChapterPanel>
      <ChapterPanel index={3}>
        <WorkSection
          projects={projects}
          locale={locale}
          labels={dict.work}
        />
      </ChapterPanel>
      <ChapterPanel index={4}>
        <ContactSection content={content} labels={dict.contact} />
      </ChapterPanel>
    </>
  );
}
