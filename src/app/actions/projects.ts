"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db/mongodb";
import ProjectModel from "@/lib/models/Project";
import { generateThumbHash } from "@/lib/utils/image/thumbhash";
import { put, del } from "@vercel/blob";
import fs from "fs";
import os from "os";
import path from "path";
import { saveImageFile, deleteImageFile } from "@/lib/utils/image/upload";
import { createPlaceholderImage } from "@/lib/utils/image/placeholder";

// Project type definition
type Project = {
  id?: string;
  title: string;
  titleFa?: string;
  description: string;
  descriptionFa?: string;
  imageUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string;
  featured: boolean;
  order: number;
};

// Create a new project
export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("imageUrl") as File | null;

  if (!title || !description || !file) {
    return {
      success: false,
      error: "Title, description and image URL are required",
    };
  }

  const isProd = !!process.env.VERCEL || process.env.NODE_ENV === "production";
  let imageUrl: string = "";
  let thumbhash: string | null = null;

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = os.tmpdir();
    const ext = path.extname(file.name) || ".jpg";
    const tmpFile = path.join(tmpDir, `upload_${Date.now()}${ext}`);
    try {
      await fs.promises.writeFile(tmpFile, buffer);
      thumbhash = await generateThumbHash(tmpFile);
    } catch {}
    await fs.promises.unlink(tmpFile).catch(() => {});

    if (isProd) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return { success: false, error: "Storage is not configured (BLOB_READ_WRITE_TOKEN missing)" };
      }
      try {
        const blob = await put(file.name, buffer, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        } as any);
        imageUrl = (blob as any).url || "";
      } catch (e: any) {
        return { success: false, error: "Image upload failed" };
      }
    } else {
      try {
        const saved = await saveImageFile(file, "projects");
        imageUrl = saved.publicUrl;
      } catch (e) {
        return { success: false, error: "Local image save failed" };
      }
    }
  } else {
    const ph = await createPlaceholderImage({ text: title || "Project" });
    imageUrl = ph.publicUrl;
    thumbhash = await generateThumbHash(ph.filePath);
  }

  try {
    await connectDB();

    const project = {
      title,
      titleFa: formData.get("titleFa") as string,
      description,
      descriptionFa: formData.get("descriptionFa") as string,
      imageUrl,
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      technologies: formData.get("technologies") as string,
      featured: formData.get("featured") === "on", // Checkbox value is "on" when checked
      order: parseInt(formData.get("order") as string) || 0,
      imagePlaceholderUrl: thumbhash || "",
    };

    await ProjectModel.create(project);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Update an existing project
export async function updateProject(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: "Project ID is required" };
  }
  
  // Validate required fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("imageUrl") as File | null;
  
  if (!title || !description) {
    return {
      success: false,
      error: "Title and description are required",
    };
  }
  
  try {
    await connectDB();
  
    let imageUrl: string | undefined;
    let thumbhash: string | undefined;
    if (file && (file as any).size) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const tmpDir = os.tmpdir();
      const ext = path.extname(file.name) || ".jpg";
      const tmpFile = path.join(tmpDir, `upload_${Date.now()}${ext}`);
      try {
        await fs.promises.writeFile(tmpFile, buffer);
        const th = await generateThumbHash(tmpFile);
        thumbhash = th || undefined;
      } catch {}
      await fs.promises.unlink(tmpFile).catch(() => {});

      const isProd = !!process.env.VERCEL || process.env.NODE_ENV === "production";
      if (isProd) {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return { success: false, error: "Storage is not configured (BLOB_READ_WRITE_TOKEN missing)" };
        }
        try {
          const blob = await put(file.name, buffer, {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN,
          } as any);
          imageUrl = (blob as any).url || undefined;
        } catch {
          return { success: false, error: "Image upload failed" };
        }
      } else {
        try {
          const saved = await saveImageFile(file, "projects");
          imageUrl = saved.publicUrl;
        } catch {
          return { success: false, error: "Local image save failed" };
        }
      }
    }

    const projectData = {
      title,
      titleFa: formData.get("titleFa") as string,
      description,
      descriptionFa: formData.get("descriptionFa") as string,
      ...(imageUrl ? { imageUrl } : {}),
      ...(thumbhash ? { imagePlaceholderUrl: thumbhash } : {}),
      projectUrl: formData.get("projectUrl") as string,
      githubUrl: formData.get("githubUrl") as string,
      technologies: formData.get("technologies") as string,
      featured: formData.get("featured") === "on", // Checkbox value is "on" when checked
      order: parseInt(formData.get("order") as string) || 0,
    };

    await ProjectModel.findByIdAndUpdate(id, projectData, { new: true });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Delete a project
export async function deleteProject(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Project ID is required" };
  }

  try {
    await connectDB();
    const existing = await ProjectModel.findById(id);
    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    const imageUrl = existing.imageUrl as string;
    const isProd = !!process.env.VERCEL || process.env.NODE_ENV === "production";
    if (imageUrl) {
      // Delete from Blob in production
      if (isProd && imageUrl.includes("blob.vercel-storage.com")) {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          // Continue deletion of DB even if storage token missing
        } else {
          try {
            await del(imageUrl, { token: process.env.BLOB_READ_WRITE_TOKEN } as any);
          } catch (e) {
            // swallow, proceed with DB deletion
          }
        }
      } else {
        // Delete local file if exists
        try {
          await deleteImageFile(imageUrl);
        } catch {}
      }
    }

    await ProjectModel.findByIdAndDelete(id);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Get all projects
export async function getProjects() {
  try {
    await connectDB();
    const projects = await ProjectModel.find({}).sort({ order: 1 }).lean();

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}
