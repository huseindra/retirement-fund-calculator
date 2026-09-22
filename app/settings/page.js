"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import Card from "@/components/Card";
import { getSettings, saveSettings, CURRENCY_OPTIONS } from "@/lib/settings";
import { inputClass } from "@/lib/ui";

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
        <Card className="animate-fade-up">
          <label className="block text-sm font-medium text-ink" htmlFor="currency">
            Display currency
          </label>
          <select id="currency" value={settings.currency} onChange={handleChange} className={`mt-1 ${inputClass}`}>
            {CURRENCY_OPTIONS.map((o) => (
              <option key={o.currency} value={o.currency}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted">
            All figures are entered and calculated as plain numbers; this only changes how amounts
            are displayed.
          </p>
          {saved && <p className="mt-3 text-sm text-positive">Saved.</p>}
        </Card>
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
