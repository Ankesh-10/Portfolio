import type { Inline } from "@/lib/lines";
import { Inlines } from "./Inline";

/** `help` output: four groups, each ≤ 4 rows (a continuation row has an empty group label). */
export function Help({ rows }: { rows: { group: string; cmds: Inline[]; desc: string }[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {rows.map((r, i) => (
        <li key={i} className="grid grid-cols-[14ch_1fr] gap-x-[2ch] max-[899px]:block">
          <span className="text-t3">{r.group}</span>
          <span className="text-t2">
            <Inlines parts={r.cmds} />
            {r.desc && <span className="text-t3"> — {r.desc}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
