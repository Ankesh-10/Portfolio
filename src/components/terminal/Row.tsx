import type { CSSProperties } from "react";
import type { Line as LineT } from "@/lib/lines";
import type { Info, Timing } from "@/lib/timeline";
import { Line, gutterLh } from "./Line";

export type RowTiming = {
  landing?: Timing; // deep-link landing (inert unless <html data-landing>)
  boot?: { c: Timing; f: Timing }; // home only: compact and full-figlet boot schedules
  echo?: Timing; // output of a command the visitor ran
};

const ms = (n: number) => `${Math.round(n * 10) / 10}ms`;

/** One numbered buffer line (gutter + content). Timings become CSS custom properties; CSS does the reveal. */
export function Row({
  line,
  n,
  info,
  timing,
}: {
  line: LineT;
  n: number;
  info?: Info;
  timing?: RowTiming;
}) {
  const prompt = line.t === "prompt";
  const style: Record<string, string | number> = { marginTop: prompt && n > 1 ? 8 : 0 };
  const L = timing?.landing;
  if (L) Object.assign(style, { "--tl": ms(L.t), "--dl": ms(L.d), "--n": L.n, "--rs": ms(L.rs) });
  const B = timing?.boot;
  if (B)
    Object.assign(style, {
      "--tc": ms(B.c.t),
      "--dc": ms(B.c.d),
      "--tf": ms(B.f.t),
      "--df": ms(B.f.d),
      "--n": B.c.n,
      "--rs": ms(B.c.rs),
    });
  const E = timing?.echo;
  if (E) Object.assign(style, { "--t": ms(E.t), "--d": ms(E.d), "--n": E.n, "--rs": ms(E.rs) });
  const mode = E?.mode ?? B?.c.mode ?? L?.mode;

  return (
    <div
      data-prompt={prompt || undefined}
      data-kind={info?.kind}
      data-chars={info?.chars}
      data-mode={mode}
      data-pair={B ? "" : undefined}
      data-echo={E ? "" : undefined}
      className="buf-row grid grid-cols-[48px_1fr] pr-6 max-md:grid-cols-[32px_1fr] max-md:pr-4"
      style={style as CSSProperties}
    >
      <span
        aria-hidden
        className="buf-gut select-none pr-3 text-right text-[length:var(--fs-ui)]"
        style={{ lineHeight: `${gutterLh(line)}px` }}
      >
        {n}
      </span>
      <div className="buf-cnt min-w-0">
        <Line line={line} />
      </div>
    </div>
  );
}
