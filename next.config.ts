import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` on scripts is required by Next.js: the App Router inlines
 * its hydration bootstrap and the JSON-LD payload, and a nonce-based policy
 * would mean threading a per-request nonce through every inline script. What
 * this policy *does* buy, and the reason it is worth setting, is that no script
 * can ever be loaded from a third-party origin — the classic injected
 * `<script src="//evil">` vector is closed.
 *
 * `'unsafe-eval'` and `ws:` are only added in development, where Turbopack's
 * HMR client needs them. Production never gets them.
 */
function contentSecurityPolicy(isProduction: boolean): string {
  const scriptSrc = isProduction
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval'";

  const connectSrc = [
    "'self'",
    "https://*.public.blob.vercel-storage.com",
    "https://blob.vercel-storage.com",
    ...(isProduction ? [] : ["ws:", "http://localhost:*"]),
  ].join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `script-src ${scriptSrc}`,
    // Framer Motion writes inline `style` attributes; without this every
    // animated element would be blocked.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://blob.vercel-storage.com",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    `connect-src ${connectSrc}`,
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /**
   * React Compiler auto-memoises components. `babel-plugin-react-compiler` is
   * installed as a devDependency to satisfy it.
   */
  reactCompiler: true,

  /** Don't advertise the framework in every response. */
  poweredByHeader: false,

  experimental: {
    /**
     * Opt in to Next.js's automated security upgrades.
     *
     * "security" limits the upgrade channel to patch releases that address
     * published advisories, so a routine `npm install` cannot silently pull in
     * a feature change. This project pins `next` to an exact version and
     * deploys from `main`, so without this flag a new advisory only reaches
     * production when someone remembers to bump it by hand.
     */
    agentUpgrade: "security",

    /**
     * Rewrite barrel-file imports into per-module paths at build time.
     *
     * `lucide-react` and `framer-motion` both ship a single index that
     * re-exports hundreds of symbols; without this, importing one icon drags
     * the whole barrel into the client bundle. This is one of the cheapest
     * available wins for LCP/INP on mobile.
     *
     * The WebGL hero was replaced by a CSS/SVG composition, so the
     * `@react-three/*` and `three` packages were uninstalled and dropped from
     * this list — they no longer exist in the dependency graph.
     */
    optimizePackageImports: ["lucide-react", "framer-motion"],

    /**
     * Upload ceiling for Server Actions.
     *
     * The default is 1 MB, which a single phone screenshot exceeds — every
     * image upload would have failed with an opaque "unexpected error". The
     * admin panel also downscales files in the browser before sending, so in
     * practice a save stays well under Vercel's own 4.5 MB request limit; this
     * value is the backstop, not the expected size.
     */
    serverActions: {
      bodySizeLimit: "24mb",
    },
  },

  images: {
    /**
     * Remote hosts allowed to serve optimised images.
     *
     * Vercel Blob serves each store from `<store-id>.public.blob.vercel-storage.com`,
     * which covers project screenshots uploaded through the admin panel. A
     * wildcard host is deliberately not allowed: it would turn `/_next/image`
     * into an open image proxy that any third party could point at an
     * arbitrary origin.
     *
     * If a custom CDN is added later, list its exact hostname here.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Older Blob stores and records created before per-store hostnames.
        protocol: "https",
        hostname: "blob.vercel-storage.com",
      },
    ],
    // AVIF first: same visual quality at roughly half the bytes of JPEG.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /**
   * Security headers.
   *
   * These are defence in depth, not the only control: authorisation lives in
   * `requireAdmin()` on every mutation, and uploads are re-encoded server-side
   * so a spoofed content type cannot survive.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(isProduction),
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
      {
        // Uploaded images are user-supplied bytes: if one is ever opened
        // directly, it must not be able to run script or load anything.
        source: "/uploads/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; img-src 'self'; sandbox",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
