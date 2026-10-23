import Link from "next/link";

export function Table({ cols }: { cols: { label: string; value: string; href?: string }[] }) {
  return (
    <dl className="stat-grid m-0">
      {cols.map((c) => (
        <div key={c.label}>
          <dt className="text-[length:var(--fs-label)] uppercase leading-4 tracking-[.14em] text-t3">
            {c.label}
          </dt>
          <dd className="tnum m-0 font-bold leading-6 text-t1">
            {c.href ? (
              <Link className="slink" href={c.href}>
                {c.value}
                <span aria-hidden> ↗</span>
              </Link>
            ) : (
              c.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
