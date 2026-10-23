import Link from "next/link";
import type { Inline } from "@/lib/lines";

export function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : p.external ? (
          <a key={i} className="slink" href={p.href} target="_blank" rel="noopener noreferrer">
            {p.label}
            <span aria-hidden> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link key={i} className="slink" href={p.href}>
            {p.label}
          </Link>
        ),
      )}
    </>
  );
}
