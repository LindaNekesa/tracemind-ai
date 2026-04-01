-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT NOT NULL DEFAULT 'general',
ALTER COLUMN "role" SET DEFAULT 'viewer';
