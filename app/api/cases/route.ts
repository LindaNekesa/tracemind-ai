import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
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
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
