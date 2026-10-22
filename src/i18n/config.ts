/**
 * Locale configuration for the sub-path routing strategy (`/fa/...`, `/en/...`).
 *
 * This module is intentionally dependency-free so it can be imported from
 * Server Components, Client Components and `proxy.ts` alike.
 */

export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

/** Persian is the primary audience, so it is the default and the fallback. */
export const defaultLocale: Locale = "fa";

const directionByLocale: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
};

/** Runtime guard for `[locale]` route params, which are untrusted strings. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function directionOf(locale: Locale): "rtl" | "ltr" {
  return directionByLocale[locale];
}

/**
 * Natural-language name of a locale *in that language*, used by the language
 * switcher. Never localise a language's own name into the other language:
 * a Persian speaker looking for English should see "English".
 */
export const localeLabels: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

/** BCP-47 tags used for `lang`, `hreflang` and Open Graph locales. */
export const htmlLang: Record<Locale, string> = {
  fa: "fa-IR",
  en: "en",
};

export const openGraphLocale: Record<Locale, string> = {
  fa: "fa_IR",
  en: "en_US",
};
