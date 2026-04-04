import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch { return null; }
}

export async function PATCH(req: NextRequest) {
  const userId = await getUser(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (newPassword !== undefined) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
