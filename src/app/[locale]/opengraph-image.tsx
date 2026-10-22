import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export const alt = "Ali Soveizi — Front-End Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph image.
 *
 * Generated at request time from JSX (no committed binary), so it always matches
 * the brand tokens and never 404s like a missing `/og-image.jpg` would. Satori
 * needs concrete colours, so the palette is mirrored in sRGB here.
 *
 * Localisation: the card is rendered per locale, and the Persian card needs a
 * Persian font — Satori's default only covers Latin. The font is fetched from
 * Google Fonts once per request and cached by the platform; if that fetch fails
 * for any reason (offline build, blocked egress, timeout) the card degrades to
 * the Latin composition rather than throwing a 500 and shipping a broken image
 * URL to every social network.
 */

const SANS_STACK = "Vazirmatn, sans-serif";

/**
 * Fetches the Vazirmatn TTF used for Persian glyphs.
 *
 * The CSS endpoint is asked with a legacy user agent on purpose: modern UAs
 * receive WOFF2, which Satori cannot parse, while older ones receive TTF.
 */
async function loadPersianFont(): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700&display=swap",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.59.10 (KHTML, like Gecko) Version/5.1.9 Safari/534.59.10",
        },
        signal: AbortSignal.timeout(3500),
      },
    );
    if (!cssResponse.ok) return null;

    const css = await cssResponse.text();
    const match = css.match(/src:\s*url\((https:[^)]+)\)/);
    if (!match) return null;

    const fontResponse = await fetch(match[1], {
      signal: AbortSignal.timeout(3500),
    });
    if (!fontResponse.ok) return null;

    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Persian text as a sequence of shaped word boxes.
 *
 * Satori shapes Arabic script correctly inside a single run — the letters join
 * — but it lays multiple space-separated runs out left-to-right regardless of
 * `direction`, which renders «علی سویزی» as «سویزی علی». Splitting on spaces and
 * stacking the words in a `row-reverse` flex container fixes the order while
 * leaving each word's internal shaping untouched.
 */
function RtlWords({
  text,
  style,
}: {
  text: string;
  style: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        justifyContent: "flex-end",
        gap: "0.14em",
        ...style,
      }}
    >
      {text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) => (
          <span key={`${word}-${index}`}>{word}</span>
        ))}
    </div>
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const isPersian = locale === "fa";

  const font = isPersian ? await loadPersianFont() : null;
  const usePersian = isPersian && font !== null;

  const name = usePersian ? dict.meta.siteName : "Ali Soveizi";
  const role = usePersian ? dict.meta.role : "Front-End Developer";
  const kicker = usePersian ? "نمونه‌کار" : "PORTFOLIO";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a192f",
          color: "#ccd6f6",
          fontFamily: usePersian ? SANS_STACK : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: usePersian ? "row-reverse" : "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "8px",
              background: "#64ffda",
              borderRadius: "4px",
            }}
          />
          <span
            style={{
              fontSize: "28px",
              letterSpacing: usePersian ? "0px" : "4px",
              color: "#64ffda",
            }}
          >
            {kicker}
          </span>
        </div>

        {usePersian ? (
          <RtlWords
            text={name}
            style={{
              fontSize: "104px",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#e6f1ff",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: "88px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#e6f1ff",
            }}
          >
            {name}
          </div>
        )}

        {usePersian ? (
          <RtlWords
            text={role}
            style={{
              marginTop: "20px",
              fontSize: "40px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "#64ffda",
            }}
          />
        ) : (
          <div
            style={{
              marginTop: "20px",
              fontSize: "40px",
              fontWeight: 500,
              color: "#64ffda",
            }}
          >
            {role}
          </div>
        )}

        {/* Latin spelling kept on the Persian card so the two scripts are
            always visible together — it is the same entity either way. */}
        {usePersian && (
          <div
            style={{
              marginTop: "28px",
              fontSize: "24px",
              color: "#8892b0",
            }}
          >
            Ali Soveizi
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Vazirmatn", data: font, weight: 700 as const, style: "normal" as const }]
        : undefined,
    },
  );
}
