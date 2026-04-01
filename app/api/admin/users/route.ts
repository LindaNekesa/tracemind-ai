import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, role: true,
        department: true, phone: true, avatar: true, createdAt: true,
        _count: { select: { cases: true } },
      },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, department, phone } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "viewer", department: department || "general", phone: phone || null },
      select: { id: true, name: true, email: true, role: true, department: true, phone: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, role, department, name, phone } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const data: Record<string, string> = {};
    if (role)       data.role       = role;
    if (department) data.department = department;
    if (name)       data.name       = name;
    if (phone !== undefined) data.phone = phone;

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Delete related records first to avoid FK constraint errors
    await prisma.adminMessage.deleteMany({ where: { userId: id } });
    // Cases and evidence are kept — just unlink by deleting the user
    // (cases will remain but userId reference will be gone — handle gracefully)
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user. They may have active cases." }, { status: 500 });
  }
}
