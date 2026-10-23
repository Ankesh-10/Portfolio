"use client";
import { useSyncExternalStore } from "react";

// `shortcuts on|off` (spec §8, WCAG 2.1.4). Persisted in localStorage.
const KEY = "shortcuts";
const listeners = new Set<() => void>();

export function shortcutsOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setShortcuts(v: "on" | "off") {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  listeners.forEach((l) => l());
}

export function useShortcuts(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    shortcutsOn,
    () => true,
  );
}
