"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { getScenarios, deleteScenario } from "@/lib/storage";
import { formatCurrency } from "@/lib/format";

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
          <h2 className="text-lg font-semibold text-slate-900">Scenarios</h2>
          <div className="flex gap-2">
            {scenarios.length > 1 && (
              <Link
                href="/compare"
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Compare
              </Link>
            )}
            <Link
              href="/scenario/new"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              + New scenario
            </Link>
          </div>
        </div>

        {scenarios.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No scenarios yet. Create your first retirement scenario to see projections.
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scenarios.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{s.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Age {s.currentAge} &rarr; {s.retirementAge}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Current savings: {formatCurrency(s.currentSavings)}
                </p>
                <p className="text-sm text-slate-600">
                  Monthly contribution: {formatCurrency(s.monthlyContribution)}
                </p>
                <div className="mt-4 flex gap-2 text-sm">
                  <Link
                    href={`/scenario/${s.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                  <Link
                    href={`/scenario/${s.id}/edit`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
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
