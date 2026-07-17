# Lightweight Document Editor

A lightweight, collaborative document editor built with Next.js (App Router), Prisma + SQLite, and Tiptap.

## Prerequisites

- Node.js v18 or higher
- npm

## Local Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Initialize the database**

   This project uses a local SQLite database. Generate the Prisma client and push the schema to a local `dev.db` file:

   ```bash
   npx prisma db push
   ```

3. **Seed the database** (recommended, needed to test sharing)

   ```bash
   npm run seed
   ```

   This creates two demo accounts: `test1@example.com` (Alex Rivera) and `test2@example.com` (Jordan Lee), a few sample documents, and one pre-existing share between them.

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000). You'll be redirected to a sign-in screen listing the seeded demo accounts — click one to sign in (no password required).

## Testing

```bash
npm run test
```

## Feature overview

- **Auth** — lightweight cookie-based session; "sign in" by picking a seeded demo account.
- **Documents** — create, rename, delete, and edit rich-text documents (Bold, Italic, Headings, Bulleted/Numbered lists) via a Tiptap editor with autosave.
- **Sharing** — owners can share a document with another user by email; shared documents appear under "Shared with you" for the recipient.
- **Import** — `.txt`/`.md` files can be imported client-side into a new document.
- **Light mode only**, responsive from mobile to desktop.
