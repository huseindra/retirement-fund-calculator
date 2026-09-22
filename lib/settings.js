// User display preferences (currency/locale), persisted in browser localStorage.
const SETTINGS_KEY = "rfc_settings";

export const CURRENCY_OPTIONS = [
  { currency: "USD", locale: "en-US", label: "US Dollar (USD)" },
  { currency: "EUR", locale: "de-DE", label: "Euro (EUR)" },
  { currency: "GBP", locale: "en-GB", label: "British Pound (GBP)" },
  { currency: "IDR", locale: "id-ID", label: "Indonesian Rupiah (IDR)" },
  { currency: "INR", locale: "en-IN", label: "Indian Rupee (INR)" },
  { currency: "JPY", locale: "ja-JP", label: "Japanese Yen (JPY)" },
  { currency: "AUD", locale: "en-AU", label: "Australian Dollar (AUD)" },
  { currency: "CAD", locale: "en-CA", label: "Canadian Dollar (CAD)" },
  { currency: "SGD", locale: "en-SG", label: "Singapore Dollar (SGD)" },
];

const DEFAULT_SETTINGS = { currency: "USD", locale: "en-US" };

export function getSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export function saveSettings(partial) {
  const merged = { ...getSettings(), ...partial };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}
