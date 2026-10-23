// Terminal text timelines (spec §9). One pure function gives every buffer line a start time and a
// duration; the server emits them as CSS custom properties for the boot and deep-link landing, and
// the client uses the same function for tab changes and command output. CSS does the reveal.
// No imports, so `node --test` can run it directly.

/** p = prompt (types), f = figlet (draws), l = lead (type-fast in the boot), o = output (streams). */
export type Kind = "p" | "f" | "l" | "o";
/** `n`: characters for p and l, logical sub-lines (list rows) for o. */
export type Spec = { k: Kind; n: number };
export type Visit = "boot" | "boot-compact" | "land" | "first" | "return" | "echo";
/** t = start, d = duration, s = step between sub-lines, h = how long the cursor lingers after a prompt (ms). */
export type Slot = { t: number; d: number; s: number; h: number };

export const BOOT_END = 1500; // hard end state: everything visible by 1.5s after first paint
export const CLEAR = 60; // `clear` hold before new output on a tab change
export const GAP = 180; // visual-area width tween, only when the width changes

const typeMs = (n: number, cap: number) => Math.min(n * 25, cap); // 25ms/char (spec: 18–28)
/** Lines a spec streams as: list rows for output, one for a figlet or lead printed as output. */
const count = (l: Spec) => (l.k === "o" ? Math.max(1, l.n) : 1);

/** When a tab change starts printing: after `clear`, plus the width tween if the width changes. */
export const startFor = (widthChanges: boolean) => CLEAR + (widthChanges ? GAP : 0);

export function schedule(lines: Spec[], visit: Visit, start = 0): Slot[] {
  const boot = visit === "boot" || visit === "boot-compact";
  const slots: Slot[] = [];
  let t = start;

  // Output lines per block (a block = a prompt and the outputs that follow it).
  const blocks: number[] = [];
  for (const l of lines) {
    if (l.k === "p" || !blocks.length) blocks.push(0);
    // In the boot the figlet draws and the lead types on their own clocks; elsewhere they stream.
    if (l.k !== "p") blocks[blocks.length - 1] += boot ? (l.k === "o" ? count(l) : 0) : count(l);
  }

  // Per-line step for streamed output, from the visit's rate and cap.
  let block = -1;
  const laterLines = blocks.slice(1).reduce((a, b) => a + b, 0);
  const allLines = blocks.reduce((a, b) => a + b, 0);
  const stepFor = (b: number) => {
    if (boot || visit === "echo") return Math.min(25, 200 / Math.max(1, blocks[b]));
    if (visit === "land") return Math.min(25, 200 / Math.max(1, allLines));
    if (visit === "return") return Math.min(12, 120 / Math.max(1, allLines));
    // first visit: the first block streams at 25ms/line (≤200ms), later blocks 12ms/line (≤240ms combined)
    return b === 0
      ? Math.min(25, 200 / Math.max(1, blocks[0]))
      : Math.min(12, 240 / Math.max(1, laterLines));
  };

  lines.forEach((l, i) => {
    if (l.k === "p" || i === 0) block++;
    const step = stepFor(block);
    let d = 0;
    if (l.k === "p") {
      // Commands type: always in the boot, only the first block's on a first visit; otherwise instant.
      if (boot) d = typeMs(l.n, 100);
      else if (visit === "first" && block === 0) d = typeMs(l.n, 150);
    } else if (boot && l.k === "f") d = visit === "boot" ? 300 : 75;
    else if (boot && l.k === "l") d = Math.min(l.n * 6, 300);
    const lineSteps = l.k === "p" ? 0 : boot && l.k !== "o" ? 0 : count(l);
    const s = Math.round(step * 100) / 100;
    slots.push({ t: Math.round(t), d: Math.round(d), s, h: 0 });
    t += d + lineSteps * step;
  });

  // The cursor lingers after a typed command until the next line starts.
  slots.forEach((sl, i) => {
    if (lines[i].k === "p" && sl.d > 0)
      sl.h = Math.max(0, (slots[i + 1]?.t ?? sl.t + sl.d) - sl.t - sl.d);
  });

  if (boot)
    for (const sl of slots) {
      sl.t = Math.min(sl.t, BOOT_END - sl.d);
      sl.h = Math.min(sl.h, BOOT_END - sl.t - sl.d);
    }
  return slots;
}

/** Where the write cursor ends: each streamed line holds its step, like the spec's timeline tables. */
export function endOf(lines: Spec[], slots: Slot[]): number {
  return Math.round(
    Math.max(
      0,
      ...slots.map((s, i) => s.t + s.d + (lines[i].k === "p" ? 0 : count(lines[i]) * s.s)),
    ),
  );
}
