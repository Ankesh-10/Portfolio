"use client";
import { skills } from "@/content/skills";
import { useVisual } from "./VisualContext";
import type { GithubStats } from "@/lib/github";

const LEVELS = ["#5e5e5e", "#808080", "#a8a8a8", "#f5f5f5"]; // spec §3 heatmap levels, all ≥ 3:1 on --bg
const SHADES = ["#f5f5f5", "#a8a8a8", "#808080", "#5e5e5e", "#3a3a3a"];

/** Block-character bar: 10 cells, half-block for the remainder. `████████▌` */
function bar(level: number) {
  const cells = level / 10;
  const full = Math.floor(cells);
  return "█".repeat(full) + (cells - full >= 0.5 ? "▌" : "");
}

function Heatmap({ gh }: { gh: GithubStats }) {
  const flat = gh.weeks
    .flat()
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const q = (p: number) => flat[Math.min(flat.length - 1, Math.floor(flat.length * p))] ?? 1;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  const level = (n: number) =>
    n === 0 ? -1 : n <= cuts[0] ? 0 : n <= cuts[1] ? 1 : n <= cuts[2] ? 2 : 3;
  const weekSums = gh.weeks.map((w) => w.reduce((a, b) => a + b, 0));
  const busiest = weekSums.indexOf(Math.max(...weekSums));
  const start = new Date(gh.firstWeekStart);
  start.setDate(start.getDate() + busiest * 7);
  const label = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <figure className="m-0">
      <div className="inline-block bg-bg p-2">
        <div aria-hidden className="flex gap-[2px]">
          {gh.weeks.map((w, wi) => (
            <div
              key={wi}
              className={`flex flex-col gap-[2px] ${wi < gh.weeks.length - 12 ? "max-md:hidden" : ""}`}
              // the current (last) week is outlined in text-1; red stays reserved for availability
              style={
                wi === gh.weeks.length - 1
                  ? { outline: "1px solid var(--text-1)", outlineOffset: 1 }
                  : undefined
              }
            >
              {w.map((n, di) => {
                const l = level(n);
                return (
                  <span
                    key={di}
                    className="block h-[9px] w-[9px] rounded-[1px] max-md:h-[14px] max-md:w-[14px]"
                    style={{
                      background: l < 0 ? "transparent" : LEVELS[l],
                      boxShadow: l < 0 ? "inset 0 0 0 1px var(--line-3)" : undefined,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="sr-only">
        {gh.total} contributions in the last {gh.weeks.length} weeks, busiest week starting {label}.
      </figcaption>
    </figure>
  );
}

function Languages({ gh }: { gh: GithubStats }) {
  if (!gh.languages.length) return null;
  return (
    <div>
      <div aria-hidden className="flex h-2 w-full overflow-hidden rounded-sm">
        {gh.languages.map((l, i) => (
          <span key={l.name} style={{ width: `${l.pct}%`, background: SHADES[i] }} />
        ))}
      </div>
      <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-4 p-0 text-[length:var(--fs-ui)] leading-5 text-t2">
        {gh.languages.map((l, i) => (
          <li key={l.name}>
            <span aria-hidden style={{ color: SHADES[i] }}>
              ■{" "}
            </span>
            {l.name} <span className="text-t3">{l.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Skills: self-rated bars + GitHub heatmap + language split, all monochrome (spec §7.3). */
export function SkillGraphs({ gh }: { gh: GithubStats | null }) {
  const { hot } = useVisual();
  const rated = skills.flatMap((g) => g.items.filter((i) => i.level !== undefined));
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-6 text-[length:var(--fs-ui)] leading-5">
      <section aria-label="Skill levels">
        <h3 className="m-0 mb-2 text-[length:var(--fs-label)] font-normal uppercase tracking-[.14em] text-t3">
          Skill levels
        </h3>
        <ul className="m-0 list-none p-0">
          {rated.map((s) => {
            const on = hot?.group === "skill" && hot.id === s.name;
            return (
              <li
                key={s.name}
                className={`flex items-center gap-3 border-l-2 pl-2 ${on ? "border-t1 text-t1" : "border-transparent text-t2"}`}
              >
                <span className="w-[12ch] shrink-0">{s.name}</span>
                <span aria-hidden className="w-[10ch] whitespace-pre text-t1">
                  {bar(s.level!)}
                </span>
                <span className="text-t3">
                  {s.level}
                  <span className="sr-only"> out of 100</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      {gh ? (
        <>
          <section aria-label="GitHub contributions">
            <h3 className="m-0 mb-2 text-[length:var(--fs-label)] font-normal uppercase tracking-[.14em] text-t3">
              GitHub · last {gh.weeks.length} weeks
            </h3>
            <Heatmap gh={gh} />
          </section>
          <section aria-label="Languages">
            <h3 className="m-0 mb-2 text-[length:var(--fs-label)] font-normal uppercase tracking-[.14em] text-t3">
              Languages
            </h3>
            <Languages gh={gh} />
          </section>
        </>
      ) : (
        <p className="m-0 text-t3"># github stats unavailable right now</p>
      )}
    </div>
  );
}
