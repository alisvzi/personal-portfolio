"use client";

import Script from "next/script";

/**
 * Google Analytics 4 — loaded only when the env variable is set.
 *
 * Without a measurement ID the component renders nothing: no script tag, no
 * network request, no empty comment node. This keeps the HTML identical
 * between a local dev machine and a deployed preview until the owner adds the
 * ID.
 *
 * `strategy="afterInteractive"` is deliberate: gtag is not needed for the
 * initial paint and must not compete with LCP resources. The trade-off is a
 * small gap in page-view tracking for the very first navigation on a cold
 * cache, which is acceptable for a portfolio.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;

  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { send_page_view: true });
        `}
      </Script>
    </>
  );
}
