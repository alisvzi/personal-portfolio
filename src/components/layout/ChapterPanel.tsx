import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChapterPanelProps {
  /** Zero-based chapter index, used by the scroll engine for tracking. */
  index: number;
  children: ReactNode;
  className?: string;
}

/**
 * One full-viewport "chapter" of the horizontal experience.
 *
 * The inner section component still owns its own `id` (for `scrollToSection`
 * deep links and the nav dictionary), so this wrapper only carries `data-chapter`
 * for the IntersectionObserver — never a duplicate id.
 */
export function ChapterPanel({ index, children, className }: ChapterPanelProps) {
  return (
    <div
      data-chapter={index}
      className={cn("horizontal-panel", className)}
    >
      {children}
    </div>
  );
}

export default ChapterPanel;
