"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";
import { getScenarios, deleteScenario } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";
import { buttonClass } from "@/lib/ui";

function DashboardContent() {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    // localStorage is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScenarios(getScenarios());
  }, []);

  function handleDelete(id, name) {
    if (window.confirm(`Delete scenario "${name}"? This cannot be undone.`)) {
      deleteScenario(id);
      setScenarios(getScenarios());
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="Your saved scenarios" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl italic text-ink">Scenarios</h2>
          <div className="flex gap-2">
            {scenarios.length > 1 && (
              <Link href="/compare" className={buttonClass("secondary")}>
                Compare
              </Link>
            )}
            <Link href="/scenario/new" className={buttonClass("primary")}>
              + New scenario
            </Link>
          </div>
        </div>

        {scenarios.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            No scenarios yet. Create your first retirement scenario to see projections.
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scenarios.map((s) => (
              <Card as="li" key={s.id} className="animate-fade-up">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-ink">{s.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      Age {s.currentAge} &rarr; {s.retirementAge}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm tabular-nums text-muted">
                  Current savings: {formatCurrency(s.currentSavings)}
                </p>
                <p className="text-sm tabular-nums text-muted">
                  Monthly contribution: {formatCurrency(s.monthlyContribution)}
                </p>
                <div className="mt-4 flex gap-2 text-sm">
                  <Link href={`/scenario/${s.id}`} className={buttonClass("secondary")}>
                    View
                  </Link>
                  <Link href={`/scenario/${s.id}/edit`} className={buttonClass("secondary")}>
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className={buttonClass("destructive")}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
