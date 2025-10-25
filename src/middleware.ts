import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const protectedRoutes = ["/admin"]
  const authPages = ["/auth/login"]

  const token = req.cookies.get("token")?.value

  let isAuthenticated = false

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
      isAuthenticated = true
    } catch (err) {
      isAuthenticated = false
    }
  }

  if (protectedRoutes.some((path) => pathname.startsWith(path)) && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (authPages.includes(pathname) && isAuthenticated) {
    const adminUrl = new URL("/admin", req.url)
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
}
