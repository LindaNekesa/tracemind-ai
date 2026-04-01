import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function GET(req: NextRequest) {
  // Decode user from token
  let userId = "";
  let role = "viewer";
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId as string;
    role = (payload.role as string) || "viewer";
  } catch { /* unauthenticated — return zeros */ }

  const isAdmin = role === "admin";

  // Global counts (admin sees all, others see their own)
  const caseWhere = isAdmin ? {} : { userId };

  const [total, open, closed, evidenceCount, analysisCount, monthlyCases] = await Promise.all([
    prisma.case.count({ where: caseWhere }),
    prisma.case.count({ where: { ...caseWhere, status: "OPEN" } }),
    prisma.case.count({ where: { ...caseWhere, status: "CLOSED" } }),
    isAdmin
      ? prisma.evidence.count()
      : prisma.evidence.count({ where: { case: { userId } } }),
    isAdmin
      ? prisma.analysisResult.count()
      : prisma.analysisResult.count({ where: { case: { userId } } }),
    prisma.case.findMany({ where: caseWhere, orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);

  // Cases by month chart
  const monthMap: Record<string, number> = {};
  for (const c of monthlyCases) {
    const key = new Date(c.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
    monthMap[key] = (monthMap[key] || 0) + 1;
  }
  const chartData = Object.entries(monthMap).map(([name, value]) => ({ name, value })).slice(-6);

  // Analyst: AI risk breakdown
  let riskBreakdown: { name: string; value: number }[] = [];
  if (role === "analyst" || isAdmin) {
    const analyses = await prisma.analysisResult.findMany({
      where: isAdmin ? {} : { case: { userId } },
      select: { result: true },
    });
    const riskMap: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const a of analyses) {
      const r = (a.result as Record<string, unknown>)?.risk_level as string;
      if (r && riskMap[r] !== undefined) riskMap[r]++;
    }
    riskBreakdown = Object.entries(riskMap).map(([name, value]) => ({ name, value }));
  }

  // Investigator: recent own cases
  let recentCases: { id: string; title: string; status: string; priority: string; createdAt: Date }[] = [];
  if (role === "investigator" || isAdmin) {
    recentCases = await prisma.case.findMany({
      where: caseWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, priority: true, createdAt: true },
    });
  }

  return NextResponse.json({
    role, total, open, closed, evidenceCount, analysisCount,
    chartData, riskBreakdown, recentCases,
  });
}
