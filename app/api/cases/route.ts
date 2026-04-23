import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  // All authenticated roles can view cases — middleware already enforces auth
  try {
    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("q") ?? "";
    const status   = searchParams.get("status") ?? "";
    const page     = parseInt(searchParams.get("page") ?? "1");
    const limit    = parseInt(searchParams.get("limit") ?? "20");
    const skip     = (page - 1) * limit;

    const where = {
      ...(search && { OR: [
        { title:       { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { type:        { contains: search, mode: "insensitive" as const } },
      ]}),
      ...(status && status !== "ALL" && { status }),
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where, orderBy: { createdAt: "desc" }, skip, take: limit,
        select: { id: true, title: true, status: true, priority: true, type: true, createdAt: true, userId: true },
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({ cases, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"]);
  if (auth.error) return auth.error;
  const userId = auth.userId;

  try {
    const body = await req.json();
    const { title, description, status, priority, type, logs } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const newCase = await prisma.case.create({
      data: {
        title,
        description: description || "",
        status: status || "OPEN",
        priority: priority || "MEDIUM",
        type: type || "Other",
        logs: logs || [],
        userId,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
