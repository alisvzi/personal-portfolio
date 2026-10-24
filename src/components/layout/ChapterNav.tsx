"use client";

import { motion } from "framer-motion";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { interpolate } from "@/i18n/format";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { useChapters } from "./HorizontalScroller";

interface ChapterNavProps {
  labels: Dictionary["nav"];
}

/**
 * Chapter navigation.
 *
 * A single glass pill pinned to the bottom centre, one entry per chapter.
 *
 * This replaces the previous vertical side rail plus the separate full-width
 * progress bar — the two lived in different stacking contexts and the bar ended
 * up sitting *behind* the rail. Here the progress is drawn on the pill's own top
 * edge, so it is part of the same element and can never be occluded, and the
 * active entry is marked by a background that slides between entries.
 *
 * Responsive: numbers only on small screens (the pill stays compact enough to
 * sit above a phone's home indicator), number + label from `sm` up.
 */
export function ChapterNav({ labels }: ChapterNavProps) {
  const { activeIndex, progress, goTo } = useChapters();

  return (
    <nav
      aria-label={labels.label}
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6"
    >
      <div className="chapter-nav-pill relative flex items-center gap-0.5 rounded-full border border-border-soft bg-bg-elevated/85 p-1.5 shadow-lg backdrop-blur-xl">
        {/* Scroll progress, drawn along the pill's top edge. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-3 top-0 h-[2px] overflow-hidden rounded-full bg-border-soft/70"
        >
          <span
            className="block h-full origin-left bg-gradient-to-r from-accent-2 to-accent transition-transform duration-150 ease-out rtl:origin-right"
            style={{ transform: `scaleX(${progress})` }}
          />
        </span>

        {NAVIGATION_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const label = labels[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={isActive ? "true" : undefined}
              aria-label={interpolate(labels.navigateTo, { section: label })}
              className={cn(
                "group relative flex items-center gap-2 rounded-full px-3 py-2 transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                "active:scale-[0.97] sm:px-3.5",
                isActive ? "text-accent" : "text-text-muted hover:text-text",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="chapter-nav-active"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full border border-accent/25 bg-accent-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="font-mono text-[0.6rem] tabular-nums opacity-60">
                {String(i).padStart(2, "0")}
              </span>
              <span className="hidden text-xs font-medium whitespace-nowrap sm:inline">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default ChapterNav;
