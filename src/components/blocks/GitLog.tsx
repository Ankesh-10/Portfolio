import Link from "next/link";

type Row = {
  hash: string;
  date: string;
  title: string;
  org?: string;
  orgHref?: string;
  href?: string;
  /** `kind:key` for the left visual (a cert, or a timeline photo). */
  visual?: string;
};

// `* a3f9c21  2025-06  Title @ Org` — graph and hash are decorative (aria-hidden).
export function GitLog({ rows, id }: { rows: Row[]; id?: string }) {
  return (
    <ul id={id} className="m-0 list-none p-0">
      {rows.map((r) => (
        <li
          key={r.hash + r.date}
          data-visual={r.visual}
          className="grid grid-cols-[2ch_7ch_8ch_1fr] gap-x-[2ch] max-[899px]:grid-cols-[2ch_8ch_1fr]"
        >
          <span aria-hidden className="text-t4">
            *
          </span>
          <span aria-hidden className="text-t4 max-[899px]:hidden">
            {r.hash}
          </span>
          <span className="text-t3">{r.date}</span>
          <span>
            {r.href ? (
              <Link href={r.href} className="slink font-bold">
                {r.title}
              </Link>
            ) : (
              <span className="font-bold text-t1">{r.title}</span>
            )}
            {r.org && (
              <>
                <span className="sr-only"> at </span>
                <span aria-hidden className="text-t2">
                  {" "}
                  @{" "}
                </span>
                {r.orgHref ? (
                  <a className="slink" href={r.orgHref} target="_blank" rel="noopener noreferrer">
                    {r.org}
                  </a>
                ) : (
                  <span className="text-t2">{r.org}</span>
                )}
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
