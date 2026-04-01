import { NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.caseId || !body.logs) {
    return NextResponse.json({ error: "caseId and logs are required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${AI_ENGINE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: body.caseId, logs: body.logs }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || "AI engine error" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable" }, { status: 503 });
  }
}
