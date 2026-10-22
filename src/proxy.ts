import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/config";
import { jwtSecret } from "@/lib/env";

/**
 * Edge of the application: locale routing and admin route protection.
 *
 * Two jobs, in this order:
 *
 * 1. Every public URL lives under a locale prefix (`/fa/...`, `/en/...`).
 *    A path without one is redirected to the same path under the default
 *    locale. The redirect never inspects `Accept-Language`: language is chosen
 *    by the URL so that crawlers and users always agree on what a URL means,
 *    and so that `/fa/...` and `/en/...` are separately indexable.
 *
 * 2. `/[locale]/admin/**` requires a valid session cookie. This is a
 *    convenience gate for the UI — it is *not* the security boundary. Every
 *    Server Action and Route Handler re-checks the session itself, because a
 *    matcher change or a direct POST would otherwise bypass this file
 *    entirely.
 *
 * Runs on the Node.js runtime (the default for `proxy.ts` in Next.js 16), so
 * `jose` and `process.env` behave exactly as they do in the app.
 */

const SESSION_COOKIE = "token";

/** Paths that must never be locale-prefixed or auth-gated. */
const SKIPPED_PREFIXES = ["/_next", "/api", "/uploads", "/.well-known"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIPPED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;

  if (!isLocale(first)) {
    // No (or unknown) locale prefix: send the visitor to the default locale.
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 308);
  }

  const locale = first;
  const localizedPath = `/${rest.join("/")}`;
  const isAdminArea = localizedPath === "/admin" || localizedPath.startsWith("/admin/");
  const isLoginPage = localizedPath === "/auth/login";

  if (!isAdminArea && !isLoginPage) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (isAdminArea && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isLoginPage && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Verifies the session token without importing the session module.
 *
 * `@/lib/auth` reads cookies through `next/headers`, which is not available
 * here, so the token is verified directly. A missing or misconfigured secret
 * fails closed: the request is treated as unauthenticated rather than letting
 * an unverifiable token through.
 */
async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(jwtSecret()), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export const config = {
  /**
   * Skips API routes, Next.js internals, the uploads directory and any request
   * for a file with an extension (`favicon.ico`, `og-image.jpg`,
   * `sitemap.xml`, …), which must be served as-is.
   */
  matcher: ["/((?!api|_next/static|_next/image|uploads|.*\\.[^/]+$).*)"],
};
