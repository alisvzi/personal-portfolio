import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES = 60 * 60 * 24; // 1 day
const cookieStore = await cookies();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    await connectDB();

    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
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
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
