"use client";
import { useSyncExternalStore } from "react";
import { BACKGROUND_MODE } from "./config";

// `theme hex|log` (spec §8): the background texture. Persisted in localStorage.
export type Theme = "hex" | "log";
const KEY = "theme";
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "hex" || v === "log" ? v : BACKGROUND_MODE;
  } catch {
    return BACKGROUND_MODE;
  }
}

export function setTheme(v: Theme) {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => BACKGROUND_MODE,
  );
}
