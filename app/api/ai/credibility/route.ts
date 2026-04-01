import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AI_ENGINE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const { caseId } = await req.json();
  if (!caseId) return NextResponse.json({ error: "caseId required" }, { status: 400 });

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      evidence: { select: { id: true } },
      analysis: { select: { id: true, result: true } },
    },
  });

  if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const latestAnalysis = caseData.analysis[caseData.analysis.length - 1];
  const riskScore = latestAnalysis
    ? ((latestAnalysis.result as Record<string, unknown>)?.risk_score as number) ?? 0
    : 0;

  try {
    const res = await fetch(`${AI_ENGINE_URL}/credibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId,
        title:          caseData.title,
        description:    caseData.description,
        status:         caseData.status,
        priority:       caseData.priority,
        type:           caseData.type,
        logs:           caseData.logs,
        evidence_count: caseData.evidence.length,
        analysis_count: caseData.analysis.length,
        risk_score:     riskScore,
      }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail || "Engine error" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable" }, { status: 503 });
  }
}

// Batch — score all cases for admin overview
export async function GET() {
  const cases = await prisma.case.findMany({
    include: {
      evidence: { select: { id: true } },
      analysis: { select: { id: true, result: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const payload = cases.map((c) => {
    const latest = c.analysis[c.analysis.length - 1];
    const riskScore = latest
      ? ((latest.result as Record<string, unknown>)?.risk_score as number) ?? 0
      : 0;
    return {
      caseId:         c.id,
      title:          c.title,
      description:    c.description,
      status:         c.status,
      priority:       c.priority,
      type:           c.type,
      logs:           c.logs,
      evidence_count: c.evidence.length,
      analysis_count: c.analysis.length,
      risk_score:     riskScore,
    };
  });

  try {
    const res = await fetch(`${AI_ENGINE_URL}/credibility/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable" }, { status: 503 });
  }
}
