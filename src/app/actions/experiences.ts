"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import ExperienceModel from "@/lib/models/Experience";

// Experience type definition
type Experience = {
  id?: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
};

// Create a new experience
export async function createExperience(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const period = formData.get("period") as string;
    const description = formData.get("description") as string;
    const technologiesString = formData.get("technologies") as string;
    const orderValue = formData.get("order");

    // Validation
    if (!title || !company || !period || !description || !technologiesString) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    const technologies = technologiesString
      .split(",")
      .map((tech) => tech.trim());
    const order = orderValue ? parseInt(orderValue as string, 10) : 0;

    const experienceData: Omit<Experience, "id"> = {
      title,
      company,
      period,
      description,
      technologies,
      order,
    };

    await connectDB();
    await ExperienceModel.create(experienceData);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Create experience error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Update an existing experience
export async function updateExperience(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const period = formData.get("period") as string;
    const description = formData.get("description") as string;
    const technologiesString = formData.get("technologies") as string;
    const orderValue = formData.get("order");

    // Validation
    if (
      !id ||
      !title ||
      !company ||
      !period ||
      !description ||
      !technologiesString
    ) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    const technologies = technologiesString
      .split(",")
      .map((tech) => tech.trim());
    const order = orderValue ? parseInt(orderValue as string, 10) : 0;

    const experienceData = {
      title,
      company,
      period,
      description,
      technologies,
      order,
    };

    await connectDB();
    await ExperienceModel.findByIdAndUpdate(id, experienceData, { new: true });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Update experience error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Delete an experience
export async function deleteExperience(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return {
        success: false,
        error: "Experience ID is required",
      };
    }

    await connectDB();
    await ExperienceModel.findByIdAndDelete(id);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete experience error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Get all experiences
export async function getExperiences() {
  try {
    await connectDB();
    const experiences = await ExperienceModel.find({}).sort({ order: 1 }).lean();
    return experiences;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
}
