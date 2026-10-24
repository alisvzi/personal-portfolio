"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { interpolate, localized } from "@/i18n/format";
import { cn, formatTechnologies, getGithubUrl, getProjectUrl } from "@/lib/utils";
import type { Project } from "@/types";
import CaseStudyLink from "./CaseStudyLink";
import { SectionHeading } from "./SectionHeading";
import ProjectCard from "./ProjectCard";

interface WorkSectionProps {
  projects: Project[];
  locale: Locale;
  labels: Dictionary["work"];
  className?: string;
}

export function WorkSection({ projects, locale, labels, className }: WorkSectionProps) {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const otherProjects = projects.filter((p) => !p.featured).slice(0, 6);

  return (
    <section
      id="work"
      className={cn("relative flex min-h-full items-center", className)}
    >
      <div className="chapter-shell">
        <SectionHeading index="03" title={labels.heading} className="mb-14" />

        {featuredProjects.length > 0 ? (
          <div className="space-y-20 md:space-y-28">
            {featuredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                locale={locale}
                labels={labels}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-xl space-y-3 py-16">
            <div aria-hidden="true" className="text-5xl">
              🚧
            </div>
            <h3 className="text-safe font-semibold text-text" style={{ fontSize: "var(--fs-2)" }}>
              {labels.emptyTitle}
            </h3>
            <p className="text-text-muted">{labels.emptyDescription}</p>
          </div>
        )}

        {otherProjects.length > 0 && (
          <div className="pt-20 md:pt-28">
            <div className="mb-10 max-w-2xl">
              <h3
                className="text-safe font-semibold text-text"
                style={{ fontSize: "var(--fs-2)" }}
              >
                {labels.otherHeading}
              </h3>
              <p className="mt-2 text-text-muted">{labels.otherDescription}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherProjects.map((project) => (
                <OtherCard
                  key={project.id}
                  project={project}
                  locale={locale}
                  labels={labels}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Compact, non-featured project tile: static, hover-lift, token-coloured. */
function OtherCard({
  project,
  locale,
  labels,
}: {
  project: Project;
  locale: Locale;
  labels: Dictionary["work"];
}) {
  const githubUrl = getGithubUrl(project);
  const projectUrl = getProjectUrl(project);
  const title = localized(locale, project.title, project.titleFa);
  const description = localized(locale, project.description, project.descriptionFa);
  const detailHref = `/${locale}/work/${project.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="group flex min-w-0 flex-col gap-4 rounded-lg border border-border-soft bg-surface/60 p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-accent/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-accent" aria-hidden="true">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        </span>
        <div className="flex gap-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={interpolate(labels.repository, { title })}
              className="text-text-muted transition-colors hover:text-accent"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={interpolate(labels.liveSite, { title })}
              className="text-text-muted transition-colors hover:text-accent"
            >
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <h4
        className="text-safe min-w-0 font-semibold text-text transition-colors duration-200 group-hover:text-accent"
        style={{ fontSize: "var(--fs-1)", lineHeight: "var(--lh-title)" }}
      >
        <Link
          href={detailHref}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {title}
        </Link>
      </h4>
      <p className="text-safe line-clamp-3 text-sm leading-relaxed text-text-muted">
        {description}
      </p>

      <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
        {formatTechnologies(project.technologies)
          .slice(0, 4)
          .map((tech) => (
            <li key={tech} className="font-mono text-xs text-text-muted">
              {tech}
            </li>
          ))}
      </ul>

      <CaseStudyLink
        href={detailHref}
        label={labels.caseStudy}
        className="inline-flex w-fit items-center gap-1.5 font-mono text-xs text-accent transition-colors hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      />
    </motion.article>
  );
}

export default WorkSection;
