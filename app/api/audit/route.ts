import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [recentCases, recentEvidence, recentAnalyses, recentMessages] = await Promise.all([
      prisma.case.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true, status: true, priority: true, createdAt: true, user: { select: { name: true, email: true } } } }),
      prisma.evidence.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, filePath: true, fileType: true, createdAt: true, case: { select: { title: true } } } }),
      prisma.analysisResult.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, caseId: true, createdAt: true, case: { select: { title: true } } } }),
      prisma.adminMessage.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, subject: true, status: true, createdAt: true, user: { select: { name: true } } } }),
    ]);

    const log = [
      ...recentCases.map((c) => ({ type: "case",     icon: "📁", action: `Case "${c.title}" created`, actor: c.user.name,    time: c.createdAt, meta: `${c.status} · ${c.priority}` })),
      ...recentEvidence.map((e) => ({ type: "evidence", icon: "🗂️", action: `Evidence uploaded: ${e.filePath.split("/").pop()}`, actor: "System", time: e.createdAt, meta: e.case?.title ?? "" })),
      ...recentAnalyses.map((a) => ({ type: "analysis", icon: "🤖", action: `AI analysis run on "${a.case?.title}"`, actor: "AI Engine", time: a.createdAt, meta: "" })),
      ...recentMessages.map((m) => ({ type: "message",  icon: "✉️", action: `Message: "${m.subject}"`, actor: m.user.name, time: m.createdAt, meta: m.status })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 50);

    return NextResponse.json(log);
  } catch {
    return NextResponse.json([]);
  }
}
