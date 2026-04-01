import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Parse logs — accept JSON array or plain text lines
  let logs: unknown[] = [];
  if (body.logs) {
    try {
      logs = JSON.parse(body.logs);
    } catch {
      logs = String(body.logs)
        .split("\n")
        .filter(Boolean)
        .map((line) => ({ raw: line }));
    }
  }

  try {
    const res = await fetch(`${AI_ENGINE_URL}/credibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId:         body.caseId || "manual-verify",
        title:          body.title || "Untitled",
        description:    body.description || "",
        status:         body.status || "OPEN",
        priority:       body.priority || "MEDIUM",
        type:           body.type || "Other",
        logs,
        evidence_count: parseInt(body.evidence_count) || 0,
        analysis_count: 0,
        risk_score:     0,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail || "Engine error" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable. Make sure the Python server is running on port 8000." }, { status: 503 });
  }
}
