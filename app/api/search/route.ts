import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const cases = await prisma.case.findMany({
    where: {
      title: { contains: q, mode: "insensitive" },
    },
  });

  return NextResponse.json(cases);
}
