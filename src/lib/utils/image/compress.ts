"use client";

/**
 * Browser-side image downscaling.
 *
 * Vercel caps a serverless request body at 4.5 MB, and a phone screenshot is
 * routinely larger than that. Re-encoding here — before the bytes ever leave
 * the browser — keeps a multi-image save comfortably inside the limit and makes
 * the upload faster on a mobile connection. The server still validates and
 * re-encodes independently; this is an optimisation, not a trust boundary.
 */

interface CompressOptions {
  maxWidth?: number;
  quality?: number;
  /** Files below this size are passed through untouched. */
  skipBelowBytes?: number;
}

export async function compressImage(
  file: File,
  { maxWidth = 1600, quality = 0.82, skipBelowBytes = 400_000 }: CompressOptions = {},
): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxWidth / longest);

    if (scale === 1 && file.size <= skipBelowBytes) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${name}.webp`, { type: "image/webp" });
  } catch {
    // Any failure (unsupported codec, tainted canvas, huge image) falls back to
    // the original file; the server-side validator remains authoritative.
    return file;
  }
}
