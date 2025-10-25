"use server";

import { revalidatePath } from "next/cache";

// Content type definition
type ContentItem = {
  key: string;
  value: string;
  type: string;
};

// Update content
export async function updateContent(formData: FormData) {
  // Validate required fields
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  
  if (!key) {
    return { success: false, error: "Content key is required" };
  }
  
  try {
    const contentItem = {
      key,
      value,
      type: formData.get("type") as string || "text",
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contentItem),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || "Failed to update content" 
      };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating content:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Get all content
export async function getContent() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/content`, {
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