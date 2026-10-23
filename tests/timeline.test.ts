// Budgets from spec §9, checked against the pure schedule(). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { schedule, endOf, startFor, BOOT_END, type Spec } from "../src/lib/timeline.ts";

const p = (cmd: string): Spec => ({ k: "p", n: cmd.length });
const o = (n = 1): Spec => ({ k: "o", n });

// Home as the server builds it: 6 blocks.
const home: Spec[] = [
  p("figlet ankesh jaiswal"),
  { k: "f", n: 1 },
  p("cat intro.txt"),
  { k: "l", n: "Full-stack developer building fast, thoughtful web apps.".length },
  o(),
  o(),
  o(), // nudge
  p("ls ~/projects --featured"),
  o(2),
  p("ls ~"),
  o(),
  p("ls ~/links"),
  o(),
  p("stat --summary"),
  o(),
];
const about: Spec[] = [
  p("cat about.md"),
  o(),
  o(),
  o(),
  p("git log --oneline --graph"),
  o(3),
  p("cat now.txt"),
  o(),
];
const projects: Spec[] = [p("ls ~/projects"), o(2)];

test("boot matches the spec's moment table (full figlet)", () => {
  const s = schedule(home, "boot");
  assert.deepEqual(
    [s[0].t, s[1].t, s[1].d, s[2].t, s[3].t, s[3].d, s[7].t],
    [0, 100, 300, 400, 500, 300, 875],
  );
  assert.equal(endOf(home, s), 1400); // ≈ 1.40s
});

test("boot matches the spec's moment table (compact name)", () => {
  const s = schedule(home, "boot-compact");
  assert.deepEqual([s[1].d, s[2].t, s[3].t, s[7].t], [75, 175, 275, 650]);
  assert.equal(endOf(home, s), 1175); // ≈ 1.18s
});

test("boot never runs past the 1.5s hard end state", () => {
  const long = [...home, ...home, ...home];
  const s = schedule(long, "boot");
  for (const x of s) assert.ok(x.t + x.d <= BOOT_END, `${x.t}+${x.d}`);
});

test("first visit budgets: complete ≤ 830ms with a resize, ≤ 650ms without", () => {
  for (const page of [home, about, projects]) {
    const wide = schedule(page, "first", startFor(true));
    const narrow = schedule(page, "first", startFor(false));
    assert.ok(endOf(page, wide) <= 830, `with resize: ${endOf(page, wide)}`);
    assert.ok(endOf(page, narrow) <= 650, `without resize: ${endOf(page, narrow)}`);
  }
  // one-block tabs finish by 590ms
  assert.ok(endOf(projects, schedule(projects, "first", startFor(true))) <= 590);
});

test("first visit: only the first command types (≤150ms), later prompts are instant", () => {
  const s = schedule(about, "first", startFor(false));
  assert.ok(s[0].d > 0 && s[0].d <= 150);
  assert.equal(s[4].d, 0);
  assert.equal(s[6].d, 0);
});

test("return visit: complete ≤ 360ms with a resize, ≤ 180ms without", () => {
  for (const page of [home, about, projects]) {
    assert.ok(endOf(page, schedule(page, "return", startFor(true))) <= 360);
    assert.ok(endOf(page, schedule(page, "return", startFor(false))) <= 180);
    assert.ok(schedule(page, "return").every((x, i) => page[i].k !== "p" || x.d === 0));
  }
});

test("deep-link landing: prompts instant, output complete ≤ 200ms", () => {
  for (const page of [home, about, projects]) {
    const s = schedule(page, "land");
    assert.ok(endOf(page, s) <= 200, String(endOf(page, s)));
    assert.ok(s.every((x) => x.d === 0));
  }
});

test("command output: echo is instant, output streams ≤ 200ms", () => {
  const out = [p("help"), o(9)];
  const s = schedule(out, "echo");
  assert.equal(s[0].d, 0);
  assert.ok(endOf(out, s) <= 200);
});

test("the cursor lingers after a typed command until the next line starts", () => {
  const s = schedule(home, "boot");
  assert.equal(s[0].t + s[0].d + s[0].h, s[1].t);
});
