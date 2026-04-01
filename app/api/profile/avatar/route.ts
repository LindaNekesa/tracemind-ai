import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.formData();
  const file = data.get("avatar") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Validate type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  // Validate size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${userId}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "avatars");

  try {
    mkdirSync(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    writeFileSync(join(uploadDir, filename), Buffer.from(bytes));
  } catch {
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }

  const avatarUrl = `/avatars/${filename}`;
  await prisma.user.update({ where: { id: userId }, data: { avatar: avatarUrl } });

  return NextResponse.json({ avatar: avatarUrl });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({ where: { id: userId }, data: { avatar: null } });
  return NextResponse.json({ success: true });
}
