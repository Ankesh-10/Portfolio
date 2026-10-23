import { figletFull, figletCompact } from "@/content/figlet";

// █ is text-1, shadow glyphs text-3 (full); compact is all text-1. Both aria-hidden: the name is the route's sr-only <h1>.
function Rows({ rows, shadow, lh }: { rows: string[]; shadow: boolean; lh: string }) {
  return (
    <pre className="m-0 font-mono text-[13px] text-t1" style={{ lineHeight: lh }}>
      {rows.map((r, i) => (
        <div key={i} className="fig-row" style={{ "--i": i } as React.CSSProperties}>
          {shadow
            ? r.split(/(█+)/).map((seg, j) =>
                seg === "" ? null : seg[0] === "█" ? (
                  <span key={j}>{seg}</span>
                ) : (
                  <span key={j} className="text-t3">
                    {seg}
                  </span>
                ),
              )
            : r || " "}
        </div>
      ))}
    </pre>
  );
}

export function Figlet() {
  return (
    <div aria-hidden>
      <div className="fig-full" style={{ height: 156 }}>
        <Rows rows={[...figletFull.ankesh, ...figletFull.jaiswal]} shadow lh="13px" />
      </div>
      <div className="fig-compact" style={{ height: 48 }}>
        <Rows rows={figletCompact.single} shadow={false} lh="16px" />
      </div>
      <div className="fig-stacked" style={{ height: 96 }}>
        <Rows rows={[...figletCompact.ankesh, ...figletCompact.jaiswal]} shadow={false} lh="16px" />
      </div>
    </div>
  );
}
