"use client";
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { tabFor, wideTabs } from "@/lib/routes";
import { endOf, schedule, startFor, type Kind } from "@/lib/timeline";
import { slotVars } from "@/lib/reveal";
import { motionAllowed, visitFor } from "@/lib/visited";

/** Tab changes (spec §9): `clear`, then the new tab prints on the first- or return-visit timeline.
 *  Runs in a layout effect, so the new rows get their timings before the first paint. Any key or
 *  click completes everything at once. First paint is handled by the inline script + server vars. */
export function RevealController() {
  const path = usePathname();
  const prev = useRef<string | null>(null);

  useLayoutEffect(() => {
    const from = prev.current;
    prev.current = path;
    const visit = visitFor(path);
    if (from === null || from === path) return;

    const html = document.documentElement;
    if (html.dataset.reveal) html.dataset.reveal = "done"; // the boot/landing timings are over
    const buf = document.querySelector<HTMLElement>("#content .buf-scroll");
    if (!buf) return;
    // Reset first, so the same reveal on two tab changes in a row restarts its animations.
    buf.dataset.rv = "done";
    if (!motionAllowed()) return;
    void buf.offsetWidth;

    const rows = [...buf.querySelectorAll<HTMLElement>(".rv")];
    const specs = rows.map((r) => ({ k: r.dataset.k as Kind, n: Number(r.dataset.n) || 1 }));
    const widthChanges =
      wideTabs.has(tabFor(from)?.slug ?? "") !== wideTabs.has(tabFor(path)?.slug ?? "");
    const kind = visit === "return" ? "return" : "first";
    const slots = schedule(specs, kind, startFor(widthChanges));
    rows.forEach((r, i) => {
      for (const [k, v] of Object.entries(slotVars(slots[i]))) r.style.setProperty(k, v);
    });
    buf.dataset.rv = kind;

    const finish = () => {
      buf.dataset.rv = "done";
      stop();
    };
    const timer = setTimeout(finish, endOf(specs, slots) + 50);
    const opts = { capture: true } as const;
    const stop = () => {
      clearTimeout(timer);
      removeEventListener("keydown", finish, opts);
      removeEventListener("pointerdown", finish, opts);
    };
    addEventListener("keydown", finish, opts);
    addEventListener("pointerdown", finish, opts);
    return stop;
  }, [path]);

  return null;
}
