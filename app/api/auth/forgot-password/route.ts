import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });

  const token = await new SignJWT({ userId: user.id, purpose: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your TraceMind AI password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0d1117;color:#e2e8f0;border-radius:12px;">
        <h2 style="color:#60a5fa;margin:0 0 16px;">Reset Your Password</h2>
        <p style="color:#94a3b8;margin:0 0 24px;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        <p style="color:#475569;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email.</p>
      </div>`,
  });

  return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
}
