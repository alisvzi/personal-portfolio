"use client";

import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

/**
 * A small spinner that appears while the surrounding `<Link>` is navigating.
 *
 * Must be rendered as a descendant of a `Link` — `useLinkStatus()` reads the
 * pending state of the nearest link, which is exactly the granularity we want:
 * the row the visitor clicked, not a global spinner.
 */
export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        pending ? "inline-block" : "hidden",
        className,
      )}
    />
  );
}

export default LinkPending;
