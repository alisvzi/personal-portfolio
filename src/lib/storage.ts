import sharp from "sharp";

import type { ActionErrorKey } from "@/lib/api";
import { generateThumbHashFromBuffer } from "@/lib/utils/image/thumbhash";

/**
 * Image storage abstraction.
 *
 * Vercel Functions have a read-only filesystem apart from `/tmp`, so uploaded
 * files must never be written into `public/`. This module always targets
 * Vercel Blob when a token is configured, and only falls back to disk for
 * local development where `public/uploads` is writable.
 *
 * Swapping providers later means changing only this file: callers deal in the
 * opaque `url` returned by `saveImage` and pass it back to `deleteImage`.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_IMAGE_WIDTH = 1600;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export interface SavedImage {
  /** Absolute (Blob) or root-relative (local dev) URL stored on the document. */
  url: string;
  /** Base64 ThumbHash used as a `blurDataURL`, or `null` when unavailable. */
  placeholder: string | null;
}

export class ImageValidationError extends Error {
  /** Dictionary key the admin panel renders in the active language. */
  public readonly key: ActionErrorKey;
  public readonly values?: Record<string, string | number>;

  constructor(key: ActionErrorKey, values?: Record<string, string | number>) {
    super(key);
    this.name = "ImageValidationError";
    this.key = key;
    this.values = values;
  }
}

function randomKey(extension: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  // Never derive the object key from the user-supplied filename: it can contain
  // path separators, unicode tricks, or collide with an existing object.
  return `projects/${year}/${month}/${crypto.randomUUID()}.${extension}`;
}

/**
 * Validates the upload and re-encodes it.
 *
 * Re-encoding serves three purposes: it proves the bytes really are a raster
 * image (a spoofed `Content-Type` header cannot survive `sharp`), it strips
 * embedded metadata, and it produces a substantially smaller WebP for the
 * common case of a multi-megabyte phone screenshot.
 */
async function normalize(file: File): Promise<{
  buffer: Buffer;
  extension: string;
  placeholder: string | null;
}> {
  if (file.size === 0) {
    throw new ImageValidationError("imageEmpty");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageValidationError("imageTooLarge", {
      megabytes: Math.round(MAX_UPLOAD_BYTES / 1024 / 1024),
    });
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new ImageValidationError("imageUnsupported");
  }

  const input = Buffer.from(await file.arrayBuffer());

  let buffer: Buffer;
  try {
    buffer = await sharp(input, { failOn: "error" })
      .rotate() // apply EXIF orientation before the metadata is dropped
      .resize({
        width: MAX_IMAGE_WIDTH,
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new ImageValidationError("imageUnreadable");
  }

  const placeholder = await generateThumbHashFromBuffer(buffer);
  return { buffer, extension: "webp", placeholder };
}

async function saveToBlob(
  token: string,
  key: string,
  buffer: Buffer,
): Promise<string> {
  const { put } = await import("@vercel/blob");
  const blob = await put(key, buffer, {
    access: "public",
    token,
    contentType: "image/webp",
    // The key already contains a UUID, so a second random suffix would only
    // make the URL longer.
    addRandomSuffix: false,
  });
  return blob.url;
}

async function saveToDisk(key: string, buffer: Buffer): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const target = path.join(process.cwd(), "public", "uploads", key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  return `/uploads/${key}`;
}

export async function saveImage(
  file: File,
  token: string | undefined,
): Promise<SavedImage> {
  const { buffer, extension, placeholder } = await normalize(file);
  const key = randomKey(extension);

  const url = token
    ? await saveToBlob(token, key, buffer)
    : await saveToDisk(key, buffer);

  return { url, placeholder };
}

/**
 * Stores an image the server generated itself (the project placeholder card),
 * so it goes through exactly the same persistence path as a user upload.
 */
export async function saveGeneratedImage(
  buffer: Buffer,
  token: string | undefined,
): Promise<SavedImage> {
  const key = randomKey("webp");
  const url = token
    ? await saveToBlob(token, key, buffer)
    : await saveToDisk(key, buffer);

  return { url, placeholder: await generateThumbHashFromBuffer(buffer) };
}

/**
 * Removes a previously stored image.
 *
 * Fails soft: a missing object must not block deleting the database record that
 * referenced it.
 */
export async function deleteImage(
  url: string | undefined,
  token: string | undefined,
): Promise<void> {
  if (!url) return;

  try {
    if (url.startsWith("/uploads/")) {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      await fs.unlink(path.join(process.cwd(), "public", url.slice(1)));
      return;
    }

    if (token && url.includes("blob.vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(url, { token });
    }
  } catch (error) {
    console.warn(`[storage] Could not delete image ${url}:`, error);
  }
}
