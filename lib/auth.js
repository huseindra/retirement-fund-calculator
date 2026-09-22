// Hardcoded demo credentials. See README.md for why this is not real security.
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "retire2026";

const SESSION_KEY = "rfc_session";

export function login(username, password) {
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const session = { username, loggedInAt: new Date().toISOString() };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) !== null;
}

export function getSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}
