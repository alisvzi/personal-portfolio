import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { getContent, getProjects } from "@/lib/data";
import { siteUrl } from "@/lib/env";
import { localeAlternates, projectPath } from "@/lib/seo";

/**
 * XML sitemap.
 *
 * One entry per locale for every public page, each carrying the full
 * `hreflang` cluster so search engines can pair the language versions. The
 * admin area and sign-in page are deliberately absent: they are `noindex` and
 * have nothing to offer a crawler.
 *
 * Project pages are read from the database, so this route is dynamic — a static
 * sitemap generated at build time would never list a project added afterwards,
 * which is precisely the page most worth indexing. A database failure degrades
 * to the landing pages instead of returning a 500: a partial sitemap is far
 * better than none, and the landing pages are the ones that must always be
 * discoverable.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const languages = localeAlternates().languages;

  const content = await getContent().catch(() => null);
  const contentUpdatedAt = content?.updatedAt;

  const landingPages: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified: contentUpdatedAt ? new Date(contentUpdatedAt) : undefined,
    changeFrequency: "monthly",
    priority: locale === "fa" ? 1 : 0.9,
    alternates: { languages },
  }));

  let projectEntries: MetadataRoute.Sitemap = [];

  try {
    const projects = await getProjects();

    projectEntries = projects.flatMap((project) => {
      const path = projectPath(project.slug);
      const alternates = localeAlternates(path).languages;
      const projectDate = project.updatedAt || project.createdAt;
      const lastModified =
        contentUpdatedAt && projectDate
          ? new Date(
              Math.max(
                new Date(contentUpdatedAt).getTime(),
                new Date(projectDate).getTime(),
              ),
            )
          : contentUpdatedAt
            ? new Date(contentUpdatedAt)
            : projectDate
              ? new Date(projectDate)
              : undefined;

      return locales.map((locale) => {
        const entry: MetadataRoute.Sitemap[number] = {
          url: `${base}/${locale}${path}`,
          lastModified,
          changeFrequency: "monthly" as const,
          priority: project.featured ? 0.8 : 0.6,
          alternates: { languages: alternates },
        };

        if (project.imageUrl) {
          const imageUrl = project.imageUrl.startsWith("http")
            ? project.imageUrl
            : `${base}${project.imageUrl}`;
          entry.images = [imageUrl];
        }

        return entry;
      });
    });
  } catch (error) {
    console.error("[sitemap] Could not read projects:", error);
  }

  return [...landingPages, ...projectEntries];
}
