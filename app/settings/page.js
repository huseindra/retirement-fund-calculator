"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { getSettings, saveSettings, CURRENCY_OPTIONS } from "@/lib/settings";

function SettingsContent() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // localStorage is only available on the client, after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(getSettings());
  }, []);

  function handleChange(e) {
    const option = CURRENCY_OPTIONS.find((o) => o.currency === e.target.value);
    const updated = saveSettings({ currency: option.currency, locale: option.locale });
    setSettings(updated);
    setSaved(true);
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen">
      <AppHeader title="Settings" />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700" htmlFor="currency">
            Display currency
          </label>
          <select
            id="currency"
            value={settings.currency}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {CURRENCY_OPTIONS.map((o) => (
              <option key={o.currency} value={o.currency}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            All figures are entered and calculated as plain numbers; this only changes how amounts
            are displayed.
          </p>
          {saved && <p className="mt-3 text-sm text-green-700">Saved.</p>}
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
