// Core projection math for the retirement calculator.

function monthlyRateFromAnnual(annualRatePercent) {
  const annual = annualRatePercent / 100;
  return Math.pow(1 + annual, 1 / 12) - 1;
}

/**
 * Projects savings growth from currentAge to retirementAge.
 * Contributions are applied at the start of each month, then growth compounds (annuity-due).
 */
export function calculateAccumulation({
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  annualReturnRatePercent,
  inflationRatePercent,
}) {
  const years = Math.max(0, retirementAge - currentAge);
  const monthlyRate = monthlyRateFromAnnual(annualReturnRatePercent);
  const inflationRate = inflationRatePercent / 100;

  const rows = [];
  let balance = currentSavings;

  for (let year = 1; year <= years; year++) {
    const startBalance = balance;
    let contributionsThisYear = 0;

    for (let month = 0; month < 12; month++) {
      balance += monthlyContribution;
      contributionsThisYear += monthlyContribution;
      balance *= 1 + monthlyRate;
    }

    const growthThisYear = balance - startBalance - contributionsThisYear;
    const endBalanceReal = balance / Math.pow(1 + inflationRate, year);

    rows.push({
      year,
      age: currentAge + year,
      startBalance,
      contributions: contributionsThisYear,
      growth: growthThisYear,
      endBalance: balance,
      endBalanceReal,
    });
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
 * The resulting annual withdrawal then increases with inflation each subsequent year.
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
}) {
  const monthlyRate = monthlyRateFromAnnual(annualReturnRatePercent);
  const inflationRate = inflationRatePercent / 100;

  let annualWithdrawal =
    withdrawalMode === "percentRule"
      ? (withdrawalRatePercent / 100) * startingBalance
      : monthlyWithdrawal * 12;

  const rows = [];
  let balance = startingBalance;
  let depletedAtAge = null;
  const maxYears = Math.max(0, lifeExpectancyAge - retirementAge);

  for (let i = 0; i < maxYears; i++) {
    const age = retirementAge + i;
    const startBalance = balance;
    let withdrawnThisYear = 0;
    const monthlyTarget = annualWithdrawal / 12;

    for (let month = 0; month < 12; month++) {
      if (balance <= 0) {
        balance = 0;
        break;
      }
      const actualWithdrawal = Math.min(monthlyTarget, balance);
      balance -= actualWithdrawal;
      withdrawnThisYear += actualWithdrawal;
      balance *= 1 + monthlyRate;
    }

    const endBalanceReal = balance / Math.pow(1 + inflationRate, i + 1);

    rows.push({
      year: i + 1,
      age,
      startBalance,
      withdrawals: withdrawnThisYear,
      endBalance: balance,
      endBalanceReal,
    });

    if (balance <= 0 && depletedAtAge === null) {
      depletedAtAge = age + 1;
    }

    annualWithdrawal *= 1 + inflationRate;
  }

  return {
    rows,
    depletedAtAge,
    lastsThroughLifeExpectancy: depletedAtAge === null,
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
