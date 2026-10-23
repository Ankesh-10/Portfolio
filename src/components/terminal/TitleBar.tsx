"use client";
import { usePathname } from "next/navigation";
import { tabFor } from "@/lib/routes";
import { MotionToggle } from "./MotionToggle";
import { useTerminal } from "./TerminalProvider";

export function TitleBar() {
  const tab = tabFor(usePathname());
  const { run, resumeFlash } = useTerminal();
  return (
    <header
      className="relative flex h-9 items-center border-b border-line1 bg-[var(--term-chrome)] px-4 text-[length:var(--fs-ui)] leading-4"
      style={{ gridArea: "title" }}
    >
      <div aria-hidden className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-3 w-3 rounded-full bg-t4/60" />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 text-center text-t3 max-md:hidden"
      >
        ankesh@portfolio: ~/{tab?.slug ?? "?"} — tmux
      </div>
      <div className="ml-auto flex items-center gap-2">
        <MotionToggle className="tm-motion-title" />
        <a
          href="/resume.pdf"
          download
          onClick={(e) => {
            e.preventDefault();
            run("resume");
          }}
          className="ylink flex h-8 items-center whitespace-nowrap px-1"
        >
          <span aria-hidden>{resumeFlash ? "✓ " : "↓ "}</span>resume.pdf
        </a>
      </div>
    </header>
  );
}
