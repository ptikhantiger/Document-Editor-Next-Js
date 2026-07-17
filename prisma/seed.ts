import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";
import { seedDatabase } from "../lib/seed-data";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.share.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const { alex, jordan } = await seedDatabase(prisma);

  console.log("Seed complete.");
  console.log(`  User: ${alex.email} (${alex.name})`);
  console.log(`  User: ${jordan.email} (${jordan.name})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
