/**
 * URL slug helpers.
 *
 * Kept dependency-free and pure so the same function can run in the admin
 * panel (to preview a slug), in a Server Action (to persist one) and in the
 * data layer (to derive one for records created before slugs existed).
 */

/** Longest slug we accept; matches `maxlength` on the schema field. */
export const MAX_SLUG_LENGTH = 80;

/**
 * Converts arbitrary text into a URL-safe slug.
 *
 * Persian titles produce an empty string on purpose: transliterating Persian
 * automatically produces something unreadable, and a Latin slug is what keeps
 * the URL copy-pasteable. Callers fall back to a stable id-based slug in that
 * case, and the admin panel lets the owner type a Latin slug by hand.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining marks so "Café" and "Cafe" agree.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

/** Strict shape check for a slug coming from a form field. */
export function isValidSlug(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= MAX_SLUG_LENGTH &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

/**
 * Appends a numeric suffix until the slug is unique within `taken`.
 *
 * Two projects may legitimately share a title ("Landing page"), and a duplicate
 * slug would make one of them unreachable — the detail route resolves the first
 * match. `-2`, `-3`, … keeps every project addressable without touching the
 * database.
 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "project";
  if (!taken.has(root)) return root;

  let counter = 2;
  while (taken.has(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}
