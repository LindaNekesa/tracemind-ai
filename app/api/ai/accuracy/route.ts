import { NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${AI_ENGINE_URL}/accuracy`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable" }, { status: 503 });
  }
}
