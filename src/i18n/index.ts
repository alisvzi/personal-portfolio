import { type Locale, isLocale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import fa from "./dictionaries/fa";

/**
 * Server-side dictionary loader.
 *
 * Both dictionaries are imported statically: they are small, and a dynamic
 * `import()` per request would add a round trip on the critical path for no
 * real benefit at this size.
 *
 * Import this only from Server Components. Client Components must take the
 * slice they need as a prop and use `@/i18n/format` for interpolation —
 * importing this module from the client would bundle every string.
 */

const dictionaries: Record<Locale, Dictionary> = { fa, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Resolves a `[locale]` route parameter coming from an untrusted URL.
 * Returns `undefined` so the caller can render a 404 rather than guessing.
 */
export function resolveLocale(value: string | undefined): Locale | undefined {
  return isLocale(value) ? value : undefined;
}

export { defaultLocale, isLocale, locales, directionOf, htmlLang } from "./config";
export type { Locale } from "./config";
export type { Dictionary } from "./dictionaries/en";
