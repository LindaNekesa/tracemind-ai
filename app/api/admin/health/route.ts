import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check DB
  let db: "ok" | "error" = "error";
  let counts = { users: 0, cases: 0, evidence: 0, notifications: 0 };
  try {
    const [users, cases, evidence, notifications] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.evidence.count(),
      prisma.notification.count(),
    ]);
    db = "ok";
    counts = { users, cases, evidence, notifications };
  } catch { /* db stays error */ }

  // Check AI engine
  let ai: "ok" | "error" = "error";
  try {
    const res = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(3000) });
    if (res.ok) ai = "ok";
  } catch { /* ai stays error */ }

  return NextResponse.json({
    db,
    ai,
    uptime: process.uptime(),
    counts,
    nextVersion: process.env.npm_package_dependencies_next ?? "unknown",
  });
}
