"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOutput } from "@/lib/session";
import { schedule } from "@/lib/timeline";
import { slotVars, specOf } from "@/lib/reveal";
import { BufferRow } from "./BufferRow";

/** Output of commands run on this tab, numbered on from the page's own lines. */
export function SessionLines({ start }: { start: number }) {
  const lines = useOutput(usePathname());
  const end = useRef<HTMLDivElement>(null);
  let latest = -1;
  lines.forEach((l, i) => {
    if (l.t === "prompt") latest = i;
  });
  // `echo` (spec §9): each command's block is timed from when it is inserted: the prompt at once,
  // then its output streams. Rows already shown keep their finished animation.
  const specs = lines.map(specOf);
  const slots: ReturnType<typeof schedule> = [];
  let blockStart = 0;
  lines.forEach((l, i) => {
    if (i > 0 && l.t === "prompt") blockStart = i;
    const next = lines.findIndex((x, j) => j > i && x.t === "prompt");
    if (i === blockStart)
      slots.push(...schedule(specs.slice(i, next === -1 ? undefined : next), "echo"));
  });

  // Keep the newest output in view, like a terminal.
  useEffect(() => {
    const box = end.current?.closest(".buf-scroll");
    if (lines.length && box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  return (
    <div data-rv="echo" className="contents">
      {lines.map((l, i) => (
        <BufferRow
          key={i}
          line={l}
          n={start + i + 1}
          first={false}
          latest={i === latest}
          session
          spec={specs[i]}
          vars={slotVars(slots[i])}
        />
      ))}
      <div ref={end} aria-hidden />
    </div>
  );
}
