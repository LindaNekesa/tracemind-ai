import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/server/socket";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token || "";
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;

  // Fetch case from Prisma
  const caseItem = await prisma.case.findUnique({ where: { id: String(id) } });

  if (!caseItem) return res.status(404).json({ error: "Case not found" });

  // Call FastAPI AI Engine
  const aiRes = await fetch("http://localhost:8000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logs: caseItem.logs, caseId: id }),
  });

  const aiResult = await aiRes.json();

  // Save AI result to Prisma
  const updatedCase = await prisma.case.update({
    where: { id: String(id) },
    data: { aiResult },
  });

  // Emit socket notification
  const io = getIO();
  io.emit("ai-updated", { id, aiResult });

  res.json(updatedCase);
}