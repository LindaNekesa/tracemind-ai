import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      totalUsers, adminUsers, totalCases, openCases, closedCases,
      totalEvidence, totalAnalyses, recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.case.count(),
      prisma.case.count({ where: { status: "OPEN" } }),
      prisma.case.count({ where: { status: "CLOSED" } }),
      prisma.evidence.count(),
      prisma.analysisResult.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    const monthlyCases = await prisma.case.findMany({ select: { createdAt: true }, orderBy: { createdAt: "asc" } });
    const monthMap: Record<string, number> = {};
    for (const c of monthlyCases) {
      const key = new Date(c.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
    const caseChart = Object.entries(monthMap).map(([name, value]) => ({ name, value })).slice(-6);

    const priorities = await prisma.case.groupBy({ by: ["priority"], _count: { _all: true } });
    const priorityChart = priorities.map((p) => ({ name: p.priority, value: p._count._all }));

    return NextResponse.json({
      totalUsers, adminUsers, totalCases, openCases, closedCases,
      totalEvidence, totalAnalyses, recentUsers, caseChart, priorityChart,
    });
  } catch (e) {
    console.error("Admin stats error:", e);
    return NextResponse.json({
      totalUsers: 0, adminUsers: 0, totalCases: 0, openCases: 0, closedCases: 0,
      totalEvidence: 0, totalAnalyses: 0, recentUsers: [], caseChart: [], priorityChart: [],
    });
  }
}
