"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, isAuthenticated } from "@/lib/auth";
import Card from "@/components/Card";
import { buttonClass, inputClass } from "@/lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(e) {
    e.preventDefault();
    if (login(username, password)) {
      router.replace("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="animate-fade-up w-full max-w-sm">
        <h1 className="font-serif text-2xl italic text-ink">Retirement Fund Calculator</h1>
        <p className="mt-1 text-sm text-muted">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`mt-1 ${inputClass}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 ${inputClass}`}
              required
            />
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <button type="submit" className={buttonClass("primary", "w-full")}>
            Sign in
          </button>
        </form>

        <p className="mt-6 rounded-md border border-border bg-canvas p-3 text-xs text-muted">
          Demo credentials — username: <code className="font-mono">admin</code>, password:{" "}
          <code className="font-mono">retire2026</code>
        </p>
      </Card>
    </div>
  );
}
