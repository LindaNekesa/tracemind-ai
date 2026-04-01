import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const evidence = await prisma.evidence.findMany({
    orderBy: { createdAt: "desc" },
    include: { case: { select: { title: true } } },
  });
  return NextResponse.json(evidence);
}
