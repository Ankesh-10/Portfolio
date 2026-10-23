// Fails if a readable text token drops below 4.5:1 on any surface it sits on (spec §3, §15).
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const tok = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = (fg, a, bg) => fg.map((c, i) => c * a + bg[i] * (1 - a));

const bg = hex(tok("bg"));
const tex = hex(tok("tex-2"));
const surfaces = {
  "--bg": bg,
  "terminal over texture": over([9, 9, 9], 0.72, tex),
  chrome: over([14, 14, 14], 0.92, bg),
  "card (#151515)": hex("#151515"),
};
let bad = 0;
for (const t of ["text-1", "text-2", "text-3"]) {
  const fg = hex(tok(t));
  for (const [name, s] of Object.entries(surfaces)) {
    const r = ratio(fg, s);
    const ok = r >= 4.5;
    if (!ok) bad++;
    console.log(`${ok ? "ok  " : "FAIL"} --${t} on ${name}: ${r.toFixed(2)}:1`);
  }
}
process.exit(bad ? 1 : 0);
