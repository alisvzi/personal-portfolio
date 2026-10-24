"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { thumbHashToDataURL } from "thumbhash";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { interpolate, localized } from "@/i18n/format";
import {
  base64ToUint8Array,
  cn,
  formatTechnologies,
  getGithubUrl,
  getProjectUrl,
} from "@/lib/utils";
import type { Project } from "@/types";
import CaseStudyLink from "./CaseStudyLink";

interface ProjectCardProps {
  project: Project;
  index: number;
  locale: Locale;
  labels: Dictionary["work"];
}

/**
 * Featured project card with a pointer-driven 3D tilt and a parallax depth
 * stack (image lifted closer, text set slightly back). Motion is on the card,
 * never the title. All children are `min-w-0` + `text-safe` so long names and
 * RTL copy never break out of the layout.
 */
export function ProjectCard({ project, index, locale, labels }: ProjectCardProps) {
  const placeholderURL = project.imagePlaceholderUrl
    ? thumbHashToDataURL(base64ToUint8Array(project.imagePlaceholderUrl))
    : undefined;

  const githubUrl = getGithubUrl(project);
  const projectUrl = getProjectUrl(project);
  const title = localized(locale, project.title, project.titleFa);
  const description = localized(locale, project.description, project.descriptionFa);
  const reversed = index % 2 === 1;
  const detailHref = `/${locale}/work/${project.slug}`;

  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 150,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), {
    stiffness: 150,
    damping: 16,
  });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(100,255,218,0.20), transparent 45%)`;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.article
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className="group min-w-0 [perspective:1400px]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="grid items-center gap-8 md:grid-cols-12 md:gap-12"
      >
        {/* Image */}
        <div className={cn("min-w-0 md:col-span-7", reversed && "md:order-2")}>
          <motion.div
            className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border-strong bg-surface-2 shadow-md"
            style={{ translateZ: 55 }}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <Image
              src={project.imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
              placeholder={placeholderURL ? "blur" : "empty"}
              blurDataURL={placeholderURL || undefined}
            />
            <div className="absolute inset-0 bg-accent/10 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0" />
            {/*
              The image is the largest target on the card, so it links to the
              case study. The link is an empty overlay rather than a wrapper:
              the card already contains external anchors, and nesting an `<a>`
              inside another `<a>` is invalid HTML.
            */}
            <Link
              href={detailHref}
              aria-label={interpolate(labels.viewProject, { title })}
              className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: glare }}
            />
            <div className="absolute end-4 top-4 z-10 flex gap-2 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={interpolate(labels.repository, { title })}
                  className="rounded-full bg-bg/90 p-2 text-text backdrop-blur transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
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
                  className="rounded-full bg-bg/90 p-2 text-text backdrop-blur transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Text */}
        <div
          className={cn(
            "min-w-0 space-y-4 md:col-span-5",
            reversed && "md:order-1 md:text-end",
          )}
          style={{ transform: "translateZ(20px)" }}
        >
          <p className="font-mono text-xs tracking-[var(--ls-eyebrow)] text-accent">
            {labels.featured}
          </p>
          <h3
            className="text-safe font-semibold tracking-[var(--ls-title)] text-text transition-colors duration-200 group-hover:text-accent"
            style={{ fontSize: "var(--fs-2)", lineHeight: "var(--lh-title)" }}
          >
            <Link href={detailHref} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
              {title}
            </Link>
          </h3>
          <p className="text-safe leading-relaxed text-text-muted">{description}</p>
          <ul
            className={cn(
              "flex flex-wrap gap-x-4 gap-y-2 pt-1",
              reversed && "md:justify-end",
            )}
          >
            {formatTechnologies(project.technologies)
              .slice(0, 5)
              .map((tech) => (
                <li
                  key={tech}
                  className="font-mono text-xs text-text-muted transition-colors duration-200 hover:text-accent"
                >
                  {tech}
                </li>
              ))}
          </ul>
          <div className={cn("flex flex-wrap items-center gap-3 pt-2", reversed && "md:justify-end")}>
            <CaseStudyLink
              href={detailHref}
              label={labels.caseStudy}
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-2 font-mono text-xs text-accent transition-colors duration-200 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            />
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={interpolate(labels.repository, { title })}
                className="rounded-full p-2 text-text transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95"
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
                className="rounded-full p-2 text-text transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default ProjectCard;
