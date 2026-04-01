import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const evidence = await prisma.evidence.findMany({
    where: { caseId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(evidence);
}
