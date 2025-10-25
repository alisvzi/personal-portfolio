// src/lib/utils/image/upload.ts
import fs from "fs/promises";
import path from "path";

export async function saveImageFile(
  file: File,
  folder: string = "projects",
): Promise<{ filePath: string; fileName: string; publicUrl: string }> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${Date.now()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${folder}/${fileName}`;
  return { filePath, fileName, publicUrl };
}

export async function deleteImageFile(publicUrl: string): Promise<void> {
  try {
    if (!publicUrl) return;

    const relativePath = publicUrl.startsWith("/")
      ? publicUrl.slice(1)
      : publicUrl;

    const filePath = path.join(process.cwd(), "public", relativePath);

    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error("Error deleting image file:", error);
    }
  }
}
