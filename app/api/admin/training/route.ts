import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const trainees = await prisma.user.findMany({
      where: { role: "trainee" },
      select: {
        id: true, name: true, email: true, department: true,
        avatar: true, createdAt: true,
        cases: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      total: trainees.length,
      trainees: trainees.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        department: t.department,
        avatar: t.avatar,
        joinedAt: t.createdAt,
        casesCreated: t.cases.length,
        // Progress is tracked client-side in localStorage per trainee
        // We use casesCreated as a proxy for activity
        activityScore: Math.min(t.cases.length * 25, 100),
      })),
    });
  } catch {
    return NextResponse.json({ total: 0, trainees: [] });
  }
}
