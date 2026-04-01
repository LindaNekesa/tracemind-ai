import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const messages = await prisma.adminMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  return NextResponse.json(messages);
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const msg = await prisma.adminMessage.update({ where: { id }, data: { status } });
  return NextResponse.json(msg);
}
