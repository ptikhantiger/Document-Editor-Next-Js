import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { relativeTime } from "@/lib/format";
import { AppHeader } from "@/components/AppHeader";
import { NewDocumentMenu } from "@/components/NewDocumentMenu";
import { DocumentCard } from "@/components/DocumentCard";
import {
  deleteDocument,
  renameDocument,
  shareDocument,
  unshareDocument,
} from "@/app/actions/documents";

export default async function DocumentsPage() {
  const user = await requireUser();

  const [ownedDocuments, sharedDocuments] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { shares: { include: { user: true } } },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      include: { owner: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Your documents
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, edit, and share documents with your team.
            </p>
          </div>
          <NewDocumentMenu />
        </div>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Owned by you
          </h2>
          {ownedDocuments.length === 0 ? (
            <EmptyState message="You don't own any documents yet. Create one to get started." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ownedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  variant="owned"
                  id={doc.id}
                  title={doc.title}
                  updatedAtLabel={relativeTime(doc.updatedAt)}
                  renameAction={renameDocument.bind(null, doc.id)}
                  deleteAction={deleteDocument.bind(null, doc.id)}
                  shareAction={shareDocument.bind(null, doc.id)}
                  shares={doc.shares.map((share) => ({
                    id: share.id,
                    name: share.user.name,
                    email: share.user.email,
                    unshareAction: unshareDocument.bind(
                      null,
                      doc.id,
                      share.id,
                    ),
                  }))}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Shared with you
          </h2>
          {sharedDocuments.length === 0 ? (
            <EmptyState message="No documents have been shared with you yet." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sharedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  variant="shared"
                  id={doc.id}
                  title={doc.title}
                  updatedAtLabel={relativeTime(doc.updatedAt)}
                  ownerName={doc.owner.name}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
