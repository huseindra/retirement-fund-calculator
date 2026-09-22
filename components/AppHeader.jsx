"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, getSession } from "@/lib/auth";
import { buttonClass } from "@/lib/ui";

export default function AppHeader({ title }) {
  const router = useRouter();
  const session = getSession();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="print:hidden border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <Link href="/dashboard" className="font-serif text-lg italic text-ink">
            Retirement Fund Calculator
          </Link>
          {title && <p className="text-sm text-muted">{title}</p>}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/settings" className="text-muted hover:text-ink">
            Settings
          </Link>
          {session && <span className="text-muted">{session.username}</span>}
          <button onClick={handleLogout} className={buttonClass("secondary")}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
