import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const evidence = await prisma.evidence.findUnique({ where: { id: params.id } });
    if (!evidence) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete file from disk
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), evidence.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.evidence.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete evidence" }, { status: 500 });
  }
}
