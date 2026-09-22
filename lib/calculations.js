// Core projection math for the retirement calculator.

function monthlyRateFromAnnual(annualRatePercent) {
  const annual = annualRatePercent / 100;
  return Math.pow(1 + annual, 1 / 12) - 1;
}

/**
 * Projects savings growth from currentAge to retirementAge.
 * Contributions are applied at the start of each month, then growth compounds (annuity-due).
 * Employer match is a percentage of the employee's monthly contribution, capped at an optional
 * monthly dollar amount (0 or omitted means uncapped). The contribution itself can step up a
 * fixed percentage each year (e.g. to model annual raises).
 */
export function calculateAccumulation({
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  annualReturnRatePercent,
  inflationRatePercent,
  employerMatchRatePercent = 0,
  employerMatchCapMonthly = 0,
  contributionStepUpRatePercent = 0,
}) {
  const years = Math.max(0, retirementAge - currentAge);
  const monthlyRate = monthlyRateFromAnnual(annualReturnRatePercent);
  const inflationRate = inflationRatePercent / 100;
  const matchCap = employerMatchCapMonthly > 0 ? employerMatchCapMonthly : Infinity;

  const rows = [];
  let balance = currentSavings;
  let cumulativePrincipal = currentSavings;
  let cumulativeEmployerMatch = 0;
  let currentMonthlyContribution = monthlyContribution;

  for (let year = 1; year <= years; year++) {
    const startBalance = balance;
    let contributionsThisYear = 0;
    let employerMatchThisYear = 0;

    for (let month = 0; month < 12; month++) {
      const employeeContribution = currentMonthlyContribution;
      const employerMatch = Math.min(
        employeeContribution * (employerMatchRatePercent / 100),
        matchCap
      );

      balance += employeeContribution + employerMatch;
      contributionsThisYear += employeeContribution;
      employerMatchThisYear += employerMatch;
      balance *= 1 + monthlyRate;
    }

    const growthThisYear = balance - startBalance - contributionsThisYear - employerMatchThisYear;
    const endBalanceReal = balance / Math.pow(1 + inflationRate, year);
    cumulativePrincipal += contributionsThisYear;
    cumulativeEmployerMatch += employerMatchThisYear;

    rows.push({
      year,
      age: currentAge + year,
      startBalance,
      contributions: contributionsThisYear,
      employerMatch: employerMatchThisYear,
      growth: growthThisYear,
      endBalance: balance,
      endBalanceReal,
      cumulativePrincipal,
      cumulativeEmployerMatch,
      cumulativeGrowth: balance - cumulativePrincipal - cumulativeEmployerMatch,
    });

    currentMonthlyContribution *= 1 + contributionStepUpRatePercent / 100;
  }

  return {
    rows,
    nominalAtRetirement: balance,
    realAtRetirement: rows.length ? rows[rows.length - 1].endBalanceReal : currentSavings,
  };
}

/**
 * Simulates drawing down savings in retirement until depletion or life expectancy.
 * withdrawalMode: "fixed" (monthly amount in today's dollars) or "percentRule" (e.g. the 4% rule).
 * The resulting desired spending then increases with inflation each subsequent year.
 *
 * Social Security / pension income (also inflation-adjusted) offsets the amount that must be
 * pulled from savings. taxTreatment "traditional" grosses up each withdrawal so the after-tax
 * amount still covers the spending need; "roth" and "none" withdraw tax-free.
 */
