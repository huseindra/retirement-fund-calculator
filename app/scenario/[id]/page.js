"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { getScenario, deleteScenario } from "@/lib/storage";
import { calculateAccumulation, calculateWithdrawal, checkGoal } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

function GoalBanner({ goal, projected }) {
  const result = checkGoal({ targetAmount: goal, projectedAmount: projected });
  return (
    <div
      className={`rounded-lg border p-4 ${
        result.isOnTrack ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className={`font-medium ${result.isOnTrack ? "text-green-800" : "text-amber-800"}`}>
        {result.isOnTrack ? "On track to meet your goal" : "Projected to fall short of your goal"}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Projected at retirement: {formatCurrency(projected)} vs. target {formatCurrency(goal)} (
        {result.surplus >= 0 ? "+" : ""}
        {formatCurrency(result.surplus)})
      </p>
    </div>
  );
}

function ScenarioDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [scenario, setScenario] = useState(undefined);

  useEffect(() => {
    // localStorage is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScenario(getScenario(id));
  }, [id]);

  const accumulation = useMemo(() => {
    if (!scenario) return null;
    return calculateAccumulation(scenario);
  }, [scenario]);

  const withdrawal = useMemo(() => {
    if (!scenario || !accumulation) return null;
    return calculateWithdrawal({
      retirementAge: scenario.retirementAge,
      lifeExpectancyAge: scenario.lifeExpectancyAge,
      startingBalance: accumulation.nominalAtRetirement,
      annualReturnRatePercent: scenario.annualReturnRatePercent,
      inflationRatePercent: scenario.inflationRatePercent,
      withdrawalMode: scenario.withdrawalMode,
      monthlyWithdrawal: scenario.monthlyWithdrawal,
      withdrawalRatePercent: scenario.withdrawalRatePercent,
    });
  }, [scenario, accumulation]);

  function handleDelete() {
    if (window.confirm(`Delete scenario "${scenario.name}"? This cannot be undone.`)) {
      deleteScenario(id);
      router.push("/dashboard");
    }
  }

  if (scenario === undefined) {
    return <p className="p-8 text-sm text-slate-500">Loading...</p>;
  }

  if (scenario === null) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">Scenario not found.</p>
        <Link href="/dashboard" className="text-sm text-slate-900 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader title={scenario.name} />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            &larr; Back
          </Link>
          <Link
            href={`/scenario/${id}/edit`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>

        <GoalBanner goal={scenario.targetAmount} projected={accumulation.nominalAtRetirement} />

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Nominal at retirement</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(accumulation.nominalAtRetirement)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Real (today&apos;s $)</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(accumulation.realAtRetirement)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Years to retirement</dt>
              <dd className="font-medium text-slate-900">{scenario.retirementAge - scenario.currentAge}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Funds last until</dt>
              <dd className="font-medium text-slate-900">
                {withdrawal.lastsThroughLifeExpectancy
                  ? `Age ${scenario.lifeExpectancyAge}+`
                  : `Age ${withdrawal.depletedAtAge}`}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Accumulation phase
          </h2>
          <div className="mt-3 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-slate-500">
                <tr>
                  <th className="py-1 pr-2">Age</th>
                  <th className="py-1 pr-2">Contributions</th>
                  <th className="py-1 pr-2">Growth</th>
                  <th className="py-1">End balance</th>
                </tr>
              </thead>
              <tbody>
                {accumulation.rows.map((r) => (
                  <tr key={r.year} className="border-t border-slate-100">
                    <td className="py-1 pr-2">{r.age}</td>
                    <td className="py-1 pr-2">{formatCurrency(r.contributions)}</td>
                    <td className="py-1 pr-2">{formatCurrency(r.growth)}</td>
                    <td className="py-1 font-medium">{formatCurrency(r.endBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Withdrawal phase
          </h2>
          <div className="mt-3 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-slate-500">
                <tr>
                  <th className="py-1 pr-2">Age</th>
                  <th className="py-1 pr-2">Withdrawn</th>
                  <th className="py-1">End balance</th>
                </tr>
              </thead>
              <tbody>
                {withdrawal.rows.map((r) => (
                  <tr key={r.year} className="border-t border-slate-100">
                    <td className="py-1 pr-2">{r.age}</td>
                    <td className="py-1 pr-2">{formatCurrency(r.withdrawals)}</td>
                    <td className={`py-1 font-medium ${r.endBalance <= 0 ? "text-red-600" : ""}`}>
                      {formatCurrency(r.endBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ScenarioDetailPage() {
  return (
    <AuthGuard>
      <ScenarioDetailContent />
    </AuthGuard>
  );
}
