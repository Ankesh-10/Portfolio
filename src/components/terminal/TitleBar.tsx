"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { tabFor } from "@/lib/routes";
import { MotionToggle } from "./MotionToggle";

/** Window title bar on desktop; on phones the sticky `ankesh.dev ‖` top bar that hides on scroll down (spec §12). */
export function TitleBar() {
  const tab = tabFor(usePathname());
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    const onScroll = () => {
      if (!phone.matches) return;
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < 8) return;
      setHidden(y > lastY.current && y > 44);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-hidden={hidden}
      className="title-bar relative flex h-9 items-center border-b border-line1 bg-[var(--term-chrome)] px-4 text-[length:var(--fs-ui)] leading-4"
      style={{ gridArea: "title" }}
    >
      <div aria-hidden className="ph-hide flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-3 w-3 rounded-full bg-t4/60" />
        ))}
      </div>
      <span className="hidden font-medium max-md:inline tracking-[.08em] text-t2" translate="no">
        ankesh.dev
      </span>
      <div
        aria-hidden
        className="tb-center ph-hide pointer-events-none absolute inset-x-0 text-center text-t3"
        translate="no"
      >
        ankesh@portfolio: ~/{tab?.slug ?? "?"} — tmux
      </div>
      <div className="ml-auto flex items-center gap-2">
        <MotionToggle className="tm-motion-title max-md:h-11 max-md:min-w-11 max-md:justify-center" />
        <a
          href="/resume.pdf"
          download
          className="ylink ph-hide flex h-8 items-center gap-[1ch] whitespace-nowrap px-1"
        >
          <span aria-hidden>↓</span>resume.pdf
        </a>
      </div>
    </header>
  );
}
