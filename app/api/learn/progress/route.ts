import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { learningProgress: true },
  });
  return NextResponse.json({ learningProgress: user?.learningProgress ?? {} });
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { learningProgress } = await req.json();

    // Merge with existing
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { learningProgress: true },
    });
    const existing = (user?.learningProgress as Record<string, unknown>) ?? {};
    const merged = { ...existing, ...learningProgress };

    await prisma.user.update({
      where: { id: userId },
      data: { learningProgress: merged },
    });
    return NextResponse.json({ learningProgress: merged });
  } catch {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
