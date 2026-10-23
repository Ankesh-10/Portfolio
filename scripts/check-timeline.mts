// Checks schedule() against the budgets in spec §9. Run: npm run check:timeline
import { schedule, endOf, HARD_END } from "../src/lib/timeline.ts";
import type { Info } from "../src/lib/timeline.ts";

const P: Info = { kind: "prompt", chars: 12, rows: 1 };
const L: Info = { kind: "line", chars: 0, rows: 1 };
const block = (lines: number): Info[] => [P, ...Array.from({ length: lines }, () => L)];

// Home: figlet block, intro (lead + 2 text + nudge), featured (2), ls ~, ls ~/links, stat → 6 blocks.
const home: Info[] = [
  { ...P, chars: 21 },
  { kind: "figlet", chars: 0, rows: 12 },
  { ...P, chars: 13 },
  { kind: "lead", chars: 56, rows: 1 },
  L,
  L,
  L,
  ...block(2),
  { ...P, chars: 4 },
  L,
  ...block(1),
  ...block(1),
];
const spec = { about: [3, 1, 1], skills: [1, 1], projects: [1], certs: [1], contact: [1] } as const;
const tab = (blocks: readonly number[]) => blocks.flatMap((n) => block(n));

let bad = 0;
const check = (name: string, got: number, max: number, min = 0) => {
  const ok = got <= max && got >= min;
  if (!ok) bad++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${name}: ${Math.round(got)}ms (budget ≤ ${max}${min ? `, ≥ ${min}` : ""})`,
  );
};

const bootP = schedule(home, "bootPhone");
check("phone boot complete (≈0.6s)", endOf(bootP), 700, 450);
check("phone lead is instant at first paint", bootP[3].t + bootP[3].d, 0);

check("boot, compact name", endOf(schedule(home, "boot", { compact: true })), 1260, 1100);
check("boot, full figlet", endOf(schedule(home, "boot", { compact: false })), 1480, 1300);
const bootC = schedule(home, "boot", { compact: true });
check("boot nudge visible (compact, ≈650)", bootC[6].t + 25, 700, 600);
check("boot lead starts (compact, 275)", bootC[3].t, 290, 260);
check("boot never past hard end", Math.max(...bootC.map((x) => x.t + x.d)), HARD_END);

for (const [name, b] of Object.entries(spec)) {
  const lines = tab(b);
  check(
    `${name} first visit, width change`,
    endOf(schedule(lines, "first", { widthChange: true })),
    b.length >= 3 ? 830 : b.length === 2 ? 830 : 590,
  );
  check(
    `${name} first visit, same width`,
    endOf(schedule(lines, "first")),
    (b.length >= 2 ? 830 : 590) - 180,
  );
  check(
    `${name} return visit, width change`,
    endOf(schedule(lines, "return", { widthChange: true })),
    360,
  );
  check(`${name} return visit, same width`, endOf(schedule(lines, "return")), 180);
  check(`${name} deep-link landing`, endOf(schedule(lines, "landing")), 200);
}
check("home outside boot, first visit", endOf(schedule(home, "first", { widthChange: true })), 830);
check("home outside boot, return", endOf(schedule(home, "return", { widthChange: true })), 360);
check("home landing", endOf(schedule(home, "landing")), 200);
process.exit(bad ? 1 : 0);
