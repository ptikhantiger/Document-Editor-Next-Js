"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import { updateDocumentContent } from "@/app/actions/documents";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export function Editor({
  documentId,
  initialContent,
}: {
  documentId: string;
  initialContent: string;
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: JSON.parse(initialContent),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[60vh] max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      setStatus("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        try {
          await updateDocumentContent(
            documentId,
            JSON.stringify(editor.getJSON()),
          );
          setStatus("saved");
        } catch {
          setStatus("error");
        }
      }, 700);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const DEFAULT_TOOLBAR_STATE = {
    bold: false,
    italic: false,
    h1: false,
    h2: false,
    h3: false,
    bulletList: false,
    orderedList: false,
  };

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return DEFAULT_TOOLBAR_STATE;
      return {
        bold: ctx.editor.isActive("bold"),
        italic: ctx.editor.isActive("italic"),
        h1: ctx.editor.isActive("heading", { level: 1 }),
        h2: ctx.editor.isActive("heading", { level: 2 }),
        h3: ctx.editor.isActive("heading", { level: 3 }),
        bulletList: ctx.editor.isActive("bulletList"),
        orderedList: ctx.editor.isActive("orderedList"),
      };
    },
  });

  if (!editor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-400">
        Loading editor…
      </div>
    );
  }

  const toolbarState = editorState ?? DEFAULT_TOOLBAR_STATE;

  return (
    <div className="flex flex-col">
      <div className="sticky top-[57px] z-10 -mx-4 flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <ToolbarButton
          label="Bold"
          active={toolbarState.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={toolbarState.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton
          label="Heading 1"
          active={toolbarState.h1}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={toolbarState.h2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={toolbarState.h3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton
          label="Bullet list"
          active={toolbarState.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" d="M9 6h11M9 12h11M9 18h11" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={toolbarState.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" d="M9 6h11M9 12h11M9 18h11" />
            <text x="1" y="8" fontSize="7" fill="currentColor" stroke="none">
              1
            </text>
            <text x="1" y="14" fontSize="7" fill="currentColor" stroke="none">
              2
            </text>
            <text x="1" y="20" fontSize="7" fill="currentColor" stroke="none">
              3
            </text>
          </svg>
        </ToolbarButton>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "saving"
                ? "animate-pulse bg-amber-400"
                : status === "error"
                  ? "bg-red-500"
                  : "bg-emerald-500"
            }`}
          />
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "error" && "Couldn't save"}
        </div>
      </div>

      <div className="py-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
