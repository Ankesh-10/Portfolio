"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tabs, tabFor } from "@/lib/routes";
import { profile } from "@/content/profile";
import { Clock } from "./Clock";
import { MotionToggle } from "./MotionToggle";

const word = {
  "open to work": ["open to work", "open"],
  building: ["building", "building"],
  busy: ["busy", "busy"],
} as const;

export function StatusDot() {
  const [long, short] = word[profile.status];
  const dot =
    profile.status === "open to work" ? (
      <span className="text-red">●</span>
    ) : profile.status === "building" ? (
      <span className="text-t2">●</span>
    ) : (
      <span className="text-t3">○</span>
    );
  return (
    <span className="whitespace-nowrap text-t2">
      <span aria-hidden>{dot} </span>
      <span className="tm-status-long">{long}</span>
      <span className="tm-status-short">{short}</span>
    </span>
  );
}

export function TmuxBar() {
  const active = tabFor(usePathname())?.slug;
  return (
    <nav
      id="sections"
      aria-label="Sections"
      translate="no"
      className="tm-bar flex min-h-8 items-center border-t border-line1 bg-[var(--term-chrome)] px-2 text-[length:var(--fs-ui)] font-medium leading-4"
      style={{ gridArea: "tmux" }}
    >
      <div className="tm-tabs flex items-center">
        {tabs.map((t) => {
          const on = t.slug === active;
          return (
            <Link
              key={t.slug}
              href={t.href}
              aria-label={t.label[0].toUpperCase() + t.label.slice(1)}
              aria-keyshortcuts={String(t.index)}
              aria-current={on ? "page" : undefined}
              title={t.desc}
              className={`tm-tab group relative flex h-8 items-center whitespace-nowrap px-1.5 transition-colors duration-150 ${on ? "font-bold text-t1" : "text-t2 hover:text-yellow focus-visible:text-yellow"}`}
            >
              {on && <span aria-hidden className="absolute inset-x-1 top-0 h-0.5 bg-t1" />}
              <span aria-hidden className="tm-brackets">
                [
              </span>
              <span aria-hidden className={`tm-digit ${on ? "" : "text-yellow"}`}>
                {t.index}:
              </span>
              <span aria-hidden>{t.label}</span>
              {on && <span aria-hidden>*</span>}
              <span aria-hidden className="tm-brackets">
                ]
              </span>
              {!on && (
                <span
                  aria-hidden
                  className="absolute inset-x-1.5 bottom-1 h-px origin-left scale-x-0 bg-yellow transition-transform duration-150 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="ml-auto flex min-w-0 items-center gap-4 pl-4">
        <StatusDot />
        <MotionToggle className="tm-motion-bar" />
        <Clock />
      </div>
    </nav>
  );
}
