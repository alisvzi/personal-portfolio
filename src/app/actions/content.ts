"use server";

import { revalidatePath } from "next/cache";
import { Content } from "@/types";
import { connectDB } from "@/lib/db/mongodb";
import ContentModel from "@/lib/models/Content";

type ContentItem = {
  key: string;
  value: string;
  type: string;
};

export async function updateContent(formData: FormData) {
  // Validate required fields
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  if (!key) {
    return { success: false, error: "Content key is required" };
  }

  try {
    await connectDB();

    const defaultContent: Content = {
      heroTitle: "",
      heroSubtitle: "",
      heroDescription: "",
      aboutText: "",
      contactEmail: "",
      contactPhone: "",
    };

    let doc = await ContentModel.findOne();
    if (!doc) {
      doc = await ContentModel.create(defaultContent as any);
    }

    (doc as any)[key] = value;
    await doc.save();

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating content:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Get all content
export async function getContent() {
  try {
    const response = await fetch(`/api/content`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch content");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching content:", error);
    return {};
  }
}