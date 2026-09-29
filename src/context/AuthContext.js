/**
 * Simulated auth: checks a demo account client-side (no backend), but the
 * async login signature mirrors a real API call for an easy future swap.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEMO_USER, STORAGE_KEYS } from '../config/constants';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

const AuthContext = createContext(null);

/** Simulated network latency so loading states are exercised like a real API. */
const FAKE_LATENCY_MS = 400;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.session, null));

  /** Rejects with an Error whose message is safe to display to the user. */
  const login = useCallback(async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));

    const valid =
      username.trim().toLowerCase() === DEMO_USER.username && password === DEMO_USER.password;
    if (!valid) throw new Error('Invalid username or password.');

    const session = { username: username.trim().toLowerCase(), loggedInAt: Date.now() };
    writeStorage(STORAGE_KEYS.session, session);
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    removeStorage(STORAGE_KEYS.session);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
