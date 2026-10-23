import type { Inline } from "@/lib/lines";
import { Inlines } from "./Inline";

type KV = { k: string; v: Inline[] };

/** Expanded project (spec §7.2): rule, paragraph, key/value rows. */
export function Detail({ title, body, rows }: { title: string; body: string; rows: KV[] }) {
  return (
    <div>
      <div aria-hidden className="overflow-hidden whitespace-nowrap text-t4">
        {`── ${title} ${"─".repeat(80)}`}
      </div>
      <p className="m-0 max-w-[70ch] text-t2">{body}</p>
      <Kv rows={rows} />
    </div>
  );
}

export function Kv({ rows }: { rows: KV[] }) {
  return (
    <dl className="m-0">
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[10ch_1fr]">
          <dt className="text-t3">{r.k}</dt>
          <dd className="m-0 text-t2">
            <Inlines parts={r.v} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
