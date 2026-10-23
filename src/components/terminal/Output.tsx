"use client";
import { useEffect, useRef } from "react";
import { Row } from "./Row";
import { useTerminal } from "./TerminalProvider";

/** Lines produced by commands the visitor runs, numbered after the page's own lines. */
export function Output({ base }: { base: number }) {
  const { entries } = useTerminal();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (entries.length) end.current?.scrollIntoView({ block: "end" });
  }, [entries.length]);
  return (
    <>
      {entries.map((l, i) => (
        <Row key={i} line={l} n={base + i + 1} />
      ))}
      <div ref={end} aria-hidden />
    </>
  );
}
