"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { IranFlag, UnitedKingdomFlag } from "@/components/layout/Flags";
import { type Locale, htmlLang, isLocale, localeLabels, locales } from "@/i18n/config";
import { interpolate } from "@/i18n/format";
import { cn } from "@/lib/utils";

const FLAGS: Record<Locale, (props: { className?: string }) => React.JSX.Element> = {
  fa: IranFlag,
  en: UnitedKingdomFlag,
};

interface LanguageSwitcherProps {
  /** Locale of the page currently being rendered. */
  locale: Locale;
  /** `language` slice of the dictionary. */
  labels: { label: string; switchTo: string };
  /**
   * `floating` pins the control to the top corner of the public site;
   * `inline` renders it in place, for the dashboard header.
   */
  variant?: "floating" | "inline";
  className?: string;
}

/**
 * Language switcher.
 *
 * Renders both locales as links rather than a dropdown: with two languages a
 * two-item control is fewer interactions. Each entry is a flag rather than the
 * language's own name — the two flags are unambiguous at a glance, and the
 * accessible name still carries the word, so nothing is lost to a screen
 * reader or to a search engine.
 *
 * The target URL keeps the current page and its query string, and only the
 * first path segment changes — switching language on `/fa/auth/login` lands on
 * `/en/auth/login`, never on the home page.
 */
export default function LanguageSwitcher({
  locale,
  labels,
  variant = "floating",
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The dashboard renders its own copy in the header. Two floating controls
  // there would overlap the panel's own chrome.
  if (variant === "floating" && pathname?.includes("/admin")) return null;

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
        "flex items-center gap-1 rounded-full border border-border-soft bg-surface/70 p-1 backdrop-blur-md",
        variant === "floating" && "fixed top-4 end-4 z-50",
        className,
      )}
    >
      {locales.map((option) => {
        const isActive = option === locale;
        const Flag = FLAGS[option];
        const name = localeLabels[option];

        return (
          <Link
            key={option}
            href={hrefFor(option)}
            hrefLang={htmlLang[option]}
            lang={option}
            aria-current={isActive ? "true" : undefined}
            aria-label={
              isActive ? name : interpolate(labels.switchTo, { language: name })
            }
            title={name}
            className={cn(
              "rounded-full p-0.5 transition-[opacity,background-color,box-shadow] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
              isActive
                ? "bg-accent-soft shadow-[0_0_0_1px_var(--accent-line)]"
                : "opacity-55 hover:opacity-100",
            )}
          >
            <Flag className="h-[0.85rem] w-[1.3rem]" />
            <span className="sr-only">{name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
