"use client";
import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { schedule } from "@/lib/timeline";
import type { Info } from "@/lib/timeline";
import { tabFor, wideTabs } from "@/lib/routes";
import { visit } from "@/lib/visited";

let hydrated = false; // the first mount is the page load: boot/landing are server + inline-script driven
let prevSlug = "";

const motionAllowed = () =>
  document.documentElement.dataset.motion !== "off" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Tab-change timelines (spec §9): on a client navigation the new page's rows are scheduled with the same
 * schedule() as the server uses, written as CSS variables, and CSS does the reveal. Any key or click
 * completes everything at once.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const el = ref.current!;
    const slug = tabFor(pathname)?.slug ?? "";
    const initial = !hydrated;
    hydrated = true;
    const before = prevSlug;
    prevSlug = slug;
    if (initial || !motionAllowed()) {
      visit(slug);
      return;
    }
    const returning = visit(slug);
    const rows = [...el.querySelectorAll<HTMLElement>(":scope > .buf-row")];
    const infos: Info[] = rows.map((r) => ({
      kind: (r.dataset.kind as Info["kind"]) ?? "line",
      chars: Number(r.dataset.chars ?? 0),
      rows: 12,
    }));
    const times = schedule(infos, returning ? "return" : "first", {
      widthChange: wideTabs.has(before) !== wideTabs.has(slug),
      compact: true,
    });
    rows.forEach((r, i) => {
      const t = times[i];
      r.dataset.mode = t.mode;
      r.style.setProperty("--t", `${t.t}ms`);
      r.style.setProperty("--d", `${t.d}ms`);
      r.style.setProperty("--n", String(t.n));
      r.style.setProperty("--rs", `${t.rs}ms`);
    });
    el.classList.add("buf-reveal");
    const done = () => el.classList.remove("buf-reveal");
    const end = Math.max(0, ...times.map((t) => t.t + t.d)) + 150;
    const timer = setTimeout(done, end);
    addEventListener("keydown", done, { once: true, capture: true });
    addEventListener("pointerdown", done, { once: true, capture: true });
    return () => {
      clearTimeout(timer);
      removeEventListener("keydown", done, true);
      removeEventListener("pointerdown", done, true);
      done();
    };
  }, [pathname]);

  return (
    <div ref={ref} className="flex min-h-full flex-col">
      {children}
    </div>
  );
}
