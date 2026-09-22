// CRUD for retirement scenarios, persisted in browser localStorage.
const SCENARIOS_KEY = "rfc_scenarios";

function readAll() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SCENARIOS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAll(scenarios) {
  window.localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
}

export function getScenarios() {
  return readAll().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getScenario(id) {
  return readAll().find((s) => s.id === id) ?? null;
}

export function createScenario(data) {
  const now = new Date().toISOString();
  const scenario = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  const scenarios = readAll();
  scenarios.push(scenario);
  writeAll(scenarios);
  return scenario;
}

export function updateScenario(id, data) {
  const scenarios = readAll();
  const index = scenarios.findIndex((s) => s.id === id);
  if (index === -1) return null;
  const updated = {
    ...scenarios[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };
  scenarios[index] = updated;
  writeAll(scenarios);
  return updated;
}

export function deleteScenario(id) {
  const scenarios = readAll().filter((s) => s.id !== id);
  writeAll(scenarios);
}
