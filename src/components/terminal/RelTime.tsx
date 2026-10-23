"use client";
import { useEffect, useState } from "react";

function rel(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Server renders the absolute date; the client swaps to relative time and refreshes each minute (spec §4). */
export function RelTime({ iso }: { iso: string }) {
  const [text, setText] = useState(iso.slice(0, 10));
  useEffect(() => {
    const tick = () => setText(rel(iso));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()}>
      {text}
    </time>
  );
}
