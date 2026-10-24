/**
 * Minimal, dependency-free validation for untrusted input crossing a server
 * boundary (Server Actions, Route Handlers).
 *
 * Everything here is deliberately explicit rather than schema-driven: the
 * project has a handful of small payload shapes, so a full validation library
 * would be more machinery than the surface area justifies.
 */

export type Validated<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] };

export const LIMITS = {
  title: 160,
  description: 2000,
  aboutText: 4000,
  technologies: 500,
  url: 500,
  name: 120,
  email: 254,
  subject: 200,
  message: 5000,
  category: 80,
  icon: 200,
  period: 80,
  company: 160,
  /** Project detail fields. */
  slug: 80,
  longDescription: 20000,
  role: 120,
  year: 20,
  client: 160,
  /** Hard cap on gallery images per project. */
  gallery: 8,
  /**
   * Must match `maxlength` on `Skill.name` / `Skill.nameFa` in the schema.
   * When the action allows more than the schema does, the extra characters pass
   * validation and Mongoose then throws — surfacing as a generic `saveFailed`
   * instead of the specific `nameTooLong` the user should see.
   */
  skillName: 80,
} as const;

/** Reads a trimmed string from FormData, or `undefined` when absent/blank. */
export function formString(
  form: FormData,
  key: string,
): string | undefined {
  const raw = form.get(key);
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function formNumber(
  form: FormData,
  key: string,
  fallback: number,
  { min = 0, max = 9999 }: { min?: number; max?: number } = {},
): number {
  const raw = form.get(key);
  const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Returns true only for an explicit "on"/"true" checkbox value. */
export function formCheckbox(form: FormData, key: string): boolean {
  const raw = form.get(key);
  return raw === "on" || raw === "true";
}

export function isNonEmptyString(
  value: unknown,
  maxLength: number,
): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export function isOptionalString(
  value: unknown,
  maxLength: number,
): value is string | undefined {
  return value === undefined || value === null || value === "" ||
    (typeof value === "string" && value.length <= maxLength);
}

/**
 * Accepts only absolute http(s) URLs.
 *
 * `new URL()` alone is not sufficient here: it happily parses `javascript:`
 * and `data:` URLs, which then end up in an `href` and become a script
 * execution vector.
 */
export function isSafeHttpUrl(value: unknown, maxLength = LIMITS.url): boolean {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeOptionalUrl(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  return isSafeHttpUrl(value) ? value : undefined;
}

export function isEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= LIMITS.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

/** Splits a comma-separated technology list, trimming and de-duplicating. */
export function parseTechnologies(input: string): string[] {
  return Array.from(
    new Set(
      input
        // Both comma styles: the Persian keyboard produces "،" and it would
        // otherwise glue a whole list into one tag.
        .split(/[,،;؛]+/)
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0 && tech.length <= 60),
    ),
  ).slice(0, 24);
}
