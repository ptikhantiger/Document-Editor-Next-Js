import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";
import { seedDatabase } from "@/lib/seed-data";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaBootstrapped: boolean | undefined;
};

// No DATABASE_URL configured (e.g. Turso) but running on Vercel: there's no
// external database, and Vercel's deployment filesystem is read-only outside
// of /tmp and doesn't persist across cold starts. Fall back to a scratch
// SQLite file in /tmp and self-seed it below, so the app still boots and the
// demo accounts work — data just won't survive a cold start.
const isEphemeral = !process.env.DATABASE_URL && !!process.env.VERCEL;
const databaseUrl =
  process.env.DATABASE_URL ?? (isEphemeral ? "file:/tmp/dev.db" : "file:./dev.db");

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const prismaClient = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Share" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Share_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "Document_ownerId_idx" ON "Document"("ownerId")`,
  `CREATE INDEX IF NOT EXISTS "Share_userId_idx" ON "Share"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Share_documentId_userId_key" ON "Share"("documentId", "userId")`,
];

async function bootstrapEphemeralDatabase() {
  for (const statement of CREATE_TABLES_SQL) {
    await prismaClient.$executeRawUnsafe(statement);
  }
  const userCount = await prismaClient.user.count();
  if (userCount === 0) {
    await seedDatabase(prismaClient);
  }
}

// Top-level await: this module (and therefore every route/action that
// imports `prisma` from here) doesn't finish resolving until the ephemeral
// database is ready, so callers never race an empty/table-less database.
if (isEphemeral && !globalForPrisma.prismaBootstrapped) {
  globalForPrisma.prismaBootstrapped = true;
  await bootstrapEphemeralDatabase();
}

export const prisma = prismaClient;
