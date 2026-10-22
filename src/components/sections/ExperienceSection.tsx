"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { interpolate } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types";
import { SectionHeading } from "./SectionHeading";

interface ExperienceSectionProps {
  experiences: Experience[];
  labels: Dictionary["experience"];
  className?: string;
}

/**
 * Experience chapter — a vertical timeline of interactive 3D-tilt cards.
 *
 * The connecting rail is a cyan→violet gradient; the motion lives on the cards,
 * never the text. Generous vertical rhythm and `text-safe` keep long role names
 * and descriptions inside their boxes at any width.
 */
export function ExperienceSection({
  experiences,
  labels,
  className,
}: ExperienceSectionProps) {
  return (
    <section
      id="experience"
      className={cn("relative flex min-h-full items-center", className)}
    >
      <div className="chapter-shell">
        <div className="mx-auto max-w-4xl">
          <SectionHeading index="02" title={labels.heading} className="mb-14" />

          {experiences.length === 0 ? (
            <p className="py-12 text-center text-text-muted">{labels.empty}</p>
          ) : (
            <ol className="relative space-y-10 before:absolute before:start-0 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:-translate-x-1/2 before:bg-gradient-to-b before:from-accent-line before:via-accent-2-line before:to-transparent">
              {experiences.map((job, index) => (
                <li key={job.id} className="relative ps-10 md:ps-12">
                  <span
                    aria-hidden="true"
                    className="absolute start-0 top-6 z-10 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full border-2 border-accent bg-bg"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  <ExperienceNode job={job} labels={labels} index={index} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function ExperienceNode({
  job,
  labels,
  index,
}: {
  job: Experience;
  labels: Dictionary["experience"];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 15,
  });

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
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className="group min-w-0 [perspective:1200px]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="rounded-xl border border-border-soft bg-surface/60 p-6 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 ease-out hover:border-accent/30 hover:shadow-glow sm:p-7"
      >
        <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between md:gap-6">
          <h3
            className="text-safe font-semibold text-text transition-colors duration-200 group-hover:text-accent"
            style={{ fontSize: "var(--fs-1)", lineHeight: 1.2 }}
          >
            {job.title}
          </h3>
          <span className="shrink-0 font-mono text-sm text-accent">
            {interpolate(labels.at, { company: job.company })}
          </span>
        </div>

        <p className="mt-1.5 font-mono text-sm text-text-faint">{job.period}</p>

        <p className="text-safe mt-4 max-w-prose leading-relaxed text-text-muted">
          {job.description}
        </p>

        {job.technologies.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {job.technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1 font-mono text-xs text-accent transition-colors duration-200 hover:bg-accent/20"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ExperienceSection;
