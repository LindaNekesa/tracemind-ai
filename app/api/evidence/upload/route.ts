import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("file") as File;
  const caseId = data.get("caseId") as string;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!caseId) return NextResponse.json({ error: "caseId is required" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const evidence = await prisma.evidence.create({
    data: {
      filePath: `/uploads/${fileName}`,
      fileType: file.type || "unknown",
      caseId,
    },
  });

  return NextResponse.json(evidence, { status: 201 });
}
