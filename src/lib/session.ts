"use client";
import { useSyncExternalStore } from "react";
import type { Line } from "./lines";

// Output of commands the visitor ran on the current tab, appended under the page's own lines.
// A tab change or `clear` empties it (spec §8 `clear`, §9 `clear`).
type State = { path: string; lines: Line[] };
let state: State = { path: "", lines: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function appendOutput(path: string, lines: Line[]) {
  state = { path, lines: state.path === path ? [...state.lines, ...lines] : lines };
  emit();
}

export function clearOutput() {
  state = { path: state.path, lines: [] };
  emit();
}

export function useOutput(path: string): Line[] {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
  return s.path === path ? s.lines : EMPTY;
}
const EMPTY: Line[] = [];

// ── history (spec §8: kept in sessionStorage) ──
const HIST = "cmd-history";
export function readHistory(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(HIST) ?? "[]");
  } catch {
    return [];
  }
}
export function pushHistory(cmd: string) {
  const h = readHistory();
  if (h[h.length - 1] !== cmd) h.push(cmd);
  try {
    sessionStorage.setItem(HIST, JSON.stringify(h.slice(-50)));
  } catch {}
}
