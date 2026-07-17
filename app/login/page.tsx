import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/documents");
  }

  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6M9 8h1M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Document Editor
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in with a demo account to continue
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {users.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No demo accounts found. Run{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                npm run seed
              </code>{" "}
              to create test accounts.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((user) => (
                <li key={user.id}>
                  <form action={loginAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {user.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {user.email}
                        </span>
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4 shrink-0 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          This is a demo application. Accounts are seeded for evaluation
          purposes only.
        </p>
      </div>
    </div>
  );
}
