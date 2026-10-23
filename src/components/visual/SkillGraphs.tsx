"use client";
import type { SkillGroup } from "@/content/types";
import type { GithubStats } from "@/lib/github";

const EIGHTHS = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];
/** `████████▌` — 10 cells, one per 10 points, with eighth-block partials. */
function blocks(v: number) {
  const full = Math.floor(v / 10);
  const part = EIGHTHS[Math.round(((v % 10) / 10) * 8)] ?? "";
  return "█".repeat(full) + part;
}

// Heatmap levels carry data: every non-empty level is ≥ 3:1 on --bg (spec §3).
const LEVELS = ["", "#5e5e5e", "#808080", "#a8a8a8", "#f5f5f5"];
const LANG_GREYS = ["#f5f5f5", "#a8a8a8", "#808080", "#5e5e5e", "#3a3a3a"];

function level(n: number, max: number) {
  if (!n) return 0;
  return Math.min(4, Math.ceil((n / max) * 4));
}

const fmt = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

/** Skills tab (spec §7.3): self-rated bars in block characters, the GitHub contribution heatmap
 *  and the language split. Hovering or focusing a skill in the tree highlights its bar. */
export function SkillGraphs({
  skills,
  github,
  active,
}: {
  skills: SkillGroup[];
  github: GithubStats | null;
  active: string | undefined;
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-6 overflow-y-auto p-8 text-[length:var(--fs-ui)] leading-5">
      <section aria-label="Skill levels, self-rated">
        {skills
          .filter((g) => g.items.some((i) => i.level != null))
          .map((g) => (
            <div key={g.group} className="mb-2">
              <h3 className="m-0 text-[length:var(--fs-label)] font-normal uppercase tracking-[.14em] text-t3">
                {g.group}
              </h3>
              <ul className="m-0 list-none p-0">
                {g.items
                  .filter((i) => i.level != null)
                  .map((i) => {
                    const on = i.name === active;
                    return (
                      <li
                        key={i.name}
                        className={`grid grid-cols-[12ch_10ch_3ch] gap-x-[1ch] ${on ? "text-t1" : "text-t2"}`}
                      >
                        <span className={on ? "font-bold" : ""}>{i.name}</span>
                        <span aria-hidden className={on ? "text-t1" : "text-t3"}>
                          {blocks(i.level!)}
                        </span>
                        <span className="text-right">
                          {i.level}
                          <span className="sr-only"> out of 100</span>
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
      </section>
      {github ? (
        <Github stats={github} />
      ) : (
        <p className="m-0 text-t3"># github stats unavailable right now</p>
      )}
    </div>
  );
}

function Github({ stats }: { stats: GithubStats }) {
  const max = Math.max(1, ...stats.weeks.flatMap((w) => w.days));
  const totals = stats.weeks.map((w) => w.days.reduce((a, b) => a + b, 0));
  const busiest = totals.indexOf(Math.max(...totals));
  const n = stats.weeks.length;
  return (
    <section aria-label="GitHub activity" className="flex flex-col gap-4">
      <div>
        <h3 className="m-0 mb-1 text-[length:var(--fs-label)] font-normal uppercase tracking-[.14em] text-t3">
          contributions · {n} weeks
        </h3>
        <p className="sr-only">
          {stats.total} contributions in the last {n} weeks, busiest week: week of{" "}
          {fmt(stats.weeks[busiest].start)} with {totals[busiest]}.
        </p>
        {/* Solid --bg plate so the level contrasts hold on every surface (spec §3). */}
        <div aria-hidden className="inline-flex gap-[2px] bg-bg p-2">
          {stats.weeks.map((w, wi) => (
            <div
              key={w.start}
              className="flex flex-col gap-[2px]"
              style={
                wi === n - 1 ? { outline: "1px solid var(--text-1)", outlineOffset: 1 } : undefined
              }
            >
              {w.days.map((d, di) => {
                const l = level(d, max);
                return (
                  <span
                    key={di}
                    className="block h-[10px] w-[10px]"
                    style={
                      l ? { background: LEVELS[l] } : { boxShadow: "inset 0 0 0 1px var(--line-3)" }
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
        <p className="m-0 text-t3">
          {stats.total} contributions · {fmt(stats.weeks[0].start)} – now
        </p>
      </div>
      {stats.langs.length > 0 && (
        <div>
          <h3 className="m-0 mb-1 text-[length:var(--fs-label)] font-normal uppercase tracking-[.14em] text-t3">
            languages
          </h3>
          <div aria-hidden className="flex h-2 w-full gap-px">
            {stats.langs.map((l, i) => (
              <span key={l.name} style={{ width: `${l.pct}%`, background: LANG_GREYS[i] }} />
            ))}
          </div>
          <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-[2ch] p-0 text-t2">
            {stats.langs.map((l, i) => (
              <li key={l.name}>
                <span aria-hidden style={{ color: LANG_GREYS[i] }}>
                  ■{" "}
                </span>
                {l.name.toLowerCase()} {Math.round(l.pct)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
