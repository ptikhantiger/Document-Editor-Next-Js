# Lightweight Document Editor

A lightweight, collaborative document editor built with Next.js (App Router), Prisma + SQLite, and Tiptap. Sign in as one of two seeded demo users, create and edit rich-text documents, and share them with the other user to test the sharing workflow.

## Prerequisites

- Node.js v18 or higher
- npm

## Running it locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Initialize the database**

   This project uses a local SQLite database. This generates the Prisma client and pushes the schema to a local `dev.db` file at the project root:

   ```bash
   npx prisma db push
   ```

3. **Seed the database** (recommended — needed to test sharing)

   ```bash
   npm run seed
   ```

   This creates two demo accounts — `test1@example.com` (Alex Rivera) and `test2@example.com` (Jordan Lee) — a few sample documents, and one pre-existing share between them. Re-running it wipes and recreates this seed data.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000). You'll be redirected to a sign-in screen listing the seeded demo accounts — click one to sign in (no password required).

### Running tests

```bash
npm run test
```

Runs the Vitest suite (`lib/*.test.ts`) covering the pure-logic helpers (content conversion, relative-time formatting).

### Production build

```bash
npm run build
npm run start
```

## How it works

### Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components fetch data directly with no separate API layer; Server Actions handle all mutations. |
| Database | SQLite via `@prisma/adapter-better-sqlite3` | Zero external infra — clone, `db push`, `seed`, done. |
| ORM | Prisma 7 | Type-safe schema/client, migrations, and query builder. |
| Editor | Tiptap 3 (`@tiptap/react` + `starter-kit`) | Headless — full control over styling via Tailwind; serializes to JSON for storage. |
| Styling | Tailwind CSS v4 | Utility-first, light-mode only, responsive by default. |
| Auth | Custom cookie session (no library) | The brief only calls for demo-account login, so a full auth library would be overkill. |

### Data model (`prisma/schema.prisma`)

```
User  ──< Document (ownerId)   — a user owns many documents
User  ──< Share    (userId)    — a user can be granted access to many documents
Document ──< Share (documentId) — a document can be shared with many users
```

- `Document.content` stores the Tiptap document as a JSON string (`{"type":"doc","content":[...]}`).
- `Share` is a join table between `User` and `Document`, unique on `(documentId, userId)`, so re-sharing with the same person is a no-op (`upsert`).

### Auth

There's no password. `app/login/page.tsx` lists every seeded `User` and each one is a `<form>` whose `action` is the `loginAction` Server Action (`app/actions/auth.ts`). Submitting it sets an `httpOnly` cookie (`session_user_id`) containing the chosen user's id — that's the entire session.

`lib/auth.ts` exposes:
- `getCurrentUser()` — reads the cookie, looks up the `User` row (or `null`).
- `requireUser()` — same, but redirects to `/login` if there's no session. Every protected Server Component calls this first.

### Request flow

There is no REST/GraphQL API. Pages under `app/` are `async` Server Components that call `prisma` directly during render (see `app/documents/page.tsx`, `app/documents/[id]/page.tsx`). All writes go through **Server Actions** in `app/actions/`:

- `app/actions/auth.ts` — `loginAction`, `logoutAction`.
- `app/actions/documents.ts` — `createDocument`, `renameDocument`, `deleteDocument`, `updateDocumentContent`, `shareDocument`, `unshareDocument`.

Each action re-checks authorization server-side (e.g. `assertOwner` before rename/delete/share) — the UI hiding a button is not treated as access control. Mutating actions call `revalidatePath()` so the dashboard/editor Server Components refetch fresh data on the next render.

### The editor

`components/Editor.tsx` is a Client Component wrapping Tiptap's `useEditor`, configured with `StarterKit` but with `strike`, `code`, `codeBlock`, `blockquote`, and `horizontalRule` disabled — only Bold, Italic, Headings (H1–H3), and Bulleted/Numbered lists are enabled, per the brief.

Autosave: on every `onUpdate`, the editor's JSON (`editor.getJSON()`) is debounced (700ms) and sent to the `updateDocumentContent` Server Action, which verifies the current user is either the document's owner or has a `Share` row before writing. A small status dot in the toolbar reflects `saving` / `saved` / error state. There's no realtime sync between simultaneous editors — this is intentionally a "last write wins" model (see `project-readme.md` for the reasoning), not CRDT-based collaboration.

### Sharing

From the dashboard, a document owner opens the card's "…" menu → **Share**, enters a teammate's email, and submits. `shareDocument` (using React 19's `useActionState` so validation errors render inline without a page reload) looks up the `User` by email and creates a `Share` row. The recipient then sees the document under "Shared with you" on their own dashboard, and can open and edit it (sharing currently always grants edit access, matching the "last-write-wins" model — there's no separate read-only role).

### Import

"Import .txt/.md" (`components/NewDocumentMenu.tsx`) reads the chosen file client-side with `FileReader`, converts each line to a Tiptap paragraph (`lib/content.ts#textToDocumentJson`), and calls `createDocument` with that JSON pre-filled — no file ever touches a server-side filesystem or object storage.

### Project structure

```
app/
  actions/            Server Actions (auth.ts, documents.ts) — all writes go through here
  documents/
    page.tsx           Dashboard: Owned / Shared with you
    [id]/page.tsx       Editor page — access-checked per document
  login/page.tsx        Demo account picker
  layout.tsx / page.tsx / globals.css   Root shell, redirect-to-login/documents, light-mode styles
components/
  AppHeader.tsx         Shared top nav (user info + log out)
  DocumentCard.tsx       Dashboard card: rename / share / delete menu
  Editor.tsx             Tiptap editor + toolbar + autosave
  NewDocumentMenu.tsx     "New document" / "Import .txt/.md"
lib/
  auth.ts               Session helpers (getCurrentUser, requireUser)
  prisma.ts              Prisma client singleton (SQLite driver adapter)
  content.ts              Plain text ↔ Tiptap JSON conversion
  format.ts               Relative time formatting
prisma/
  schema.prisma          User / Document / Share models
  seed.ts                 Creates the two demo accounts + sample documents
```
