import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.userId as string, role: payload.role as string };
  } catch { return null; }
}

// GET — fetch unread notification count + recent notifications
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (user.role === "admin") {
      // Admins see unread messages from users
      const [unread, recent] = await Promise.all([
        prisma.adminMessage.count({ where: { status: "unread" } }),
        prisma.adminMessage.findMany({
          where: { status: "unread" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { user: { select: { name: true, avatar: true } } },
        }),
      ]);
      return NextResponse.json({
        unread,
        notifications: recent.map((m) => ({
          id: m.id,
          type: "message",
          title: `New message from ${m.user.name}`,
          body: m.subject,
          time: m.createdAt,
          avatar: m.user.avatar,
          href: "/admin/messages",
        })),
      });
    } else {
      // Regular users — no incoming messages yet, but show system notifications
      // (e.g. case status changes — placeholder for now)
      return NextResponse.json({ unread: 0, notifications: [] });
    }
  } catch {
    return NextResponse.json({ unread: 0, notifications: [] });
  }
}

// PATCH — mark all as read
export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "admin") {
    await prisma.adminMessage.updateMany({
      where: { status: "unread" },
      data: { status: "read" },
    });
  }
  return NextResponse.json({ success: true });
}
