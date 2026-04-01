import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [recentCases, recentEvidence, recentAnalysis] = await Promise.all([
    prisma.case.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { title: true, createdAt: true, status: true } }),
    prisma.evidence.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { filePath: true, createdAt: true } }),
    prisma.analysisResult.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { caseId: true, createdAt: true } }),
  ]);

  const activity = [
    ...recentCases.map((c) => ({ description: `Case "${c.title}" created (${c.status})`, time: c.createdAt })),
    ...recentEvidence.map((e) => ({ description: `Evidence uploaded: ${e.filePath.split("/").pop()}`, time: e.createdAt })),
    ...recentAnalysis.map((a) => ({ description: `AI analysis run on case ${a.caseId.slice(0, 8)}...`, time: a.createdAt })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6)
    .map((a) => ({ ...a, time: new Date(a.time).toLocaleString() }));

  return NextResponse.json(activity);
}
