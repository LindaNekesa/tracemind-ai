import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // Rate limit: 5 attempts per 15 minutes per IP
  const limit = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    const mins = Math.ceil(limit.resetIn / 60000);
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError) {
      console.error("[login] Database error:", dbError);
      return NextResponse.json({ error: "Service temporarily unavailable. Please try again later." }, { status: 503 });
    }

    if (!user) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Successful login — reset rate limit
    resetRateLimit(`login:${ip}`);

    // Update lastLoginAt (non-blocking — may fail if Prisma client is stale)
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } as never }).catch(() => {});

    const token = await new SignJWT({
      userId: user.id, email: user.email,
      name: user.name, role: user.role, department: user.department,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const res = NextResponse.json({ message: "Login successful", role: user.role });
    res.cookies.set("auth_token", token, { httpOnly: true, path: "/", maxAge: 8 * 60 * 60 });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
