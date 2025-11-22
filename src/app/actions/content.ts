"use server";

import { revalidatePath } from "next/cache";
import { Content } from "@/types";

// Content type definition
type ContentItem = {
  key: string;
  value: string;
  type: string;
};

// Update content
function resolveApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "";
  if (!raw) return "http://localhost:3000";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export async function updateContent(formData: FormData) {
  // Validate required fields
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  if (!key) {
    return { success: false, error: "Content key is required" };
  }

  try {
    const API_BASE = resolveApiBase();

    // Fetch existing content to satisfy required schema fields
    let current: Partial<Content> | null = null;
    try {
      const getResp = await fetch(`${API_BASE}/api/content`, { cache: "no-store" });
      if (getResp.ok) {
        current = await getResp.json();
      }
    } catch {}

    const defaultContent: Content = {
      heroTitle: "",
      heroSubtitle: "",
      heroDescription: "",
      aboutText: "",
      contactEmail: "",
      contactPhone: "",
    };

    const payload: Content = {
      ...(current ?? defaultContent),
      [key]: value,
    } as Content;

    const response = await fetch(`${API_BASE}/api/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || "Failed to update content",
      };
    }

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
    const API_BASE = resolveApiBase();
    const response = await fetch(`${API_BASE}/api/content`, {
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