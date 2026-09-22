import { getSettings } from "@/lib/settings";

export function formatCurrency(value, currency, locale) {
  const settings = getSettings();
  return new Intl.NumberFormat(locale ?? settings.locale, {
    style: "currency",
    currency: currency ?? settings.currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function formatPercent(value) {
  return `${(value ?? 0).toFixed(1)}%`;
}
