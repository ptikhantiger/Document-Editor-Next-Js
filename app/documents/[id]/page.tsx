import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Editor } from "@/components/Editor";
import { relativeTime } from "@/lib/format";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const document = await prisma.document.findUnique({
    where: { id },
    include: { owner: true, shares: true },
  });

  if (!document) {
    notFound();
  }

  const isOwner = document.ownerId === user.id;
  const hasAccess =
    isOwner || document.shares.some((share) => share.userId === user.id);

  if (!hasAccess) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader user={user} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="pt-6">
          <Link
            href="/documents"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All documents
          </Link>

          <h1 className="mb-1 truncate text-2xl font-semibold text-slate-900">
            {document.title}
          </h1>
          <p className="mb-2 text-sm text-slate-500">
            {isOwner
              ? `Owned by you · Updated ${relativeTime(document.updatedAt)}`
              : `Owned by ${document.owner.name} · Updated ${relativeTime(document.updatedAt)}`}
          </p>
        </div>

        <Editor documentId={document.id} initialContent={document.content} />
      </main>
    </div>
  );
}
