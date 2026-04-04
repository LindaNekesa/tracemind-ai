import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.userId as string, name: payload.name as string };
  } catch { return null; }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await prisma.caseComment.findMany({
    where: { caseId: params.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, avatar: true, role: true } } },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserId(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.caseComment.create({
    data: { caseId: params.id, userId: user.id, content },
    include: { user: { select: { name: true, avatar: true, role: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserId(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await req.json();
  await prisma.caseComment.deleteMany({ where: { id: commentId, userId: user.id } });
  return NextResponse.json({ success: true });
}
