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

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (user.role === "admin") {
      // Admins: unread AdminMessages + their own Notifications
      const [msgUnread, msgRecent, notifUnread, notifRecent] = await Promise.all([
        prisma.adminMessage.count({ where: { status: "unread" } }),
        prisma.adminMessage.findMany({
          where: { status: "unread" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { user: { select: { name: true, avatar: true } } },
        }),
        prisma.notification.count({ where: { userId: user.id, read: false } }),
        prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      const notifications = [
        ...msgRecent.map((m) => ({
          id: m.id,
          type: "message",
          title: `New message from ${m.user.name}`,
          body: m.subject,
          time: m.createdAt,
          avatar: m.user.avatar,
          href: "/admin/messages",
          read: false,
        })),
        ...notifRecent.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          time: n.createdAt,
          href: n.href,
          read: n.read,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

      return NextResponse.json({ unread: msgUnread + notifUnread, notifications });
    } else {
      // Regular users: their Notification records
      const [unread, notifications] = await Promise.all([
        prisma.notification.count({ where: { userId: user.id, read: false } }),
        prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);
      return NextResponse.json({
        unread,
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          body: n.body,
          time: n.createdAt,
          href: n.href,
          read: n.read,
        })),
      });
    }
  } catch {
    return NextResponse.json({ unread: 0, notifications: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "admin") {
    await prisma.adminMessage.updateMany({
      where: { status: "unread" },
      data: { status: "read" },
    });
  }
  // Mark user's own notifications as read
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
