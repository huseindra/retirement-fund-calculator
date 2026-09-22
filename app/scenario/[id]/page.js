"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { getScenario, deleteScenario } from "@/lib/storage";
import {
  calculateAccumulation,
  calculateWithdrawal,
  checkGoal,
  runMonteCarloSimulation,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { downloadScenarioCSV } from "@/lib/export";
import { buttonClass } from "@/lib/ui";
import GrowthChart from "@/components/GrowthChart";

function GoalBanner({ goal, projected }) {
  const result = checkGoal({ targetAmount: goal, projectedAmount: projected });
  return (
    <Card className="animate-fade-up flex items-center justify-between gap-4 p-5 sm:p-5">
      <p className="text-sm text-muted">
        Projected at retirement: <span className="tabular-nums text-ink">{formatCurrency(projected)}</span>{" "}
        vs. target <span className="tabular-nums text-ink">{formatCurrency(goal)}</span> (
        <span className="tabular-nums">
          {result.surplus >= 0 ? "+" : ""}
          {formatCurrency(result.surplus)}
        </span>
        )
      </p>
      <Badge tone={result.isOnTrack ? "positive" : "negative"}>
        {result.isOnTrack ? "On track" : "Shortfall"}
      </Badge>
    </Card>
  );
}

const SECTION_LABEL = "text-xs font-medium uppercase tracking-wide text-muted";

function ScenarioDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [scenario, setScenario] = useState(undefined);
  const [showReal, setShowReal] = useState(false);

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
      taxTreatment: scenario.taxTreatment,
      taxRatePercent: scenario.taxRatePercent,
      socialSecurityMonthly: scenario.socialSecurityMonthly,
    });
  }, [scenario, accumulation]);

  const monteCarlo = useMemo(() => {
    if (!scenario) return null;
    return runMonteCarloSimulation(scenario);
  }, [scenario]);

  function handleExportCSV() {
    downloadScenarioCSV(scenario, accumulation.rows, withdrawal.rows);
  }

  function handleDelete() {
    if (window.confirm(`Delete scenario "${scenario.name}"? This cannot be undone.`)) {
      deleteScenario(id);
      router.push("/dashboard");
    }
  }

  if (scenario === undefined) {
    return <p className="p-8 text-sm text-muted">Loading...</p>;
  }

  if (scenario === null) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted">Scenario not found.</p>
        <Link href="/dashboard" className="text-sm text-ink underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader title={scenario.name} />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap gap-2 print:hidden">
          <Link href="/dashboard" className={buttonClass("secondary")}>
            &larr; Back
          </Link>
          <Link href={`/scenario/${id}/edit`} className={buttonClass("secondary")}>
            Edit
          </Link>
          <button onClick={handleDelete} className={buttonClass("destructive")}>
            Delete
          </button>
          <button onClick={handleExportCSV} className={buttonClass("secondary")}>
            Export CSV
          </button>
          <button onClick={() => window.print()} className={buttonClass("secondary")}>
            Print / Save as PDF
          </button>
        </div>

        <GoalBanner
          goal={scenario.targetAmount}
          projected={showReal ? accumulation.realAtRetirement : accumulation.nominalAtRetirement}
        />

        <Card className="animate-fade-up">
          <div className="flex items-center justify-between">
            <h2 className={SECTION_LABEL}>Summary</h2>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={showReal}
                onChange={(e) => setShowReal(e.target.checked)}
                className="accent-accent"
              />
              Show inflation-adjusted (real) values
            </label>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted">Nominal at retirement</dt>
              <dd className="tabular-nums font-medium text-ink">{formatCurrency(accumulation.nominalAtRetirement)}</dd>
            </div>
            <div>
              <dt className="text-muted">Real (today&apos;s $)</dt>
              <dd className="tabular-nums font-medium text-ink">{formatCurrency(accumulation.realAtRetirement)}</dd>
            </div>
            <div>
              <dt className="text-muted">Years to retirement</dt>
              <dd className="tabular-nums font-medium text-ink">{scenario.retirementAge - scenario.currentAge}</dd>
            </div>
            <div>
              <dt className="text-muted">Funds last until</dt>
              <dd className="tabular-nums font-medium text-ink">
                {withdrawal.lastsThroughLifeExpectancy
                  ? `Age ${scenario.lifeExpectancyAge}+`
                  : `Age ${withdrawal.depletedAtAge}`}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="animate-fade-up">
          <h2 className={SECTION_LABEL}>Growth over time</h2>
          <div className="mt-3">
            <GrowthChart
              rows={accumulation.rows}
              currentAge={scenario.currentAge}
              currentSavings={scenario.currentSavings}
            />
          </div>
        </Card>

        <Card className="animate-fade-up">
          <h2 className={SECTION_LABEL}>Monte Carlo simulation</h2>
          <p className="mt-1 text-xs text-muted">
            {monteCarlo.trials} randomized trials of annual returns (mean {scenario.annualReturnRatePercent}%,
            std dev {scenario.returnVolatilityPercent ?? 15}%) — nominal balance at retirement.
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-muted">Pessimistic (p10)</dt>
              <dd className="tabular-nums font-medium text-ink">{formatCurrency(monteCarlo.p10)}</dd>
            </div>
            <div>
              <dt className="text-muted">Median (p50)</dt>
              <dd className="tabular-nums font-medium text-ink">{formatCurrency(monteCarlo.p50)}</dd>
            </div>
            <div>
              <dt className="text-muted">Optimistic (p90)</dt>
              <dd className="tabular-nums font-medium text-ink">{formatCurrency(monteCarlo.p90)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="animate-fade-up">
          <h2 className={SECTION_LABEL}>Accumulation phase</h2>
          <div className="mt-3 max-h-80 overflow-y-auto print:max-h-none print:overflow-visible">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface text-muted">
                <tr>
                  <th className="py-1 pr-2">Age</th>
                  <th className="py-1 pr-2">Contributions</th>
                  <th className="py-1 pr-2">Employer match</th>
                  <th className="py-1 pr-2">Growth</th>
                  <th className="py-1">End balance{showReal ? " (real)" : ""}</th>
                </tr>
              </thead>
              <tbody>
                {accumulation.rows.map((r) => (
                  <tr key={r.year} className="border-t border-border">
                    <td className="py-1 pr-2 tabular-nums">{r.age}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatCurrency(r.contributions)}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatCurrency(r.employerMatch)}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatCurrency(r.growth)}</td>
                    <td className="py-1 tabular-nums font-medium text-ink">
                      {formatCurrency(showReal ? r.endBalanceReal : r.endBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="animate-fade-up">
          <h2 className={SECTION_LABEL}>Withdrawal phase</h2>
          <div className="mt-3 max-h-80 overflow-y-auto print:max-h-none print:overflow-visible">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface text-muted">
                <tr>
                  <th className="py-1 pr-2">Age</th>
                  <th className="py-1 pr-2">Withdrawn</th>
                  <th className="py-1 pr-2">Social Security</th>
                  <th className="py-1 pr-2">Taxes paid</th>
                  <th className="py-1">End balance{showReal ? " (real)" : ""}</th>
                </tr>
              </thead>
              <tbody>
                {withdrawal.rows.map((r) => (
                  <tr key={r.year} className="border-t border-border">
                    <td className="py-1 pr-2 tabular-nums">{r.age}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatCurrency(r.withdrawals)}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatCurrency(r.socialSecurityReceived)}</td>
                    <td className="py-1 pr-2 tabular-nums">{formatCurrency(r.taxesPaid)}</td>
                    <td className={`py-1 tabular-nums font-medium ${r.endBalance <= 0 ? "text-negative" : "text-ink"}`}>
                      {formatCurrency(showReal ? r.endBalanceReal : r.endBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
