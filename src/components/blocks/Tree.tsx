import { HotTarget } from "../visual/VisualContext";

// Real <ul>; tree glyphs are decorative (aria-hidden) and never repeat on continuation rows.
export function Tree({
  label,
  rows,
  hotItems = [],
}: {
  label: string;
  rows: { key: string; items: string[] }[];
  hotItems?: string[];
}) {
  return (
    <div>
      <div className="text-t1">{label}</div>
      <ul className="m-0 list-none p-0">
        {rows.map((r, i) => (
          <li key={r.key} className="grid grid-cols-[3ch_13ch_1fr]">
            <span aria-hidden className="text-t4">
              {i === rows.length - 1 ? "└─" : "├─"}
            </span>
            <span className="text-t3">{r.key}</span>
            <span className="text-t2">
              {r.items.map((it, j) => (
                <span key={it}>
                  {j > 0 && (
                    <span aria-hidden className="text-t4">
                      {" "}
                      ·{" "}
                    </span>
                  )}
                  <HotTarget
                    as="span"
                    hot={hotItems.includes(it) ? { group: "skill", id: it } : undefined}
                    tabIndex={hotItems.includes(it) ? 0 : undefined}
                  >
                    {it}
                  </HotTarget>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
