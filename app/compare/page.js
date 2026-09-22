"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import ComparisonChart from "@/components/ComparisonChart";
import { getScenarios } from "@/lib/storage";
import { calculateAccumulation, checkGoal } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

function CompareContent() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // localStorage is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScenarios(getScenarios());
  }, []);

  const selected = scenarios.filter((s) => selectedIds.includes(s.id));

  const results = useMemo(
    () =>
      selected.map((scenario) => {
        const accumulation = calculateAccumulation(scenario);
        const goal = checkGoal({
          targetAmount: scenario.targetAmount,
          projectedAmount: accumulation.nominalAtRetirement,
        });
        return { scenario, accumulation, goal };
      }),
    [selected]
  );

  function toggle(id) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  const chartSeries = results.map(({ scenario, accumulation }) => ({
    name: scenario.name,
    points: [
      { age: scenario.currentAge, value: scenario.currentSavings },
      ...accumulation.rows.map((r) => ({ age: r.age, value: r.endBalance })),
    ],
  }));

  return (
    <div className="min-h-screen">
      <AppHeader title="Compare scenarios" />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Link href="/dashboard" className="text-sm text-slate-700 underline">
          &larr; Back to dashboard
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Select scenarios
          </h2>
          {scenarios.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No scenarios saved yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {scenarios.map((s) => (
                <li key={s.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggle(s.id)}
                    />
                    {s.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        {results.length >= 1 && (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Balance over time
              </h2>
              <div className="mt-3">
                <ComparisonChart series={chartSeries} />
              </div>
            </section>

            <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Side-by-side
              </h2>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1 pr-4">Scenario</th>
                    <th className="py-1 pr-4">Nominal at retirement</th>
                    <th className="py-1 pr-4">Real at retirement</th>
                    <th className="py-1 pr-4">Target</th>
                    <th className="py-1">Goal status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ scenario, accumulation, goal }) => (
                    <tr key={scenario.id} className="border-t border-slate-100">
                      <td className="py-1 pr-4 font-medium">{scenario.name}</td>
                      <td className="py-1 pr-4">{formatCurrency(accumulation.nominalAtRetirement)}</td>
                      <td className="py-1 pr-4">{formatCurrency(accumulation.realAtRetirement)}</td>
                      <td className="py-1 pr-4">{formatCurrency(scenario.targetAmount)}</td>
                      <td className={`py-1 ${goal.isOnTrack ? "text-green-700" : "text-amber-700"}`}>
                        {goal.isOnTrack ? "On track" : "Shortfall"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <AuthGuard>
      <CompareContent />
    </AuthGuard>
  );
}
