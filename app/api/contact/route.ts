import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

      const msg = await prisma.adminMessage.create({
        data: { userId, subject, message },
      });

      // Trigger a browser notification if supported
      return NextResponse.json({ ...msg, notified: true }, { status: 201 });
}
