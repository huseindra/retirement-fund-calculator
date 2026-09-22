"use client";

import { useState } from "react";
import { buttonClass, inputClass } from "@/lib/ui";

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
  employerMatchRatePercent: 0,
  employerMatchCapMonthly: 0,
  contributionStepUpRatePercent: 0,
  returnVolatilityPercent: 15,
  taxTreatment: "none",
  taxRatePercent: 15,
  socialSecurityMonthly: 0,
};

function NumberField({ label, name, value, onChange, min = 0, step = "any", suffix }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink" htmlFor={name}>
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
          className={`tabular-nums ${inputClass}`}
          required
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-2 text-xs text-muted">
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
        <label className="block text-sm font-medium text-ink" htmlFor="name">
          Scenario name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Base case"
          className={`mt-1 ${inputClass}`}
          required
        />
      </div>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
          Savings &amp; growth
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Current age" name="currentAge" value={form.currentAge} onChange={set} suffix="years" />
          <NumberField label="Retirement age" name="retirementAge" value={form.retirementAge} onChange={set} suffix="years" />
          <NumberField label="Current savings" name="currentSavings" value={form.currentSavings} onChange={set} suffix="$" />
          <NumberField label="Monthly contribution" name="monthlyContribution" value={form.monthlyContribution} onChange={set} suffix="$" />
          <NumberField label="Expected annual return" name="annualReturnRatePercent" value={form.annualReturnRatePercent} onChange={set} suffix="%" />
          <NumberField label="Inflation rate" name="inflationRatePercent" value={form.inflationRatePercent} onChange={set} suffix="%" />
          <div>
            <NumberField
              label="Return volatility"
              name="returnVolatilityPercent"
              value={form.returnVolatilityPercent}
              onChange={set}
              suffix="% std dev"
            />
            <p className="mt-1 text-xs text-muted">Used for the Monte Carlo simulation</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
          Employer match &amp; raises
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Employer match"
            name="employerMatchRatePercent"
            value={form.employerMatchRatePercent}
            onChange={set}
            suffix="% of contribution"
          />
          <div>
            <NumberField
              label="Employer match cap"
              name="employerMatchCapMonthly"
              value={form.employerMatchCapMonthly}
              onChange={set}
              suffix="$/mo"
            />
            <p className="mt-1 text-xs text-muted">0 = no cap</p>
          </div>
          <NumberField
            label="Annual contribution increase"
            name="contributionStepUpRatePercent"
            value={form.contributionStepUpRatePercent}
            onChange={set}
            suffix="%/yr"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
          Retirement goal
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Target nest egg" name="targetAmount" value={form.targetAmount} onChange={set} suffix="$" />
          <NumberField label="Life expectancy" name="lifeExpectancyAge" value={form.lifeExpectancyAge} onChange={set} suffix="years" />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
          Withdrawal phase
        </h3>
        <div className="mt-3 space-y-4">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                className="accent-accent"
                name="withdrawalMode"
                checked={form.withdrawalMode === "percentRule"}
                onChange={() => set("withdrawalMode", "percentRule")}
              />
              Withdrawal rate rule (e.g. 4% rule)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                className="accent-accent"
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
            <NumberField
              label="Social Security / pension income"
              name="socialSecurityMonthly"
              value={form.socialSecurityMonthly}
              onChange={set}
              suffix="$/mo"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-ink">Tax treatment</span>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                className="accent-accent"
                  name="taxTreatment"
                  checked={form.taxTreatment === "none"}
                  onChange={() => set("taxTreatment", "none")}
                />
                None / already after-tax
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                className="accent-accent"
                  name="taxTreatment"
                  checked={form.taxTreatment === "roth"}
                  onChange={() => set("taxTreatment", "roth")}
                />
                Roth (tax-free withdrawals)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                className="accent-accent"
                  name="taxTreatment"
                  checked={form.taxTreatment === "traditional"}
                  onChange={() => set("taxTreatment", "traditional")}
                />
                Traditional (taxed on withdrawal)
              </label>
            </div>
            {form.taxTreatment === "traditional" && (
              <div className="mt-3 max-w-xs">
                <NumberField
                  label="Tax rate at withdrawal"
                  name="taxRatePercent"
                  value={form.taxRatePercent}
                  onChange={set}
                  suffix="%"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-negative">{error}</p>}

      <button type="submit" className={buttonClass("primary")}>
        {submitLabel}
      </button>
    </form>
  );
}
