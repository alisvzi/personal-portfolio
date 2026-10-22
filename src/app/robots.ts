import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";

/**
 * robots.txt.
 *
 * The public portfolio is fully crawlable; the admin dashboard and sign-in
 * page are disallowed as well as `noindex`, so a crawler that ignores one
 * directive still honours the other. API routes are excluded because none of
 * them serve indexable content.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*/admin", "/*/admin/", "/*/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
