import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json(
      { authenticated: true, user: decoded },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
