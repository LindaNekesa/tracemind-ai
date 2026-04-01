import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { sendEmail, replyTemplate } from "@/lib/mailer";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function POST(req: NextRequest) {
  // Verify admin
  try {
    const token = req.cookies.get("auth_token")?.value ?? "";
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { messageId, replyBody } = await req.json();
    if (!messageId || !replyBody?.trim()) {
      return NextResponse.json({ error: "messageId and replyBody are required" }, { status: 400 });
    }

    // Fetch the original message with user info
    const msg = await prisma.adminMessage.findUnique({
      where: { id: messageId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    // Send email
    await sendEmail({
      to: msg.user.email,
      subject: `Re: ${msg.subject} — TraceMind AI`,
      html: replyTemplate({
        userName:        msg.user.name,
        originalSubject: msg.subject,
        originalMessage: msg.message,
        replyBody,
        adminName:       (payload.name as string) || "Admin",
      }),
    });

    // Mark message as resolved
    await prisma.adminMessage.update({
      where: { id: messageId },
      data: { status: "resolved" },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    console.error("Reply email error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
