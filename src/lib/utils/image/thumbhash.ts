import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

/**
 * Generates a ThumbHash placeholder (as Base64 DataURL) for an image file.
 *
 * @param filePath - Full local path to the image file
 * @param options - Optional configuration (resize dimensions)
 * @returns Base64 data URL string (for use as blur placeholder)
 */

export async function generateThumbHash(
  filePath: string,
  options: { width?: number; height?: number } = {}
): Promise<string | null> {
  const width = options.width ?? 50;
  const height = options.height ?? 50;

  const { data, info } = await sharp(filePath)
    .raw()
    .ensureAlpha() // Ensure the image has an alpha channel
    .resize(width, height, {
      // Resize to a manageable size for Thumbhash
      fit: "inside",
    })
    .toBuffer({ resolveWithObject: true });

  // Encode the image data using Thumbhash
  const thumbhash = rgbaToThumbHash(
    info.width,
    info.height,
    new Uint8ClampedArray(data) // Image data as Uint8ClampedArray
  );

  // Convert the Thumbhash to a Base64 string
  return Buffer.from(thumbhash).toString("base64");
}
