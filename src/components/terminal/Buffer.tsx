import type { Line as LineT } from "@/lib/lines";
import { Line, gutterLh } from "./Line";
import { ScrollArea } from "./ScrollArea";

/** The vim-style buffer: gutter + lines + `~` fill (spec §6.3). Text is always real HTML. */
export function Buffer({ title, lines }: { title: string; lines: LineT[] }) {
  let lastPrompt = -1;
  lines.forEach((l, i) => {
    if (l.t === "prompt") lastPrompt = i;
  });

  return (
    <ScrollArea>
      <h1 className="sr-only">{title}</h1>
      <div className="flex min-h-full flex-col">
        {lines.map((l, i) => (
          <div
            key={i}
            data-ln={i + 1}
            className="grid grid-cols-[48px_1fr] pr-6 max-md:grid-cols-[32px_1fr] max-md:pr-4"
            style={{ marginTop: l.t === "prompt" && i > 0 ? 8 : 0 }}
          >
            <span
              aria-hidden
              className={`tnum select-none pr-3 text-right text-[length:var(--fs-ui)] ${i === lastPrompt ? "text-t3" : "text-t5"}`}
              style={{ lineHeight: `${gutterLh(l)}px` }}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <Line line={l} />
            </div>
          </div>
        ))}
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
    </ScrollArea>
  );
}
