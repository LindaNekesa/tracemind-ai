import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?verified=error", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const email = payload.email as string;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verifyToken !== token) {
      return NextResponse.redirect(new URL("/login?verified=error", req.url));
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, verifyToken: null },
    });

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?verified=error", req.url));
  }
}
