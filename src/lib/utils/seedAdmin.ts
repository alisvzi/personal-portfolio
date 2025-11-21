// src/lib/db/ensureAdmin.ts
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcrypt";

export async function ensureAdmin() {
  await connectDB();

  const email = "admin@example.com";
  const password = "Admin1234!";

  const existing = await User.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, role: "admin" });
    // console.log("Admin account created!");
  }
}
