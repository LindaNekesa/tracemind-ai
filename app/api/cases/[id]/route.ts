import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { evidence: true, analysis: true, user: { select: { name: true, email: true } } },
    });
    if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });
    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Fetch current case to detect status change
    const existing = await prisma.case.findUnique({
      where: { id },
      include: { assignments: { select: { userId: true } } },
    });

    const updated = await prisma.case.update({
      where: { id },
      data: {
        ...(body.title       !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status      !== undefined && { status: body.status }),
        ...(body.priority    !== undefined && { priority: body.priority }),
      },
    });

    // Create notifications if status changed
    if (existing && body.status !== undefined && body.status !== existing.status) {
      const assignedUserIds = existing.assignments.map((a) => a.userId);
      if (existing.userId && !assignedUserIds.includes(existing.userId)) {
        assignedUserIds.push(existing.userId);
      }
      if (assignedUserIds.length > 0) {
        await prisma.notification.createMany({
          data: assignedUserIds.map((userId) => ({
            userId,
            type: "case_status",
            title: "Case Status Updated",
            body: `Case '${updated.title}' status changed to ${body.status}`,
            href: `/cases/${id}`,
          })),
        });
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.notification.deleteMany({ where: { href: `/cases/${id}` } });
    await prisma.evidence.deleteMany({ where: { caseId: id } });
    await prisma.analysisResult.deleteMany({ where: { caseId: id } });
    await prisma.case.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
