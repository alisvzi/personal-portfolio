/**
 * Verifies that a state-changing request originated from this site.
 *
 * Server Actions get an Origin/Host check from the framework; plain Route
 * Handlers do not. The public contact endpoint is unauthenticated, so without
 * this check any third-party page could POST submissions on a visitor's behalf.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  // Same-origin form posts and non-browser clients may omit Origin; fall back
  // to Referer, and reject only when a cross-origin sender is positively
  // identified.
  if (!origin) {
    const referer = request.headers.get("referer");
    if (!referer) return true;
    try {
      return new URL(referer).host === new URL(request.url).host;
    } catch {
      return false;
    }
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
