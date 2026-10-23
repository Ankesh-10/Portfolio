"use client";
import { useSyncExternalStore } from "react";

// Which item drives the left visual (spec §7 "Cross-panel links"). Rows in the buffer carry
// `data-visual="kind:key"`; hover, keyboard focus or a tap on one sets it here. It resets on
// every route change, so the route's own default (e.g. the open project) applies first.
export type VisualKind = "project" | "cert" | "photo" | "skill";
type State = { path: string; kind?: VisualKind; key?: string };

let state: State = { path: "" };
const listeners = new Set<() => void>();

export function setVisual(path: string, kind: VisualKind, key: string) {
  if (state.path === path && state.kind === kind && state.key === key) return;
  state = { path, kind, key };
  listeners.forEach((l) => l());
}

export function useVisual(path: string, kind: VisualKind): string | undefined {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
  return s.path === path && s.kind === kind ? s.key : undefined;
}
