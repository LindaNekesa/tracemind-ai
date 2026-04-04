import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const format = new URL(req.url).searchParams.get("format") ?? "csv";

  const cases = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      evidence: { select: { id: true } },
      analysis: { select: { id: true, result: true } },
    },
  });

  if (format === "csv") {
    const header = "ID,Title,Type,Status,Priority,Created By,Evidence Files,Risk Score,Created At\n";
    const rows = cases.map((c) => {
      const latest = c.analysis[c.analysis.length - 1];
      const risk = latest ? (latest.result as Record<string, unknown>)?.risk_score ?? "N/A" : "N/A";
      return [
        c.id, `"${c.title}"`, c.type, c.status, c.priority,
        `"${c.user.name}"`, c.evidence.length, risk,
        new Date(c.createdAt).toLocaleDateString(),
      ].join(",");
    }).join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tracemind-report-${Date.now()}.csv"`,
      },
    });
  }

  // JSON export
  return NextResponse.json(cases, {
    headers: { "Content-Disposition": `attachment; filename="tracemind-report-${Date.now()}.json"` },
  });
}
