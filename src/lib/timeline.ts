import type { Line } from "./lines";

// Pure scheduler for the terminal text appearance modes (spec §9). No React, no DOM, no path aliases,
// so it runs on the server (boot / landing vars), in the browser (tab changes, command output) and in
// scripts/check-timeline.mts. Times are in ms from the start of the animation.

export type Mode = "type" | "type-fast" | "stream" | "draw";
export type Visit = "boot" | "bootPhone" | "first" | "return" | "landing" | "echo";

/** What the scheduler needs to know about one logical line. */
export type Info = { kind: "prompt" | "figlet" | "lead" | "line"; chars: number; rows: number };
export type Timing = { t: number; d: number; mode: Mode; n: number; rs: number };

export const HARD_END = 1500; // every line is visible by 1.5s after first paint (spec §9)
const TYPE_MS = 22; // 18–28ms per character
const TYPE_FAST_MS = 6;
const ROW_MS = 25; // draw: per figlet row

export function infoOf(line: Line): Info {
  switch (line.t) {
    case "prompt":
      return { kind: "prompt", chars: line.cmd.length, rows: 1 };
    case "figlet":
      return { kind: "figlet", chars: 0, rows: 12 };
    case "lead":
      return { kind: "lead", chars: line.text.length, rows: 1 };
    default:
      return { kind: "line", chars: 0, rows: 1 };
  }
}

type Opts = { widthChange?: boolean; compact?: boolean };

export function schedule(infos: Info[], visit: Visit, opts: Opts = {}): Timing[] {
  const out: Timing[] = infos.map(() => ({ t: 0, d: 0, mode: "stream", n: 0, rs: ROW_MS }));
  // Blocks start at each prompt line (the figlet belongs to the first one).
  const blocks: number[][] = [];
  infos.forEach((inf, i) => {
    if (inf.kind === "prompt" || !blocks.length) blocks.push([]);
    blocks[blocks.length - 1].push(i);
  });
  const outputLines = (b: number[]) => b.filter((i) => infos[i].kind !== "prompt").length;

  // Start offset: clear 0–60, then the width tween gap 60–240 only if the width changes (§9 timelines).
  let t = visit === "first" || visit === "return" ? (opts.widthChange ? 240 : 60) : 0;

  // Per-line stream step for each visit kind.
  const total = blocks.reduce((a, b) => a + outputLines(b), 0);
  const laterTotal = blocks.slice(1).reduce((a, b) => a + outputLines(b), 0);
  const stepFor = (bi: number, b: number[]) => {
    const n = Math.max(1, outputLines(b));
    switch (visit) {
      case "boot":
      case "echo":
        return Math.min(25, 200 / n); // 25ms per line, ≤ 200ms per block
      case "bootPhone":
        return bi <= 1 ? 15 : Math.min(25, 200 / n); // intro lines stream at 15ms (spec §12)
      case "first":
        return bi === 0 ? Math.min(25, 200 / n) : Math.min(12, 240 / Math.max(1, laterTotal));
      case "return":
        return Math.min(12, 120 / Math.max(1, total));
      case "landing":
        return Math.min(12, 200 / Math.max(1, total));
    }
  };
  const typed = (bi: number) => visit === "boot" || (visit === "first" && bi === 0);
  const cap = visit === "boot" ? 100 : 150;

  // Phone boot (spec §12): the name lives in the header, so the figlet block is hidden and takes no time; the
  // `cat intro.txt` prompt and the lead line are instant (the lead is the LCP); later prompts only pass time.
  const phone = visit === "bootPhone";
  const hasFiglet = (b: number[]) => b.some((i) => infos[i].kind === "figlet");
  blocks.forEach((b, bi) => {
    const step = stepFor(bi, b);
    if (phone && hasFiglet(b)) {
      for (const i of b) Object.assign(out[i], { t: 0, d: 0, mode: "stream" });
      return;
    }
    for (const i of b) {
      const inf = infos[i];
      const o = out[i];
      if (phone && inf.kind === "prompt") {
        const d = Math.min(100, inf.chars * TYPE_MS);
        Object.assign(o, { t, d: 0, mode: "stream" });
        if (bi > 1) t += d;
      } else if (phone && inf.kind === "lead") {
        Object.assign(o, { t, d: 0, mode: "stream" });
      } else if (inf.kind === "prompt") {
        if (typed(bi)) {
          const d = Math.min(cap, inf.chars * TYPE_MS);
          Object.assign(o, { t, d, mode: "type", n: inf.chars });
          t += d;
        } else Object.assign(o, { t, d: 0, mode: "stream" }); // instant: appears with its block
      } else if (inf.kind === "figlet" && (visit === "boot" || visit === "first")) {
        const rows = opts.compact ? 3 : inf.rows;
        const rs = visit === "boot" ? ROW_MS : 6;
        Object.assign(o, { t, d: rows * rs, mode: "draw", rs });
        t += rows * rs;
      } else if (inf.kind === "lead" && visit === "boot") {
        const d = Math.min(300, inf.chars * TYPE_FAST_MS);
        Object.assign(o, { t, d, mode: "type-fast", n: inf.chars });
        t += d;
      } else {
        Object.assign(o, { t, d: 0, mode: "stream" });
        t += step;
      }
    }
  });

  // Hard end state: clamp every line so t + d ≤ 1500ms.
  for (const o of out) o.t = Math.max(0, Math.min(o.t, HARD_END - o.d));
  return out;
}

export const endOf = (ts: Timing[]) => ts.reduce((m, x) => Math.max(m, x.t + x.d), 0);
