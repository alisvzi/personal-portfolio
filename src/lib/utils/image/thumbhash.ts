import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

/**
 * Generates a ThumbHash placeholder (base64) directly from an already-decoded
 * image buffer.
 *
 * Working from a buffer rather than a path avoids the temporary-file dance the
 * upload flow previously needed (`os.tmpdir()` writes are not available on
 * every serverless runtime, and the files were never reliably cleaned up).
 */
export async function generateThumbHashFromBuffer(
  input: Buffer,
  options: { width?: number; height?: number } = {},
): Promise<string | null> {
  try {
    const { data, info } = await sharp(input)
      .raw()
      .ensureAlpha()
      .resize(options.width ?? 50, options.height ?? 50, { fit: "inside" })
      .toBuffer({ resolveWithObject: true });

    const thumbhash = rgbaToThumbHash(
      info.width,
      info.height,
      new Uint8ClampedArray(data),
    );

    return Buffer.from(thumbhash).toString("base64");
  } catch (error) {
    console.warn("[thumbhash] Could not generate placeholder:", error);
    return null;
  }
}
