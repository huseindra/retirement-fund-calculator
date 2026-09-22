"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      // Reading localStorage auth state can only happen on the client after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  return children;
}
