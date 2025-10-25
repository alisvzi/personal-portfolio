import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    cookies().set("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}