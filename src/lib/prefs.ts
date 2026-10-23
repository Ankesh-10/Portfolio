"use client";
import { useSyncExternalStore } from "react";

// Tiny persisted-preference store (localStorage + subscribers), used for `shortcuts` and `theme`.
export function makePref<T extends string>(key: string, def: T, allowed: readonly T[]) {
  const listeners = new Set<() => void>();
  const read = (): T => {
    try {
      const v = localStorage.getItem(key) as T | null;
      return v && allowed.includes(v) ? v : def;
    } catch {
      return def;
    }
  };
  const set = (v: T) => {
    try {
      localStorage.setItem(key, v);
    } catch {}
    listeners.forEach((l) => l());
  };
  const use = (): T =>
    useSyncExternalStore(
      (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      },
      read,
      () => def,
    );
  return { use, set, read };
}

export const shortcutsPref = makePref("shortcuts", "on", ["on", "off"] as const);
export const themePref = makePref("theme", "hex", ["hex", "log"] as const);
