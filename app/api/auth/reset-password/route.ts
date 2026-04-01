import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.purpose !== "reset") throw new Error("Invalid token");

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: payload.userId as string }, data: { password: hashed } });
    return NextResponse.json({ message: "Password reset successfully" });
  } catch {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }
}
