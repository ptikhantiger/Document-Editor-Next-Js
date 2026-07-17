"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ShareState } from "@/app/actions/documents";

type ShareEntry = {
  id: string;
  name: string;
  email: string;
  unshareAction: (formData: FormData) => Promise<void>;
};

type DocumentCardProps =
  | {
      variant: "owned";
      id: string;
      title: string;
      updatedAtLabel: string;
      shares: ShareEntry[];
      renameAction: (formData: FormData) => Promise<void>;
      deleteAction: (formData: FormData) => Promise<void>;
      shareAction: (
        prevState: ShareState,
        formData: FormData,
      ) => Promise<ShareState>;
    }
  | {
      variant: "shared";
      id: string;
      title: string;
      updatedAtLabel: string;
      ownerName: string;
    };

function SubmitButton({
  children,
  className,
  pendingLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}

export function DocumentCard(props: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"none" | "rename" | "share" | "delete">(
    "none",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const isOwned = props.variant === "owned";

  const noopShareAction = async (_state: ShareState, _formData: FormData) => {
    void _state;
    void _formData;
    return {};
  };

  const shareState = useActionState<ShareState, FormData>(
    isOwned ? props.shareAction : noopShareAction,
    {},
  );
  const [shareResult, shareFormAction] = shareState;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setPanel("none");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeAll() {
    setMenuOpen(false);
    setPanel("none");
  }

  return (
    <div
      ref={containerRef}
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/documents/${props.id}`}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-4.5 w-4.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-900">
              {props.title}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {props.variant === "shared"
                ? `Shared by ${props.ownerName} · Updated ${props.updatedAtLabel}`
                : `Updated ${props.updatedAtLabel}`}
            </span>
          </span>
        </Link>

        {isOwned && (
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setPanel("none");
            }}
            className="shrink-0 rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 data-[open=true]:opacity-100 data-[open=true]:bg-slate-100"
            data-open={menuOpen}
            aria-label="Document options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4.5 w-4.5"
            >
              <circle cx="5" cy="12" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="19" cy="12" r="1.75" />
            </svg>
          </button>
        )}
      </div>

      {isOwned && menuOpen && panel === "none" && (
        <div className="absolute right-4 top-14 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => setPanel("rename")}
            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => setPanel("share")}
            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setPanel("delete")}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}

      {isOwned && panel === "rename" && (
        <form
          action={props.renameAction}
          onSubmit={closeAll}
          className="absolute right-4 top-14 z-30 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
        >
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            Document title
          </label>
          <input
            type="text"
            name="title"
            defaultValue={props.title}
            autoFocus
            className="mb-2 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAll}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <SubmitButton
              pendingLabel="Saving…"
              className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              Save
            </SubmitButton>
          </div>
        </form>
      )}

      {isOwned && panel === "delete" && (
        <form
          action={props.deleteAction}
          className="absolute right-4 top-14 z-30 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
        >
          <p className="mb-3 text-xs text-slate-600">
            Delete <span className="font-medium text-slate-900">{props.title}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAll}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <SubmitButton
              pendingLabel="Deleting…"
              className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              Delete
            </SubmitButton>
          </div>
        </form>
      )}

      {isOwned && panel === "share" && (
        <div className="absolute right-4 top-14 z-30 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium text-slate-600">
            Share with a teammate
          </p>
          <form action={shareFormAction} className="mb-2 flex gap-1.5">
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <SubmitButton
              pendingLabel="…"
              className="shrink-0 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              Add
            </SubmitButton>
          </form>
          {shareResult.error && (
            <p className="mb-2 text-xs text-red-600">{shareResult.error}</p>
          )}

          {props.shares.length > 0 && (
            <ul className="mb-2 max-h-36 space-y-1 overflow-y-auto">
              {props.shares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                >
                  <span className="min-w-0 truncate text-xs text-slate-700">
                    {share.name}
                  </span>
                  <form action={share.unshareAction}>
                    <button
                      type="submit"
                      className="shrink-0 text-xs font-medium text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={closeAll}
            className="w-full rounded-md px-2.5 py-1.5 text-center text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
