import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, email: true, name: true, role: true, department: true, phone: true, avatar: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    const { phone } = await req.json();

    const user = await prisma.user.update({
      where: { id: payload.userId as string },
      data: { phone },
      select: { id: true, phone: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
