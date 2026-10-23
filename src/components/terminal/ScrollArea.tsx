"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { setScrollPos } from "@/lib/scroll-store";

/** The buffer's scroll container. Reports the top visible line to the status line; reads layout only in rAF, never in render. */
export function ScrollArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const rows = el.querySelectorAll<HTMLElement>("[data-ln]");
      let line = 1;
      for (const r of rows) {
        if (r.offsetTop + r.offsetHeight > scrollTop + 1) {
          line = Number(r.dataset.ln);
          break;
        }
      }
      const max = scrollHeight - clientHeight;
      const where =
        max <= 1
          ? "All"
          : scrollTop <= 1
            ? "Top"
            : scrollTop >= max - 1
              ? "Bot"
              : `${Math.round((scrollTop / max) * 100)}%`;
      setScrollPos({ line, where });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    el.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="buf-scroll relative h-full overflow-y-auto overflow-x-hidden overscroll-contain"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
