import Link from "next/link";
import type { Inline } from "@/lib/lines";
import { RunButton } from "./RunButton";

export function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : "run" in p ? (
          <RunButton key={i} cmd={p.run} label={p.label} fill={p.fill} />
        ) : p.external ? (
          <a key={i} className="slink" href={p.href} target="_blank" rel="noopener noreferrer">
            {p.label}
            <span aria-hidden> ↗</span>
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
