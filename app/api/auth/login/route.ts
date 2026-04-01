import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch {
      return NextResponse.json(
        { error: "Database unavailable. Please restart the server and run: npx prisma generate" },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = await new SignJWT({
      userId: user.id, email: user.email,
      name: user.name, role: user.role, department: user.department,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const res = NextResponse.json({ message: "Login successful", role: user.role });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