export function calculateWithdrawal({
  retirementAge,
  lifeExpectancyAge,
  startingBalance,
  annualReturnRatePercent,
  inflationRatePercent,
  withdrawalMode,
  monthlyWithdrawal,
  withdrawalRatePercent,
  taxTreatment = "none",
  taxRatePercent = 0,
  socialSecurityMonthly = 0,
}) {
  const monthlyRate = monthlyRateFromAnnual(annualReturnRatePercent);
  const inflationRate = inflationRatePercent / 100;
  const taxRate = taxTreatment === "traditional" ? taxRatePercent / 100 : 0;

  let annualSpendingTarget =
    withdrawalMode === "percentRule"
      ? (withdrawalRatePercent / 100) * startingBalance
      : monthlyWithdrawal * 12;
  let annualSocialSecurity = socialSecurityMonthly * 12;

  const rows = [];
  let balance = startingBalance;
  let depletedAtAge = null;
  const maxYears = Math.max(0, lifeExpectancyAge - retirementAge);

  for (let i = 0; i < maxYears; i++) {
    const age = retirementAge + i;
    const startBalance = balance;
    let withdrawnThisYear = 0;
    let taxesPaidThisYear = 0;
    let socialSecurityThisYear = 0;
    const monthlySpendingTarget = annualSpendingTarget / 12;
    const monthlySocialSecurity = annualSocialSecurity / 12;

    for (let month = 0; month < 12; month++) {
      if (balance <= 0) {
        balance = 0;
        break;
      }
      const neededFromSavingsNet = Math.max(0, monthlySpendingTarget - monthlySocialSecurity);
      const grossFromSavings =
        taxRate > 0 ? neededFromSavingsNet / (1 - taxRate) : neededFromSavingsNet;
      const actualGrossWithdrawal = Math.min(grossFromSavings, balance);
      const actualTax = actualGrossWithdrawal * taxRate;

      balance -= actualGrossWithdrawal;
      withdrawnThisYear += actualGrossWithdrawal;
      taxesPaidThisYear += actualTax;
      socialSecurityThisYear += monthlySocialSecurity;
      balance *= 1 + monthlyRate;
    }

    const endBalanceReal = balance / Math.pow(1 + inflationRate, i + 1);

    rows.push({
      year: i + 1,
      age,
      startBalance,
      withdrawals: withdrawnThisYear,
      taxesPaid: taxesPaidThisYear,
      socialSecurityReceived: socialSecurityThisYear,
      endBalance: balance,
      endBalanceReal,
    });

    if (balance <= 0 && depletedAtAge === null) {
      depletedAtAge = age + 1;
    }

    annualSpendingTarget *= 1 + inflationRate;
    annualSocialSecurity *= 1 + inflationRate;
  }

  return {
    rows,
    depletedAtAge,
    lastsThroughLifeExpectancy: depletedAtAge === null,
  };
}

function randomNormal(mean, stddev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * stddev;
}

/**
 * Runs many randomized accumulation trials (returns drawn from a normal distribution
 * around the expected annual return) to show a spread of possible outcomes at retirement,
 * instead of a single fixed-rate projection.
 */
export function runMonteCarloSimulation({
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  annualReturnRatePercent,
  returnVolatilityPercent = 15,
  employerMatchRatePercent = 0,
  employerMatchCapMonthly = 0,
  contributionStepUpRatePercent = 0,
  trials = 300,
}) {
  const years = Math.max(0, retirementAge - currentAge);
  const matchCap = employerMatchCapMonthly > 0 ? employerMatchCapMonthly : Infinity;
  const outcomes = [];

  for (let t = 0; t < trials; t++) {
    let balance = currentSavings;
    let currentMonthlyContribution = monthlyContribution;

    for (let year = 1; year <= years; year++) {
      const yearReturnPercent = randomNormal(annualReturnRatePercent, returnVolatilityPercent);
      const monthlyRate = monthlyRateFromAnnual(Math.max(yearReturnPercent, -99));

      for (let month = 0; month < 12; month++) {
        const employeeContribution = currentMonthlyContribution;
        const employerMatch = Math.min(
          employeeContribution * (employerMatchRatePercent / 100),
          matchCap
        );
        balance += employeeContribution + employerMatch;
        balance *= 1 + monthlyRate;
      }

      currentMonthlyContribution *= 1 + contributionStepUpRatePercent / 100;
    }

    outcomes.push(Math.max(balance, 0));
  }

  outcomes.sort((a, b) => a - b);
  const percentile = (p) => outcomes[Math.min(outcomes.length - 1, Math.floor(p * outcomes.length))];

  return {
    p10: percentile(0.1),
    p50: percentile(0.5),
    p90: percentile(0.9),
    trials,
  };
}

export function checkGoal({ targetAmount, projectedAmount }) {
  const surplus = projectedAmount - targetAmount;
  return {
    surplus,
    isOnTrack: surplus >= 0,
    percentOfGoal: targetAmount > 0 ? (projectedAmount / targetAmount) * 100 : null,
  };
}
