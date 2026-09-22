export function formatCurrency(value, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function formatPercent(value) {
  return `${(value ?? 0).toFixed(1)}%`;
}
