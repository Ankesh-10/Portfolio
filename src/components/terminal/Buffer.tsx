import type { Line as LineT } from "@/lib/lines";
import { Line, gutterLh } from "./Line";

/** Hidden on phones (spec §12): the figlet name and its prompt; the phone header shows the name instead. */
const phoneHidden = (lines: LineT[], i: number) =>
  lines[i].t === "figlet" || (lines[i].t === "prompt" && lines[i + 1]?.t === "figlet");

/** The vim-style buffer: gutter + lines + `~` fill (spec §6.3). Text is always real HTML. */
export function Buffer({ title, lines }: { title: string; lines: LineT[] }) {
  let lastPrompt = -1;
  lines.forEach((l, i) => {
    if (l.t === "prompt") lastPrompt = i;
  });

  return (
    <div className="buf-scroll h-full overflow-y-auto overflow-x-hidden" tabIndex={-1}>
      <h1 className="sr-only">{title}</h1>
      <div className="buf-lines flex min-h-full flex-col">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`buf-row grid grid-cols-[48px_1fr] pr-6 max-md:grid-cols-[36px_1fr] max-md:pr-4 ${phoneHidden(lines, i) ? "ph-hide" : ""} ${l.t === "prompt" && i > 0 ? "mt-2" : ""}`}
          >
            <span
              aria-hidden
              className={`buf-ln select-none pr-3 text-right text-[length:var(--fs-ui)] tabular-nums max-md:pr-3 ${i === lastPrompt ? "text-t3" : "text-t5"}`}
              style={{ lineHeight: `${gutterLh(l)}px` }}
            />
            <div className="min-w-0">
              <Line line={l} />
            </div>
          </div>
        ))}
        <div aria-hidden className="ph-hide relative mt-1 min-h-0 flex-1">
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
