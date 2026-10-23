import Link from "next/link";

type Featured = { name: string; href: string; summary: string; year: number };
type Proj = { name: string; href: string; stack: string; year: number; status: string };

/** `→ name   summary   year` */
export function Featured({ rows }: { rows: Featured[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {rows.map((r) => (
        <li key={r.name} data-visual={`project:${r.href.split("/").pop()}`}>
          <Link href={r.href} className="rowlink row-grid">
            <span aria-hidden className="row-arrow text-t4">
              →
            </span>
            <span className="row-name font-bold text-t1 underline decoration-ydim decoration-1 underline-offset-[3px]">
              {r.name}
            </span>
            <span className="row-sum text-t2">{r.summary}</span>
            <span className="row-year text-t3">{r.year}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** `ls ~/projects`: name  stack  year  status */
export function Projects({ rows }: { rows: Proj[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {rows.map((r) => (
        <li key={r.name} data-visual={`project:${r.href.split("/").pop()}`}>
          <Link href={r.href} className="rowlink row-grid">
            <span aria-hidden className="row-arrow text-t4">
              →
            </span>
            <span className="row-name font-bold text-t1 underline decoration-ydim decoration-1 underline-offset-[3px]">
              {r.name}
            </span>
            <span className="row-sum text-t2">
              {r.stack} <span className="text-t3">· {r.status}</span>
            </span>
            <span className="row-year text-t3">{r.year}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
