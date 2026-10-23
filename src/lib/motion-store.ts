"use client";
import { useSyncExternalStore } from "react";

// `‖ motion` toggle (spec §6.6). Persisted in localStorage; mirrored on <html data-motion>.
const KEY = "motion";
const listeners = new Set<() => void>();

function read(): "on" | "off" {
  try {
    return localStorage.getItem(KEY) === "off" ? "off" : "on";
  } catch {
    return "on";
  }
}

export function setMotion(v: "on" | "off") {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  document.documentElement.dataset.motion = v;
  listeners.forEach((l) => l());
}

export function useMotion(): "on" | "off" {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "on",
  );
}
