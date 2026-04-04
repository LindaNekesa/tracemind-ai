import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

const SELF_REGISTER_ROLES = [
  "viewer", "analyst", "investigator", "security_analyst",
  "auditor", "fraud_analyst", "trainee",
  "incident_responder", "forensic_examiner", "threat_hunter",
  "legal_counsel", "supervisor",
];
const VALID_DEPARTMENTS = [
  "general", "cybercrime", "digital_forensics", "incident_response",
  "threat_intelligence", "compliance", "it_security", "education",
];

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, department, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verify token (1 day expiry)
    const verifyToken = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: SELF_REGISTER_ROLES.includes(role) ? role : "viewer",
        department: VALID_DEPARTMENTS.includes(department) ? department : "general",
        phone: phone || null,
        emailVerified: false,
        verifyToken,
      } as Parameters<typeof prisma.user.create>[0]["data"],
      select: { id: true, email: true, name: true, role: true, department: true, phone: true },
    });

    // Send verification email (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verifyLink = `${baseUrl}/verify-email?token=${verifyToken}`;
    sendEmail({
      to: email,
      subject: "Verify your TraceMind AI account",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1e40af;">Welcome to TraceMind AI</h2>
          <p>Hi ${name}, please verify your email address to activate your account.</p>
          <a href="${verifyLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
            Verify Email
          </a>
          <p style="color:#6b7280;font-size:13px;">This link expires in 24 hours. If you didn't register, ignore this email.</p>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
  }
}
