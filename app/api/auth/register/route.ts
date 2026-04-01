import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const SELF_REGISTER_ROLES = [
  "viewer", "analyst", "investigator", "security_analyst",
  "auditor", "fraud_analyst", "trainee",
  "incident_responder", "forensic_examiner", "threat_hunter",
  "legal_counsel", "supervisor",
];
const VALID_DEPARTMENTS = [
  "general", "cybercrime", "digital_forensics", "incident_response",
  "threat_intelligence", "compliance", "it_security",
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

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: SELF_REGISTER_ROLES.includes(role) ? role : "viewer",
        department: VALID_DEPARTMENTS.includes(department) ? department : "general",
        phone: phone || null,
      },
      select: { id: true, email: true, name: true, role: true, department: true, phone: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
  }
}
