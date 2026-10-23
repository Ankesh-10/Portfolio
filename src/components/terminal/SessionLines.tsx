"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOutput } from "@/lib/session";
import { BufferRow } from "./BufferRow";

/** Output of commands run on this tab, numbered on from the page's own lines. */
export function SessionLines({ start }: { start: number }) {
  const lines = useOutput(usePathname());
  const end = useRef<HTMLDivElement>(null);
  let latest = -1;
  lines.forEach((l, i) => {
    if (l.t === "prompt") latest = i;
  });

  // Keep the newest output in view, like a terminal.
  useEffect(() => {
    const box = end.current?.closest(".buf-scroll");
    if (lines.length && box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  return (
    <>
      {lines.map((l, i) => (
        <BufferRow key={i} line={l} n={start + i + 1} first={false} latest={i === latest} session />
      ))}
      <div ref={end} aria-hidden />
    </>
  );
}
