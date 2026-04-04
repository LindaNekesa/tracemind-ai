import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;
    if (!["admin", "supervisor"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all investigators/analysts with their case counts by status
  const users = await prisma.user.findMany({
    where: { role: { in: ["investigator", "analyst", "security_analyst", "forensic_examiner", "incident_responder", "threat_hunter", "fraud_analyst"] } },
    select: {
      id: true, name: true, role: true, email: true, avatar: true,
      assignedCases: {
        select: { case: { select: { status: true } } },
      },
    },
  });

  const workload = users.map((u) => {
    const open       = u.assignedCases.filter((a) => a.case.status === "OPEN").length;
    const inProgress = u.assignedCases.filter((a) => a.case.status === "IN_PROGRESS").length;
    const closed     = u.assignedCases.filter((a) => a.case.status === "CLOSED").length;
    return { id: u.id, name: u.name, role: u.role, email: u.email, avatar: u.avatar, open, inProgress, closed, total: u.assignedCases.length };
  });

  return NextResponse.json(workload);
}
