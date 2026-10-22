import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Generated Apple touch icon.
 *
 * Built from JSX at build time so the brand mark is never a stale committed
 * binary, and it stays crisp on the retina home-screen tile.
 *
 * Placement note: this lives inside `[locale]` rather than at the app root.
 * The middleware only skips requests that carry a file extension, so a root
 * `/apple-icon` (no extension) would be locale-redirected to `/fa/apple-icon`
 * and 404. Co-locating it with the locale segment matches how
 * `opengraph-image.tsx` is served and yields a working `/<locale>/apple-icon`.
 *
 * Latin-only monogram: Satori's bundled font is Latin, and Arabic-script glyphs
 * would require bundling a Persian font for a 180px tile.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a192f",
          color: "#64ffda",
          fontFamily: "sans-serif",
          fontSize: "104px",
          fontWeight: 700,
          letterSpacing: "-4px",
        }}
      >
        AS
      </div>
    ),
    { ...size },
  );
}
