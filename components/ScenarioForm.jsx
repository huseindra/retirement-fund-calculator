"use client";

import { useState } from "react";

const DEFAULTS = {
  name: "",
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 10000,
  monthlyContribution: 500,
  annualReturnRatePercent: 7,
  inflationRatePercent: 3,
  targetAmount: 1000000,
  lifeExpectancyAge: 90,
  withdrawalMode: "percentRule",
  monthlyWithdrawal: 3000,
  withdrawalRatePercent: 4,
};

function NumberField({ label, name, value, onChange, min = 0, step = "any", suffix }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={name}
          name={name}
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(name, e.target.valueAsNumber)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          required
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-2 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ScenarioForm({ initialData, onSubmit, submitLabel = "Save scenario" }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...initialData });
  const [error, setError] = useState("");

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.retirementAge <= form.currentAge) {
      setError("Retirement age must be greater than current age.");
      return;
    }
    if (form.lifeExpectancyAge <= form.retirementAge) {
      setError("Life expectancy must be greater than retirement age.");
      return;
    }
    setError("");
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="name">
          Scenario name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Base case"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          required
        />
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Savings &amp; growth
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Current age" name="currentAge" value={form.currentAge} onChange={set} suffix="years" />
          <NumberField label="Retirement age" name="retirementAge" value={form.retirementAge} onChange={set} suffix="years" />
          <NumberField label="Current savings" name="currentSavings" value={form.currentSavings} onChange={set} suffix="$" />
          <NumberField label="Monthly contribution" name="monthlyContribution" value={form.monthlyContribution} onChange={set} suffix="$" />
          <NumberField label="Expected annual return" name="annualReturnRatePercent" value={form.annualReturnRatePercent} onChange={set} suffix="%" />
          <NumberField label="Inflation rate" name="inflationRatePercent" value={form.inflationRatePercent} onChange={set} suffix="%" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Retirement goal
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Target nest egg" name="targetAmount" value={form.targetAmount} onChange={set} suffix="$" />
          <NumberField label="Life expectancy" name="lifeExpectancyAge" value={form.lifeExpectancyAge} onChange={set} suffix="years" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Withdrawal phase
        </h3>
        <div className="mt-3 space-y-4">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="withdrawalMode"
                checked={form.withdrawalMode === "percentRule"}
                onChange={() => set("withdrawalMode", "percentRule")}
              />
              Withdrawal rate rule (e.g. 4% rule)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="withdrawalMode"
                checked={form.withdrawalMode === "fixed"}
                onChange={() => set("withdrawalMode", "fixed")}
              />
              Fixed monthly amount
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {form.withdrawalMode === "percentRule" ? (
              <NumberField
                label="Annual withdrawal rate"
                name="withdrawalRatePercent"
                value={form.withdrawalRatePercent}
                onChange={set}
                suffix="%"
              />
            ) : (
              <NumberField
                label="Monthly withdrawal (today's $)"
                name="monthlyWithdrawal"
                value={form.monthlyWithdrawal}
                onChange={set}
                suffix="$"
              />
            )}
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
