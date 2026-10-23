import type { Line as LineT } from "@/lib/lines";
import { schedule } from "@/lib/timeline";
import { slotVars, specOf } from "@/lib/reveal";
import { BufferRow } from "./BufferRow";
import { SessionLines } from "./SessionLines";

/** The vim-style buffer: gutter + lines + `~` fill (spec §6.3). Text is always real HTML. */
export function Buffer({ title, lines }: { title: string; lines: LineT[] }) {
  let lastPrompt = -1;
  lines.forEach((l, i) => {
    if (l.t === "prompt") lastPrompt = i;
  });

  // Timings for the two first-paint cases the server knows about (spec §9). The inline script in
  // <head> picks one by setting <html data-reveal>; the client handles tab changes itself.
  const specs = lines.map(specOf);
  const land = schedule(specs, "land");
  const isHome = lines.some((l) => l.t === "figlet");
  const boot = isHome ? schedule(specs, "boot") : null;
  const bootC = isHome ? schedule(specs, "boot-compact") : null;
  const lead = lines.find((l) => l.t === "lead");

  return (
    <div className="buf-scroll relative h-full overflow-y-auto overflow-x-hidden" tabIndex={-1}>
      {isHome && (
        <button type="button" className="skip-intro ylink text-[length:var(--fs-ui)]">
          skip intro <span aria-hidden>⏎</span>
        </button>
      )}
      {lead && (
        // type-fast only while the lead fits on one row; otherwise it streams (spec §9).
        <style>{`@container buf (max-width: ${lead.text.length * 12 + 80}px) { .rv-l .rv-lead { animation-duration: 0s !important; } }`}</style>
      )}
      <h1 className="sr-only">{title}</h1>
      <div className="flex min-h-full flex-col">
        {lines.map((l, i) => (
          <BufferRow
            key={i}
            line={l}
            n={i + 1}
            first={i === 0}
            latest={i === lastPrompt}
            spec={specs[i]}
            vars={{
              ...slotVars(land[i], "l"),
              ...(boot ? slotVars(boot[i], "b") : {}),
              ...(bootC ? slotVars(bootC[i], "c") : {}),
            }}
          />
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
