"use client";
import { useSyncExternalStore } from "react";

export const NUDGE_KEY = "nudge-done";
const EVENT = "nudge-done";

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const read = () => {
  try {
    return sessionStorage.getItem(NUDGE_KEY) === "1";
  } catch {
    return false;
  }
};

export function markNudgeDone() {
  try {
    sessionStorage.setItem(NUDGE_KEY, "1");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** First-visit hint (spec §4). Gone after the first navigation in this session (see NavTracker). */
export function Nudge({ text }: { text: string }) {
  const done = useSyncExternalStore(subscribe, read, () => false);
  if (done) return null;
  return <p className="m-0 text-t2">{text}</p>;
}
