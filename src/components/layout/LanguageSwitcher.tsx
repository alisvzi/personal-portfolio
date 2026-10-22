"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { type Locale, htmlLang, isLocale, localeLabels, locales } from "@/i18n/config";
import { interpolate } from "@/i18n/format";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** Locale of the page currently being rendered. */
  locale: Locale;
  /** `language` slice of the dictionary. */
  labels: { label: string; switchTo: string };
  className?: string;
}

/**
 * Language switcher.
 *
 * Renders both locales as links rather than a dropdown: with two languages a
 * two-item control is fewer interactions, and each language is written in its
 * own script so a Persian speaker can recognise "English" without reading
 * Persian first.
 *
 * The target URL keeps the current page and its query string, and only the
 * first path segment changes — switching language on `/fa/auth/login` lands on
 * `/en/auth/login`, never on the home page.
 */
export default function LanguageSwitcher({
  locale,
  labels,
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();

  const hrefFor = (target: Locale): string => {
    const segments = (pathname ?? "/").split("/").filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
      segments[0] = target;
    } else {
      segments.unshift(target);
    }
    const path = `/${segments.join("/")}`;
    return query ? `${path}?${query}` : path;
  };

  return (
    <nav
      aria-label={labels.label}
      className={cn(
        "fixed top-4 end-4 z-50 flex items-center gap-1 rounded-full",
        "border border-border-soft bg-surface/80 p-1 backdrop-blur-md",
        className,
      )}
    >
      {locales.map((option) => {
        const isActive = option === locale;
        return (
          <Link
            key={option}
            href={hrefFor(option)}
            hrefLang={htmlLang[option]}
            lang={option}
            aria-current={isActive ? "true" : undefined}
            aria-label={
              isActive
                ? undefined
                : interpolate(labels.switchTo, { language: localeLabels[option] })
            }
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-text-muted hover:text-text",
            )}
          >
            {localeLabels[option]}
          </Link>
        );
      })}
    </nav>
  );
}
