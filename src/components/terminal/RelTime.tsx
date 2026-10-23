"use client";
import { useEffect, useState } from "react";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" });
const full = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

function rel(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return rtf.format(-m, "minute");
  const h = Math.floor(m / 60);
  if (h < 24) return rtf.format(-h, "hour");
  return rtf.format(-Math.floor(h / 24), "day");
}

/** Server renders the absolute date; the client swaps to relative time and refreshes each minute (spec §4). */
export function RelTime({ iso }: { iso: string }) {
  const [text, setText] = useState(iso.slice(0, 10));
  const [title, setTitle] = useState<string>();
  useEffect(() => {
    const tick = () => {
      setText(rel(iso));
      setTitle(full.format(new Date(iso)));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return (
    <time dateTime={iso} title={title}>
      {text}
    </time>
  );
}
