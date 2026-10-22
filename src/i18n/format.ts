import { type Locale, defaultLocale } from "./config";

/**
 * Pure string helpers shared by Server and Client Components.
 *
 * This module deliberately imports nothing but the locale config. `@/i18n`
 * pulls in both dictionaries, so a Client Component importing from there would
 * ship every translation string to the browser; importing from here keeps the
 * dictionaries on the server.
 */

/**
 * Fills `{placeholder}` slots in a dictionary string.
 *
 * Dictionary values are plain strings (never functions) so that a slice can be
 * passed from a Server Component to a Client Component; this keeps them
 * interpolatable without breaking that boundary.
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Picks the translated variant of user-authored content.
 *
 * The database stores a Persian variant alongside the base value for projects,
 * skills and experience (`titleFa`, `nameFa`, `descriptionFa`). When a Persian
 * variant has not been written yet the base value is shown instead: the site
 * never invents a translation for content a human has not translated, and never
 * renders an empty heading either.
 */
export function localized(
  locale: Locale,
  base: string,
  persian?: string | null,
): string {
  if (locale === defaultLocale) {
    const translated = persian?.trim();
    if (translated) return translated;
  }
  return base;
}

/**
 * Renders a Server Action error code in the active language.
 *
 * Actions return keys from `admin.errors` (never sentences) so the same
 * failure reads correctly on the Persian and English dashboards. An unknown
 * key degrades to the generic message rather than showing a raw identifier.
 */
export function formatActionError(
  errors: Record<string, string>,
  code: string | undefined,
  values?: Record<string, string | number>,
): string {
  const template = (code && errors[code]) || errors.unexpected || "";
  return interpolate(template, values ?? {});
}
