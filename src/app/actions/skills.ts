"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongodb";
import SkillModel from "@/lib/models/Skill";

// Skill type definition
type Skill = {
  id?: string;
  name: string;
  nameFa?: string;
  category: string;
  level: number;
  icon: string;
  order: number;
};

// Create a new skill
export async function createSkill(formData: FormData) {
  // Validate required fields
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  
  if (!name || !category) {
    return { success: false, error: "Name and category are required" };
  }
  
  try {
    await connectDB();
    
    const skillData = {
      name,
      nameFa: formData.get("nameFa") as string,
      category,
      level: parseInt(formData.get("level") as string) || 50,
      icon: formData.get("icon") as string,
      order: parseInt(formData.get("order") as string) || 0,
    };

    await SkillModel.create(skillData);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating skill:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Update an existing skill
export async function updateSkill(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: "Skill ID is required" };
  }
  
  // Validate required fields
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  
  if (!name || !category) {
    return { success: false, error: "Name and category are required" };
  }
  
  try {
    await connectDB();
    
    const skillData = {
      name,
      nameFa: formData.get("nameFa") as string,
      category,
      level: parseInt(formData.get("level") as string) || 50,
      icon: formData.get("icon") as string,
      order: parseInt(formData.get("order") as string) || 0,
    };

    await SkillModel.findByIdAndUpdate(id, skillData, { new: true });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating skill:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Delete a skill
export async function deleteSkill(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: "Skill ID is required" };
  }
  
  try {
    await connectDB();
    await SkillModel.findByIdAndDelete(id);

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting skill:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Get all skills
export async function getSkills() {
  try {
    await connectDB();
    const skills = await SkillModel.find({}).sort({ order: 1 }).lean();

    return skills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}