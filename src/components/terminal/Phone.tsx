"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { tabs, tabFor } from "@/lib/routes";
import { MotionToggle } from "./MotionToggle";
import { useTerminal } from "./TerminalProvider";
import { useCmdInput } from "./useCmdInput";

/** Phone top bar (spec §12): `ankesh.dev` + `‖`; hides on scroll down and returns on scroll up. */
export function PhoneTopBar() {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last.current && y > 44);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="fixed inset-x-0 top-0 z-30 flex h-11 items-center justify-between border-b border-line1 bg-[var(--term-chrome)] pl-4 text-[length:var(--fs-ui)] transition-transform duration-150 md:hidden"
      style={{ transform: hidden ? "translateY(-100%)" : undefined }}
    >
      <span className="text-t2">ankesh.dev</span>
      <MotionToggle className="flex h-11 min-w-11 justify-center" />
    </div>
  );
}

/** Fixed bottom bar: 2 rows × 4 cells — the six tabs, `❯ type` and `↓ resume` (spec §12). */
export function PhoneBar() {
  const active = tabFor(usePathname())?.slug;
  const { run, typeOpen, setTypeOpen } = useTerminal();
  const cell =
    "relative flex h-11 items-center justify-center text-[length:var(--fs-ui)] font-medium";
  const link = (slug: string) => {
    const t = tabs.find((x) => x.slug === slug)!;
    const on = t.slug === active;
    return (
      <Link
        key={slug}
        href={t.href}
        aria-label={t.label[0].toUpperCase() + t.label.slice(1)}
        aria-current={on ? "page" : undefined}
        title={t.desc}
        className={`${cell} ${on ? "font-bold text-t1" : "text-t2"}`}
      >
        {on && <span aria-hidden className="absolute inset-x-3 top-0 h-0.5 bg-t1" />}
        <span aria-hidden>{t.label}</span>
      </Link>
    );
  };
  return (
    <nav
      id="sections-m"
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 bg-[var(--term-chrome)] shadow-[0_-1px_0_var(--line-1)] pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{ display: typeOpen ? "none" : undefined }}
    >
      {link("home")}
      {link("about")}
      {link("projects")}
      <button
        type="button"
        className={`${cell} text-t2`}
        onClick={() => setTypeOpen(true)}
        aria-label="Type a command"
      >
        <span aria-hidden>❯ type</span>
      </button>
      {link("skills")}
      {link("certs")}
      {link("contact")}
      <a
        href="/resume.pdf"
        download
        className={`${cell} ylink`}
        onClick={(e) => {
          e.preventDefault();
          run("resume");
        }}
      >
        <span aria-hidden>↓ </span>resume
      </a>
    </nav>
  );
}

/** Single-line command input docked above the keyboard, positioned with visualViewport (spec §12). */
export function PhoneCommand() {
  const { typeOpen, setTypeOpen } = useTerminal();
  if (!typeOpen) return null;
  return <Docked onClose={() => setTypeOpen(false)} />;
}

function Docked({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [lift, setLift] = useState(0);
  const input = useCmdInput(onClose);

  useEffect(() => {
    ref.current?.focus();
    const vv = window.visualViewport;
    if (!vv) return;
    const place = () => setLift(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    place();
    vv.addEventListener("resize", place);
    vv.addEventListener("scroll", place);
    return () => {
      vv.removeEventListener("resize", place);
      vv.removeEventListener("scroll", place);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 z-40 flex h-12 items-center gap-2 border-t border-line3 bg-[#0c0c0c] px-3 text-[length:var(--fs-ui)] md:hidden"
      style={{ bottom: lift }}
    >
      <label htmlFor="cmdline-m" className="text-t3">
        <span aria-hidden>:</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline-m"
        ref={ref}
        className="cmd-input h-11 min-w-0 flex-1 bg-transparent text-t1 outline-none focus-visible:outline-none"
        value={input.value}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
        onChange={(e) => input.onChange(e.target.value)}
        onKeyDown={input.onKeyDown}
        onBlur={onClose}
      />
      <button
        type="button"
        className="ylink h-11 px-2"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClose}
      >
        done
      </button>
    </div>
  );
}
