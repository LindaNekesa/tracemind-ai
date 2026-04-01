import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const caseData = await prisma.case.findUnique({
      where: { id: params.id },
      include: { evidence: true, analysis: true, user: { select: { name: true, email: true } } },
    });
    if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });
    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.case.update({
      where: { id: params.id },
      data: {
        ...(body.title       !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status      !== undefined && { status: body.status }),
        ...(body.priority    !== undefined && { priority: body.priority }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.evidence.deleteMany({ where: { caseId: params.id } });
    await prisma.analysisResult.deleteMany({ where: { caseId: params.id } });
    await prisma.case.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}

