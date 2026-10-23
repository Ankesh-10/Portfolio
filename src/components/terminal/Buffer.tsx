import type { Line as LineT } from "@/lib/lines";
import { BufferRow } from "./BufferRow";
import { SessionLines } from "./SessionLines";

/** The vim-style buffer: gutter + lines + `~` fill (spec §6.3). Text is always real HTML. */
export function Buffer({ title, lines }: { title: string; lines: LineT[] }) {
  let lastPrompt = -1;
  lines.forEach((l, i) => {
    if (l.t === "prompt") lastPrompt = i;
  });

  return (
    <div className="buf-scroll h-full overflow-y-auto overflow-x-hidden" tabIndex={-1}>
      <h1 className="sr-only">{title}</h1>
      <div className="flex min-h-full flex-col">
        {lines.map((l, i) => (
          <BufferRow key={i} line={l} n={i + 1} first={i === 0} latest={i === lastPrompt} />
        ))}
        <SessionLines start={lines.length} />
        <div aria-hidden className="relative mt-1 min-h-0 flex-1">
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="grid h-6 grid-cols-[48px_1fr] leading-6 max-md:grid-cols-[32px_1fr]"
              >
                <span />
                <span className="text-t6">~</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
