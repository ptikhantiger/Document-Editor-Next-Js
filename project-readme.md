Document Editor Project: Complete Explanation & Deliverables

This document contains the complete technical explanation of the lightweight document editor project, as well as ready-to-use templates for your required assignment deliverables.

1. ARCHITECTURE.md (Architecture Note & Technical Explanation)

Overview
This application is a lightweight, full-stack collaborative document editor built to demonstrate product engineering principles, prioritization, and rapid full-stack execution. The core focus is on delivering a robust, usable minimum viable product (MVP) over feature bloat.

Tech Stack Choices & Justifications

Framework: Next.js (App Router)

Why: Next.js allows for seamless full-stack development. Using Server Components and Server Actions reduces client-side JavaScript and simplifies API routing, which is crucial for a 4-6 hour timebox.

Database & ORM: SQLite + Prisma

Why: SQLite requires zero external infrastructure or database containerization. This ensures the reviewer can simply clone the repo, run setup commands, and evaluate the product instantly without configuring environment variables for Postgres or MongoDB. Prisma provides a type-safe layer over the database, catching errors at compile time.

Rich Text Editor: Tiptap

Why: Tiptap is headless, meaning we have full control over the styling (via Tailwind). It avoids the bulk of heavy WYSIWYG editors and easily serializes data to HTML or JSON to be stored in our database.

Authentication: Mock/Seed Auth (or NextAuth Credentials)

Why: Enterprise auth (OAuth, email magic links) requires API keys and third-party setup. To respect the reviewer's time and our timebox, authentication relies on a lightweight session system where users can "login" using predefined demo accounts (e.g., user1, user2) to test the sharing functionality.

Intentional Tradeoffs & Scope Cuts

No Real-time Cursors (CRDTs): Implementing WebSockets or CRDTs (like Yjs) for live multi-player cursors introduces immense complexity regarding state resolution and infrastructure. I opted for asynchronous "last-write-wins" saves to guarantee a bug-free core experience within the time limit.

Flat File System: I excluded folders and nested organization. A flat list separated by "Owned" and "Shared" provides exactly what is needed to prove the relational data model works.

Local File Uploads: Uploading files simply parses .txt or .md content in the browser and injects it into a new document. I intentionally excluded image uploads to avoid requiring an S3 bucket or Blob storage setup.

2. AI_WORKFLOW.md (AI-Native Workflow Note)

How AI Was Utilized
During this timeboxed assignment, AI was utilized primarily as an accelerator for boilerplate code, styling, and scaffolding, acting as a "senior pair programmer."

Tools Used: Claude 3.5 Sonnet / Gemini (for code generation and architecture planning).

Where AI Materially Sped Up Work:

Generating the initial Prisma schema based on plain-text requirements.

Writing the boilerplate for Tailwind CSS / shadcn-ui components (e.g., standardizing button styles, modals).

Drafting standard CRUD API routes (Server Actions) in Next.js.

What Was Rejected or Modified:

The AI initially suggested using PostgreSQL and Liveblocks for real-time collaboration. I rejected this and downgraded to SQLite and asynchronous saving to strictly manage the 4-6 hour timebox and ensure a frictionless reviewer experience.

I manually adjusted the Tiptap extension configurations to ensure only the requested formatting options (Bold, Italic, Headings, Lists) were enabled, stripping out unnecessary AI-suggested plugins.

Verification & Quality Control:

I maintained strict control by prompting the AI sequentially (Phase 1, Phase 2, etc.) rather than asking for the entire app at once.

I manually tested the edge cases around the sharing logic (e.g., preventing a user from sharing a document they don't own).

3. README.md (Setup & Run Instructions)

Lightweight Document Editor

Prerequisites

Node.js (v18 or higher)

npm or pnpm

Local Setup Instructions

Install Dependencies

npm install


Initialize Database
This project uses a local SQLite database for easy testing. Run the following command to generate the Prisma client and push the schema to a local .db file:

npx prisma db push


Seed the Database (Optional but recommended for testing sharing)

npm run seed


(Note: This creates two test users: test1@example.com and test2@example.com)

Start the Development Server

npm run dev


Access the App
Open http://localhost:3000 in your browser.

Testing the Application

To run the automated tests validating the core functionality:

npm run test