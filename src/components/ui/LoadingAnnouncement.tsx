"use client";

import { usePathname } from "next/navigation";

import { localeFromPathname, stateStrings } from "@/i18n/states";

/**
 * Localised, screen-reader-only "loading" announcement.
 *
 * Framework-rendered boundaries (`loading.tsx`) receive no route params, so the
 * language is resolved from the pathname — the same approach `StatusScreen`
 * uses. Keeping this in its own client component means the skeleton itself
 * stays a Server Component with no JavaScript of its own.
 */
export function LoadingAnnouncement({
  variant = "loading",
}: {
  variant?: "loading" | "loadingPortfolio";
}) {
  const pathname = usePathname();
  const strings = stateStrings(localeFromPathname(pathname));

  return (
    <span role="status" aria-live="polite" className="sr-only">
      {variant === "loadingPortfolio" ? strings.loadingPortfolio : strings.loading}
    </span>
  );
}

export default LoadingAnnouncement;
