"use client";
import { useEffect, useState } from "react";

// The single polite live region (spec §13). Each command result is announced once.
const EVENT = "term:announce";

export function announce(msg: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: msg }));
}

export function LiveRegion() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      // Clear first so the same message twice in a row is still announced.
      setMsg("");
      clearTimeout(t);
      t = setTimeout(() => setMsg((e as CustomEvent<string>).detail), 50);
    };
    window.addEventListener(EVENT, on);
    return () => {
      window.removeEventListener(EVENT, on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {msg}
    </div>
  );
}
