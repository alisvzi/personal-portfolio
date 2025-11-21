// src/app/actions/adminLogin.ts
"use server";

import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES = 60 * 60 * 24; // 1 day

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    await connectDB();

    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    cookieStore.set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: JWT_EXPIRES,
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.set("token", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  redirect("/auth/login");
}
