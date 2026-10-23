// Real <ul>; tree glyphs are decorative (aria-hidden) and never repeat on continuation rows.
export function Tree({ label, rows }: { label: string; rows: { key: string; items: string[] }[] }) {
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
            <span translate="no" className="min-w-0 text-t2">
              {r.items.map((it, j) => (
                <span key={it}>
                  {j > 0 && (
                    <span aria-hidden className="text-t4">
                      {" "}
                      ·{" "}
                    </span>
                  )}
                  {it}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
