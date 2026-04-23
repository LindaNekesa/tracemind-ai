import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@tracemind.ai";
  const adminPassword = process.env.ADMIN_PASSWORD || "Linda@2000";
  const adminName = process.env.ADMIN_NAME || "Erima Linda";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin account already exists: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: "admin",
      department: "it_security",
      emailVerified: true,
    } as Parameters<typeof prisma.user.create>[0]["data"],
  });

  console.log(`✅ Admin account created:`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role:     ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
