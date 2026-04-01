import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results = await prisma.analysisResult.findMany({
    orderBy: { createdAt: "desc" },
    include: { case: { select: { title: true } } },
  });
  return NextResponse.json(results);
}
