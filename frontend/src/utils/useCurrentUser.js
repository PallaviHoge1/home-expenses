import { useState, useCallback } from "react";
import { SPENT_BY } from "../config/categories";

const STORAGE_KEY = "home-expenses-current-user";

const isValidUser = (name) => SPENT_BY.includes(name);

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || "";
      return isValidUser(stored) ? stored : "";
    } catch { return ""; }
  });

  const login = useCallback((user) => {
    if (!isValidUser(user)) return;
    setCurrentUser(user);
    try { localStorage.setItem(STORAGE_KEY, user); } catch {}
  }, []);

  const logout = useCallback(() => {
    setCurrentUser("");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { currentUser, login, logout };
}
