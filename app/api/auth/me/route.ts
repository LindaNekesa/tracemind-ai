import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);

    // Try to get full user from DB — fall back to JWT payload if Prisma client is stale
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
        select: { id: true, email: true, name: true, role: true, department: true, phone: true, avatar: true },
      });
      if (user) return NextResponse.json(user);
    } catch {
      // Prisma client stale — return from JWT
    }

    // Fallback: return data from JWT token
    return NextResponse.json({
      id:         payload.userId,
      email:      payload.email,
      name:       payload.name,
      role:       payload.role,
      department: payload.department,
      phone:      null,
      avatar:     null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    const body = await req.json();
    const { phone } = body;

    const user = await prisma.user.update({
      where: { id: payload.userId as string },
      data: { ...(phone !== undefined && { phone }) },
      select: { id: true, phone: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
