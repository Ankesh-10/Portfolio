"use client";
import { useSyncExternalStore } from "react";

// The buffer's real scroll position for the vim status line (spec §6.2): top visible line + All/Top/Bot/NN%.
export type ScrollPos = { line: number; where: string };

const listeners = new Set<() => void>();
let state: ScrollPos = { line: 1, where: "All" };
const SERVER: ScrollPos = { line: 1, where: "All" };

export function setScrollPos(next: ScrollPos) {
  if (next.line === state.line && next.where === state.where) return;
  state = next;
  listeners.forEach((l) => l());
}

export function useScrollPos(): ScrollPos {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => SERVER,
  );
}
