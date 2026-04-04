import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const assignment = await prisma.caseAssignment.upsert({
      where: { caseId_userId: { caseId: id, userId } },
      create: { caseId: id, userId },
      update: {},
      include: {
        user: { select: { name: true, email: true, role: true } },
        case: { select: { title: true } },
      },
    });

    // Notify the assigned user
    await prisma.notification.create({
      data: {
        userId,
        type: "case_assigned",
        title: "Case Assigned",
        body: `You've been assigned to case '${assignment.case.title}'`,
        href: `/cases/${id}`,
      },
    });

    return NextResponse.json(assignment);
  } catch {
    return NextResponse.json({ error: "Failed to assign" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await req.json();
  await prisma.caseAssignment.deleteMany({ where: { caseId: id, userId } });
  return NextResponse.json({ success: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assignments = await prisma.caseAssignment.findMany({
    where: { caseId: id },
    include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } },
  });
  return NextResponse.json(assignments);
}
