import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");
const AI_ENGINE_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("token")?.value || "";
  try {
    await jwtVerify(token, secret);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const caseItem = await prisma.case.findUnique({ where: { id: params.id } });
  if (!caseItem) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  try {
    const aiRes = await fetch(`${AI_ENGINE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: caseItem.logs, caseId: params.id }),
    });
    const aiResult = await aiRes.json();

    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: { aiResult },
    });

    return NextResponse.json(updatedCase);
  } catch {
    return NextResponse.json({ error: "AI engine unreachable" }, { status: 503 });
  }
}
