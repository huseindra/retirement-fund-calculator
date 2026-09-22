"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, getSession } from "@/lib/auth";

export default function AppHeader({ title }) {
  const router = useRouter();
  const session = getSession();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="print:hidden border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            Retirement Fund Calculator
          </Link>
          {title && <p className="text-sm text-slate-500">{title}</p>}
        </div>
        <div className="flex items-center gap-4 text-sm">
          {session && <span className="text-slate-500">{session.username}</span>}
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
