import type { Line as LineT } from "@/lib/lines";
import { infoOf, schedule } from "@/lib/timeline";
import { Row } from "./Row";
import { Output } from "./Output";
import { Reveal } from "./Reveal";

/**
 * The vim-style buffer: gutter + lines + command output + `~` fill (spec §6.3).
 * Text is always real HTML. The reveal schedule is emitted as CSS variables (spec §9); it is inert
 * unless <html data-boot> / <html data-landing> is set by the inline script, or a client tab change
 * adds `.buf-reveal`.
 */
export function Buffer({ title, lines, boot }: { title: string; lines: LineT[]; boot?: boolean }) {
  const infos = lines.map(infoOf);
  const landing = schedule(infos, "landing");
  const bootC = boot ? schedule(infos, "boot", { compact: true }) : undefined;
  const bootF = boot ? schedule(infos, "boot", { compact: false }) : undefined;
  const lead = lines.find((l) => l.t === "lead");
  // The lead types in one row only if it fits; below this width it streams instead (spec §9 type-fast).
  const leadFit = lead && lead.t === "lead" ? Math.ceil(lead.text.length * 12.1 + 72) : 0;

  return (
    <div className="buf-scroll h-full overflow-y-auto overflow-x-hidden" tabIndex={-1}>
      {boot && (
        <>
          <button type="button" className="skip-intro ylink">
            skip intro <span aria-hidden>⏎</span>
          </button>
          <style>{`@container buf (max-width:${leadFit}px){html[data-boot] .buf-row[data-kind="lead"] .rv-type{animation:none!important;display:inline!important;width:auto!important}html[data-boot] .buf-row[data-kind="lead"] .rv-cur::after{animation:none!important}html[data-boot] .buf-row[data-kind="lead"] .buf-cnt{animation:rv-in 1ms linear var(--t) both}}`}</style>
        </>
      )}
      <h1 className="sr-only">{title}</h1>
      <Reveal>
        {lines.map((l, i) => (
          <Row
            key={i}
            line={l}
            n={i + 1}
            info={infos[i]}
            timing={{
              landing: landing[i],
              boot: bootC && bootF ? { c: bootC[i], f: bootF[i] } : undefined,
            }}
          />
        ))}
        <Output base={lines.length} />
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
      </Reveal>
    </div>
  );
}
