"use client";
import { tabFor } from "./routes";

// First vs return visit per tab in this session (spec §9 timelines). The first route rendered in
// a page load takes its visit from the inline script's <html data-reveal> (boot or land).
export type Visit = "boot" | "land" | "first" | "return" | "instant";
const KEY = "visited-tabs";
let current: { path: string; visit: Visit } | null = null;

function load(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

/** Idempotent per path, so calling it during render (and twice in StrictMode) is safe. */
export function visitFor(path: string): Visit {
  if (typeof window === "undefined") return "land";
  if (current?.path === path) return current.visit;
  const tab = tabFor(path)?.slug ?? path;
  const seen = load();
  let visit: Visit;
  if (!current) {
    const r = document.documentElement.dataset.reveal;
    visit = r === "boot" ? "boot" : r ? "land" : "instant";
  } else visit = seen.has(tab) ? "return" : "first";
  seen.add(tab);
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {}
  current = { path, visit };
  return visit;
}

/** Text animates unless motion is paused or reduced (spec §9 "Pause control", "Reduced motion"). */
export function motionAllowed(): boolean {
  return (
    document.documentElement.dataset.motion !== "off" &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
