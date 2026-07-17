import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export function AppHeader({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/documents" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
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
                d="M9 12h6m-6 4h6M9 8h1M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
              />
            </svg>
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
            Document Editor
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-slate-900">
              {user.name}
            </p>
            <p className="text-xs leading-tight text-slate-500">
              {user.email}
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
