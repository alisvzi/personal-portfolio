"use client";

import { useEffect } from "react";

import { defaultLocale, directionOf, htmlLang } from "@/i18n/config";
import { localeFromPathname, stateStrings } from "@/i18n/states";

/**
 * Last-resort boundary.
 *
 * `[locale]/error.tsx` catches failures in the page below the locale layout,
 * but it cannot catch a failure *in* that layout — a font that fails to load,
 * a bad import, anything that breaks the `<html>` wrapper itself. Without this
 * file such a failure falls through to Next.js's bare default page: no styling,
 * no language, and no way back.
 *
 * Styles are inline rather than Tailwind classes because the stylesheet is
 * imported by the layout that just failed; if that import never ran, class
 * names would resolve to nothing.
 */
const palette = {
  bg: "#0b1220",
  text: "#e6edf7",
  muted: "#93a1b5",
  accent: "#7dd3fc",
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // No router context is guaranteed this far up, so the locale comes from the
  // URL. On the server there is no URL; the default locale is the safe answer.
  const locale =
    typeof window === "undefined"
      ? defaultLocale
      : localeFromPathname(window.location.pathname);
  const strings = stateStrings(locale);

  useEffect(() => {
    console.error("[app] Fatal error:", error);
  }, [error]);

  return (
    <html lang={htmlLang[locale]} dir={directionOf(locale)}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "2rem 1rem",
          textAlign: "center",
          background: palette.bg,
          color: palette.text,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Vazirmatn, Tahoma, sans-serif",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
          {strings.errorTitle}
        </h1>
        <p style={{ margin: 0, maxWidth: "32rem", color: palette.muted }}>
          {strings.errorBody}
        </p>

        {error.digest ? (
          <p style={{ margin: 0, fontSize: "0.75rem", color: palette.muted }}>
            {strings.errorRef}{" "}
            <span dir="ltr" style={{ fontFamily: "ui-monospace, monospace" }}>
              {error.digest}
            </span>
          </p>
        ) : null}

        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.25rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: `1px solid ${palette.accent}`,
            background: "transparent",
            color: palette.accent,
            font: "inherit",
            cursor: "pointer",
          }}
        >
          {strings.retry}
        </button>
      </body>
    </html>
  );
}
