import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

function doc(...content: Record<string, unknown>[]) {
  return JSON.stringify({ type: "doc", content });
}

function heading(level: number, text: string) {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}

function paragraph(text: string, marks: string[] = []) {
  return {
    type: "paragraph",
    content: text
      ? [
          {
            type: "text",
            text,
            ...(marks.length ? { marks: marks.map((type) => ({ type })) } : {}),
          },
        ]
      : [],
  };
}

function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

async function main() {
  console.log("Seeding database...");

  await prisma.share.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const alex = await prisma.user.create({
    data: { email: "test1@example.com", name: "Alex Rivera" },
  });

  const jordan = await prisma.user.create({
    data: { email: "test2@example.com", name: "Jordan Lee" },
  });

  const welcome = await prisma.document.create({
    data: {
      title: "Welcome to Document Editor",
      ownerId: alex.id,
      content: doc(
        heading(1, "Welcome to Document Editor"),
        paragraph(
          "This is a lightweight, collaborative document editor. Use the toolbar above to format text with ",
        ),
        paragraph("Try the formatting options:"),
        bulletList([
          "Bold and italic text",
          "Headings for structure",
          "Bulleted and numbered lists",
        ]),
        paragraph(
          "Documents save automatically as you type, and you can share any document you own with other users from the dashboard.",
        ),
      ),
    },
  });

  const planning = await prisma.document.create({
    data: {
      title: "Q3 Planning Notes",
      ownerId: alex.id,
      content: doc(
        heading(2, "Q3 Planning Notes"),
        paragraph("Goals for the quarter:", ["bold"]),
        bulletList([
          "Ship the collaborative editor MVP",
          "Onboard two pilot teams",
          "Gather feedback on sharing workflow",
        ]),
      ),
    },
  });

  await prisma.document.create({
    data: {
      title: "Meeting Agenda",
      ownerId: jordan.id,
      content: doc(
        heading(2, "Weekly Sync Agenda"),
        bulletList(["Review open documents", "Discuss sharing permissions", "Plan next milestones"]),
      ),
    },
  });

  await prisma.share.create({
    data: { documentId: planning.id, userId: jordan.id },
  });

  void welcome;

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
