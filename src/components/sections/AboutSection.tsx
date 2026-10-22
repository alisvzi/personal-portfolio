"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { localized } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { Content, Skill } from "@/types";
import { SectionHeading } from "./SectionHeading";

interface AboutSectionProps {
  content: Content;
  skills: Skill[];
  locale: Locale;
  labels: Dictionary["about"];
  className?: string;
}

/**
 * Canonical order of skill categories.
 *
 * The admin panel writes a fixed set of category values (see `SkillsPanel`), so
 * grouping by them here produces a stable, predictable reading order instead of
 * whatever order the documents happen to arrive in. Anything unrecognised —
 * including a category an older record invented — falls through to `other`
 * rather than disappearing from the card.
 */
const CATEGORY_ORDER = [
  "frontend",
  "backend",
  "database",
  "devops",
  "mobile",
  "design",
  "other",
] as const;

type CategoryKey = (typeof CATEGORY_ORDER)[number];

function categoryOf(skill: Skill): CategoryKey {
  const value = skill.category?.trim().toLowerCase();
  return CATEGORY_ORDER.includes(value as CategoryKey)
    ? (value as CategoryKey)
    : "other";
}

interface SkillGroup {
  key: CategoryKey;
  label: string;
  skills: Skill[];
}

/**
 * Groups the managed skill collection into ordered, labelled buckets.
 *
 * Every skill is rendered — there is no cap. The card used to slice the first
 * nine entries, which meant a skill added in the dashboard could silently never
 * appear. The chapter already scrolls when its content exceeds the viewport, so
 * showing the full list is both honest and safe.
 */
function groupSkills(
  skills: Skill[],
  labels: Dictionary["about"]["skillCategories"],
): SkillGroup[] {
  const buckets = new Map<CategoryKey, Skill[]>();

  for (const skill of skills) {
    if (!skill.name?.trim()) continue;
    const key = categoryOf(skill);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(skill);
    else buckets.set(key, [skill]);
  }

  const groups: SkillGroup[] = [];

  for (const key of CATEGORY_ORDER) {
    const bucket = buckets.get(key);
    if (!bucket || bucket.length === 0) continue;
    groups.push({ key, label: labels[key], skills: bucket });
  }

  return groups;
}

/**
 * About chapter.
 *
 * Copy on the left, the live skills card on the right. The card is a plain
 * two-column composition: the pointer-driven tilt is kept because it is a
 * cheap transform on a single element, but nothing else in the chapter moves.
 */
export function AboutSection({
  content,
  skills,
  locale,
  labels,
  className,
}: AboutSectionProps) {
  const aboutText = localized(locale, content.aboutText, content.aboutTextFa);
  const groups = groupSkills(skills, labels.skillCategories);

  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), {
    stiffness: 120,
    damping: 18,
  });

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="about"
      className={cn("relative flex min-h-full items-center", className)}
    >
      <div className="chapter-shell grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-12">
        {/* Copy */}
        <div className="flex min-w-0 flex-col gap-6">
          <SectionHeading index="01" title={labels.heading} />

          <p
            className="text-safe max-w-prose leading-relaxed text-text-muted"
            style={{ fontSize: "var(--fs-0)" }}
          >
            {aboutText}
          </p>
          <p className="text-safe max-w-prose leading-relaxed text-text-muted">
            {labels.paragraph2}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {[labels.availabilityFreelance, labels.availabilityCollaboration].map(
              (text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface/50 px-4 py-2 text-sm text-text-muted"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  {text}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Skills panel — populated from the managed skills collection. */}
        <div
          ref={ref}
          onPointerMove={handleMove}
          onPointerLeave={reset}
          className="min-w-0 [perspective:1200px]"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative overflow-hidden rounded-xl border border-border-soft bg-surface/60 p-6 shadow-md backdrop-blur-sm sm:p-7"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-accent-2-soft blur-3xl"
            />

            <div className="relative mb-5 flex items-baseline justify-between gap-3">
              <h3 className="text-safe font-semibold text-text" style={{ fontSize: "var(--fs-1)" }}>
                {labels.skillsTitle}
              </h3>
              <span className="shrink-0 font-mono text-[0.65rem] tabular-nums text-text-faint">
                {skills.length.toString().padStart(2, "0")}
              </span>
            </div>

            <p className="relative mb-6 max-w-md text-sm leading-relaxed text-text-muted">
              {labels.skillsSubtitle}
            </p>

            {groups.length === 0 ? (
              <p className="relative text-sm text-text-faint">—</p>
            ) : (
              <div className="relative space-y-5">
                {groups.map((group) => (
                  <div key={group.key} className="space-y-2.5">
                    <p className="font-mono text-[0.62rem] tracking-[0.18em] text-text-faint uppercase">
                      {group.label}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {group.skills.map((skill) => {
                        const level =
                          typeof skill.level === "number"
                            ? Math.min(100, Math.max(0, skill.level))
                            : undefined;

                        return (
                          <li
                            key={skill.id}
                            className="group relative overflow-hidden rounded-lg border border-border-soft/70 bg-bg/40 px-3 py-2 transition-colors duration-200 hover:border-accent/40"
                          >
                            <span className="text-sm text-text">
                              {localized(locale, skill.name, skill.nameFa)}
                            </span>
                            {level !== undefined && (
                              <span
                                aria-hidden="true"
                                className="absolute inset-x-0 bottom-0 h-[2px] bg-accent/25"
                              >
                                <span
                                  className="block h-full bg-accent/70"
                                  style={{ width: `${level}%` }}
                                />
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
