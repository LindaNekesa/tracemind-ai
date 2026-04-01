import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { id, password } = await req.json();
  if (!id || !password) return NextResponse.json({ error: "id and password required" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Min 6 characters" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return NextResponse.json({ success: true });
}
