import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/api/auth/login", "/api/auth/register", "/api/auth/me", "/api/auth/forgot-password", "/api/auth/reset-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");
    const { payload } = await jwtVerify(token, secret);
    const role = (payload.role as string) || "user";

    // Protect /admin routes — admin role only
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (role !== "admin") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Forward role to pages via header
    const res = NextResponse.next();
    res.headers.set("x-user-role", role);
    res.headers.set("x-user-id", payload.userId as string);
    return res;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("auth_token");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
