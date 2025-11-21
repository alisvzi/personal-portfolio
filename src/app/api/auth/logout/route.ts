import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  try {
    cookieStore.set("token", "", {
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
