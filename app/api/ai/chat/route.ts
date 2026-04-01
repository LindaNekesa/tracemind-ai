import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await fetch(`${AI_ENGINE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.detail || "AI error" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable" }, { status: 503 });
  }
}
