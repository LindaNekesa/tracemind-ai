import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"]);
  if (auth.error) return auth.error;

  const data = await req.formData();
  const file = data.get("file") as File;
  const caseId = data.get("caseId") as string;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!caseId) return NextResponse.json({ error: "caseId is required" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
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
