function toCSVRow(values) {
  return values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
}

export function downloadScenarioCSV(scenario, accumulationRows, withdrawalRows) {
  const lines = [];
  lines.push(toCSVRow([`Scenario: ${scenario.name}`]));
  lines.push("");
  lines.push(toCSVRow(["Accumulation phase"]));
  lines.push(toCSVRow(["Age", "Contributions", "Employer match", "Growth", "End balance", "End balance (real)"]));
  accumulationRows.forEach((r) => {
    lines.push(
      toCSVRow([r.age, r.contributions.toFixed(2), r.employerMatch.toFixed(2), r.growth.toFixed(2), r.endBalance.toFixed(2), r.endBalanceReal.toFixed(2)])
    );
  });
  lines.push("");
  lines.push(toCSVRow(["Withdrawal phase"]));
  lines.push(
    toCSVRow(["Age", "Withdrawn", "Social Security received", "Taxes paid", "End balance", "End balance (real)"])
  );
  withdrawalRows.forEach((r) => {
    lines.push(
      toCSVRow([
        r.age,
        r.withdrawals.toFixed(2),
        r.socialSecurityReceived.toFixed(2),
        r.taxesPaid.toFixed(2),
        r.endBalance.toFixed(2),
        r.endBalanceReal.toFixed(2),
      ])
    );
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${scenario.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-projection.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
