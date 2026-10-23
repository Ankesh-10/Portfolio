"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tabs } from "@/lib/routes";

const alias: Record<string, string> = {
  work: "projects",
  experience: "about",
  jobs: "about",
  education: "about",
};

const OPEN = "cmd-open";
const names = tabs.map((t) => t.slug).join(" · ");

/** Phone `❯ type` cell opens the docked command line (spec §12). */
export function openCommandLine() {
  window.dispatchEvent(new Event(OPEN));
}

/** Phase-2 command line: navigation only. The parser/registry, history and palette are Phase 3 (spec §8). */
export function CommandLine() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false); // phone only: docked above the keyboard
  const [kb, setKb] = useState(0);

  // Single-key shortcuts (0–5, `:`) only when no text field is focused (spec §8).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tab = tabs.find((t) => String(t.index) === e.key);
      if (tab) router.push(tab.href);
      else if (e.key === ":") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    const onOpen = () => {
      setOpen(true);
      // Focus in the same task as the tap, or iOS won't raise the keyboard.
      ref.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN, onOpen);
    };
  }, [router]);

  // Keep the docked row on top of the on-screen keyboard.
  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      delete root.dataset.cmdOpen;
      return;
    }
    root.dataset.cmdOpen = "";
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      delete root.dataset.cmdOpen;
    };
  }, [open]);

  function run(raw: string) {
    const cmd = raw
      .trim()
      .toLowerCase()
      .replace(/^cd\s+~?\/?/, "");
    if (!cmd) return;
    if (cmd === "help" || cmd === "ls") {
      setNote(`tabs: ${names}`);
      return;
    }
    const slug = alias[cmd] ?? cmd;
    const tab = tabs.find((t) => t.slug === slug);
    if (tab) {
      setNote("");
      ref.current?.blur();
      router.push(tab.href + (alias[cmd] === "about" ? "#experience" : ""));
    } else {
      setNote(`${cmd}: not found. try ${names}`);
    }
  }

  return (
    <div
      data-open={open}
      className="cmd-row flex h-8 items-center gap-2 bg-[var(--term-chrome)] px-3 text-[length:var(--fs-ui)] leading-4"
      style={{ gridArea: "cmd", ["--kb" as string]: `${kb}px` }}
    >
      <label htmlFor="cmdline" className="text-t3">
        <span aria-hidden>:</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline"
        ref={ref}
        name="command"
        type="text"
        enterKeyHint="go"
        className="cmd-input min-w-0 flex-1 bg-transparent text-t1 outline-none focus-visible:outline-none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="type a tab name or help…"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            run(e.currentTarget.value);
            e.currentTarget.value = "";
          } else if (e.key === "Escape") e.currentTarget.blur();
        }}
      />
      <span
        role="status"
        aria-live="polite"
        className={`ml-auto truncate text-t3 ${note ? "max-md:max-w-[60%]" : "max-md:hidden"}`}
        translate="no"
      >
        {note || (
          <>
            press <kbd className="font-mono text-yellow">:</kbd> to type ·{" "}
            <kbd className="font-mono text-yellow">0</kbd>–
            <kbd className="font-mono text-yellow">5</kbd> to switch tabs
          </>
        )}
      </span>
    </div>
  );
}
