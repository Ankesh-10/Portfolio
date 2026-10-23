import Link from "next/link";
import { tabs } from "@/lib/routes";

type Item = { label: string; href: string; external?: boolean; download?: boolean };

export function Links({ items }: { items: Item[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-[3ch] p-0">
      {items.map((l) => (
        <li key={l.label} className="whitespace-nowrap">
          <span aria-hidden className="text-t4">
            →{" "}
          </span>
          {l.external ? (
            <a className="slink" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <a className="slink" href={l.href} {...(l.download ? { download: true } : {})}>
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/** `ls ~` — the tabs as directories. */
export function Dirs() {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-[3ch] p-0">
      {tabs
        .filter((t) => t.slug !== "home")
        .map((t) => (
          <li key={t.slug} className="whitespace-nowrap">
            <Link className="slink" href={t.href}>
              {t.label}
            </Link>
            <span aria-hidden className="text-t4">
              /
            </span>
          </li>
        ))}
    </ul>
  );
}
