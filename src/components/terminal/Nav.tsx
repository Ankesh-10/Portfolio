"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabs, tabFor } from "@/lib/routes";

/** Tabs as plain words in the bottom bar. Digits stay available as shortcuts via aria-keyshortcuts and the tooltip. */
export function Nav() {
  const active = tabFor(usePathname())?.slug;
  return (
    <nav
      id="sections"
      aria-label="Sections"
      className="term-nav flex items-center gap-x-4 overflow-x-auto px-6 text-[length:var(--fs-ui)] leading-4 max-md:px-4"
      style={{ gridArea: "nav" }}
    >
      {tabs.map((t) => {
        const on = t.slug === active;
        return (
          <Link
            key={t.slug}
            href={t.href}
            aria-label={t.label[0].toUpperCase() + t.label.slice(1)}
            aria-keyshortcuts={String(t.index)}
            aria-current={on ? "page" : undefined}
            title={`${t.index} · ${t.desc}`}
            className={`flex h-11 items-center whitespace-nowrap transition-colors duration-150 ${on ? "text-t1" : "text-t3 hover:text-yellow"}`}
          >
            <span aria-hidden className={on ? "text-yellow" : "invisible"}>
              ›
            </span>
            <span aria-hidden className="ml-1">
              {t.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
