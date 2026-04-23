import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PAGE_PERMISSIONS, type Role } from "@/lib/rbac";

const PUBLIC_PATHS = [
  "/", "/login", "/register", "/forgot-password", "/reset-password",
  "/api/auth/login", "/api/auth/register", "/api/auth/me",
  "/api/auth/forgot-password", "/api/auth/reset-password",
  "/api/auth/verify-email",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads")
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
    const role = ((payload.role as string) || "viewer") as Role;
    const userId = payload.userId as string;

    // Check page-level permissions (most specific path first)
    const match = PAGE_PERMISSIONS.find((p) => pathname.startsWith(p.path));
    if (match && !match.roles.includes(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Redirect to dashboard with a reason param so the UI can show a message
      return NextResponse.redirect(new URL("/dashboard?forbidden=1", req.url));
    }

    // Forward identity to pages/API routes via headers
    const res = NextResponse.next();
    res.headers.set("x-user-role", role);
    res.headers.set("x-user-id", userId);
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
