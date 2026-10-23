"use client";
import { useEffect, useRef } from "react";
import { Row } from "./Row";
import { useTerminal } from "./TerminalProvider";

/** Lines produced by commands the visitor runs, numbered after the page's own lines. */
export function Output({ base }: { base: number }) {
  const { entries } = useTerminal();
  const last = useRef<HTMLDivElement>(null);
  // aria-busy while a command's output prints (spec §9 "Assistive tech"); the live region announces it once.
  useEffect(() => {
    const scroller = last.current?.closest(".buf-scroll");
    const live = entries.some((e) => e.timing);
    scroller?.setAttribute("aria-busy", String(live));
  }, [entries]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (entries.length) end.current?.scrollIntoView({ block: "end" });
  }, [entries.length]);
  return (
    <>
      {entries.map((e, i) => (
        <Row
          key={i}
          line={e.line}
          n={base + i + 1}
          timing={e.timing ? { echo: e.timing } : undefined}
        />
      ))}
      <div ref={end} aria-hidden />
      <div ref={last} aria-hidden />
    </>
  );
}
