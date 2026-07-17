"use client";

import { useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { createDocument } from "@/app/actions/documents";

function NewDocumentButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
      </svg>
      {pending ? "Creating…" : "New document"}
    </button>
  );
}

export function NewDocumentMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const formData = new FormData();
      formData.set("title", file.name.replace(/\.(txt|md)$/i, ""));
      formData.set("importedText", text);
      startTransition(async () => {
        await createDocument(formData);
      });
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsText(file);
  }

  return (
    <div className="flex items-center gap-2">
      <form action={createDocument}>
        <NewDocumentButton />
      </form>
      <button
        type="button"
        disabled={isImporting}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L8 8m4-4l4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
          />
        </svg>
        {isImporting ? "Importing…" : "Import .txt/.md"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
