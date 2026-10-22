import sharp from "sharp";

/**
 * Builds a small branded placeholder image for projects saved without a
 * screenshot.
 *
 * Returns a WebP buffer instead of writing a file: the previous implementation
 * wrote into `public/uploads`, which is read-only in production on Vercel.
 */
export async function createPlaceholderBuffer({
  width = 1200,
  height = 750,
  text = "",
}: {
  width?: number;
  height?: number;
  text?: string;
} = {}): Promise<Buffer> {
  const safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 40);

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="diag" patternUnits="userSpaceOnUse" width="24" height="24">
        <path d="M0,24 l24,-24" stroke="rgba(100,255,218,0.07)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag)"/>
    ${
      safeText
        ? `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             fill="rgba(204,214,246,0.75)" font-size="48"
             font-family="system-ui, sans-serif">${safeText}</text>`
        : ""
    }
  </svg>`;

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 17, g: 34, b: 64, alpha: 1 },
    },
  })
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
    .webp({ quality: 80 })
    .toBuffer();
}
