"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { EMPTY_DOCUMENT_JSON, textToDocumentJson } from "@/lib/content";

async function assertOwner(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document || document.ownerId !== userId) {
    throw new Error("You do not have permission to modify this document.");
  }
  return document;
}

export async function createDocument(formData: FormData) {
  const user = await requireUser();

  const rawTitle = formData.get("title");
  const title =
    typeof rawTitle === "string" && rawTitle.trim()
      ? rawTitle.trim()
      : "Untitled document";

  const rawContent = formData.get("importedText");
  const content =
    typeof rawContent === "string" && rawContent.trim()
      ? textToDocumentJson(rawContent)
      : EMPTY_DOCUMENT_JSON;

  const document = await prisma.document.create({
    data: { title, content, ownerId: user.id },
  });

  revalidatePath("/documents");
  redirect(`/documents/${document.id}`);
}

export async function renameDocument(documentId: string, formData: FormData) {
  const user = await requireUser();
  await assertOwner(documentId, user.id);

  const rawTitle = formData.get("title");
  const title =
    typeof rawTitle === "string" && rawTitle.trim()
      ? rawTitle.trim()
      : "Untitled document";

  await prisma.document.update({
    where: { id: documentId },
    data: { title },
  });

  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
}

export async function deleteDocument(documentId: string, _formData: FormData) {
  void _formData;
  const user = await requireUser();
  await assertOwner(documentId, user.id);

  await prisma.document.delete({ where: { id: documentId } });

  revalidatePath("/documents");
}

export async function updateDocumentContent(
  documentId: string,
  content: string,
) {
  const user = await requireUser();

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });

  if (!document) {
    throw new Error("Document not found.");
  }

  const hasAccess =
    document.ownerId === user.id ||
    document.shares.some((share) => share.userId === user.id);

  if (!hasAccess) {
    throw new Error("You do not have permission to edit this document.");
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { content },
  });
}

export type ShareState = { error?: string; success?: boolean };

export async function shareDocument(
  documentId: string,
  _prevState: ShareState,
  formData: FormData,
): Promise<ShareState> {
  const user = await requireUser();

  try {
    await assertOwner(documentId, user.id);
  } catch {
    return { error: "You do not have permission to share this document." };
  }

  const rawEmail = formData.get("email");
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!email) {
    return { error: "Enter an email address to share with." };
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return { error: `No user found with email ${email}.` };
  }

  if (targetUser.id === user.id) {
    return { error: "You already own this document." };
  }

  await prisma.share.upsert({
    where: {
      documentId_userId: { documentId, userId: targetUser.id },
    },
    create: { documentId, userId: targetUser.id },
    update: {},
  });

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");

  return { success: true };
}

export async function unshareDocument(
  documentId: string,
  shareId: string,
  _formData: FormData,
) {
  void _formData;
  const user = await requireUser();
  await assertOwner(documentId, user.id);

  await prisma.share.delete({ where: { id: shareId } });

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
}
