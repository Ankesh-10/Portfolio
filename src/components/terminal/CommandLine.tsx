"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { tabs, tabFor } from "@/lib/routes";
import { commonPrefix, completions, run, type Result } from "@/lib/commands";
import type { Line } from "@/lib/lines";
import { appendOutput, clearOutput, pushHistory, readHistory } from "@/lib/session";
import { setMotion } from "@/lib/motion-store";
import { setShortcuts, shortcutsOn } from "@/lib/shortcuts-store";
import { setTheme } from "@/lib/theme-store";
import { MATRIX_EVENT, PALETTE_EVENT, RUN_EVENT, type RunDetail } from "@/lib/term-events";
import { markNudgeDone } from "./Nudge";
import { announce } from "./LiveRegion";
import { CommandPalette } from "./CommandPalette";

const isField = (el: Element | null) =>
  !!el &&
  (el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    (el as HTMLElement).isContentEditable);

const promptPath = (pathname: string) => {
  const t = tabFor(pathname);
  return !t || t.slug === "home" ? "~" : `~/${t.slug}`;
};

/** The `:` command line (spec §6.6, §8). It owns the one command runner; the palette and
 *  clickable commands in the buffer send it commands through `runCommand`. */
export function CommandLine({ resumeKb }: { resumeKb?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [palette, setPalette] = useState(false);
  const hist = useRef({ i: -1, draft: "" });
  const focusMain = useRef(false);

  // Navigation from the palette or a link in the buffer moves focus to <main> (spec §13).
  useEffect(() => {
    if (!focusMain.current) return;
    focusMain.current = false;
    document.getElementById("content")?.focus();
  }, [pathname]);

  const apply = useCallback(
    (r: Result, source: RunDetail["source"] | "cmdline") => {
      const add = (lines: Line[]) => appendOutput(pathname, lines);
      for (const e of r.effects) {
        switch (e.k) {
          case "nav": {
            const go = () => {
              if (source !== "cmdline") focusMain.current = true;
              router.push(e.href);
            };
            // Output that precedes a jump (sudo hire-me) stays readable for a moment.
            if (r.lines.length) setTimeout(go, 700);
            else go();
            announce(e.label);
            break;
          }
          case "external":
            window.open(e.href, "_blank", "noopener,noreferrer");
            break;
          case "download": {
            const a = document.createElement("a");
            a.href = "/resume.pdf";
            a.download = "resume.pdf";
            a.click();
            break;
          }
          case "copy": {
            const done = (ok: boolean) => {
              add([
                {
                  t: "text",
                  parts: ok
                    ? [`copied ✓ ${e.text}`]
                    : ["couldn't copy — here it is: ", { href: `mailto:${e.text}`, label: e.text }],
                },
              ]);
              announce(ok ? "copied email address" : `couldn't copy. the address is ${e.text}`);
            };
            if (navigator.clipboard?.writeText)
              navigator.clipboard.writeText(e.text).then(
                () => done(true),
                () => done(false),
              );
            else done(false);
            break;
          }
          case "clear":
            clearOutput();
            break;
          case "motion":
            setMotion(e.v);
            break;
          case "shortcuts":
            setShortcuts(e.v);
            break;
          case "matrix":
            window.dispatchEvent(new Event(MATRIX_EVENT));
            break;
          case "theme":
            setTheme(e.v);
            break;
        }
      }
      if (r.announce && !r.effects.some((e) => e.k === "nav")) announce(r.announce);
    },
    [pathname, router],
  );

  const execute = useCallback(
    (raw: string, source: RunDetail["source"] | "cmdline" = "cmdline") => {
      const cmd = raw.trim();
      if (!cmd) return;
      pushHistory(cmd);
      markNudgeDone();
      const r = run(cmd, { pathname, history: readHistory(), resumeKb });
      if (r.echo !== false)
        appendOutput(pathname, [{ t: "prompt", cmd, path: promptPath(pathname) }, ...r.lines]);
      apply(r, source);
    },
    [pathname, resumeKb, apply],
  );

  // Commands from the palette and from clickable names in the buffer.
  useEffect(() => {
    const onRun = (ev: Event) => {
      const d = (ev as CustomEvent<RunDetail>).detail;
      if (d.fill) {
        setValue(d.cmd);
        ref.current?.focus();
      } else execute(d.cmd, d.source);
    };
    const onPalette = () => setPalette(true);
    window.addEventListener(RUN_EVENT, onRun);
    window.addEventListener(PALETTE_EVENT, onPalette);
    return () => {
      window.removeEventListener(RUN_EVENT, onRun);
      window.removeEventListener(PALETTE_EVENT, onPalette);
    };
  }, [execute]);

  // Single-key shortcuts (0–5, `/`, `:`): only when no text field is focused, and `shortcuts off`
  // turns them off (spec §8, WCAG 2.1.4).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isField(document.activeElement) || isField(e.target as Element)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || !shortcutsOn()) return;
      const tab = tabs.find((t) => String(t.index) === e.key);
      if (tab) {
        markNudgeDone();
        router.push(tab.href);
        announce(tab.label[0].toUpperCase() + tab.label.slice(1));
      } else if (e.key === ":") {
        e.preventDefault();
        ref.current?.focus();
      } else if (e.key === "/") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      execute(value);
      setValue("");
      hist.current = { i: -1, draft: "" };
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const h = readHistory();
      const s = hist.current;
      if (!h.length) return;
      e.preventDefault();
      if (e.key === "ArrowUp") {
        if (s.i === -1) s.draft = value;
        s.i = s.i === -1 ? h.length - 1 : Math.max(0, s.i - 1);
        setValue(h[s.i]);
      } else if (s.i !== -1) {
        s.i += 1;
        if (s.i >= h.length) {
          s.i = -1;
          setValue(s.draft);
        } else setValue(h[s.i]);
      }
    } else if (e.key === "Tab" && value.trim() && !e.shiftKey) {
      // Only an input with something to complete takes Tab; an empty one lets focus move on.
      const c = completions(value);
      if (!c.length) return;
      e.preventDefault();
      const p = commonPrefix(c);
      if (c.length === 1) setValue(c[0] + " ");
      else if (p.length > value.length) setValue(p);
      else
        appendOutput(pathname, [
          { t: "prompt", cmd: value, path: promptPath(pathname) },
          { t: "text", parts: [c.join("   ")] },
        ]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      clearOutput();
    } else if (e.key === "Escape") e.currentTarget.blur();
  }

  return (
    <div
      className="relative flex h-8 items-center gap-2 bg-[var(--term-chrome)] px-3 text-[length:var(--fs-ui)] leading-4"
      style={{ gridArea: "cmd" }}
    >
      {palette && (
        <CommandPalette
          onClose={() => setPalette(false)}
          onRun={(cmd) => {
            setPalette(false);
            execute(cmd, "palette");
          }}
        />
      )}
      <label htmlFor="cmdline" className="text-t3">
        <span aria-hidden>:</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline"
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          hist.current.i = -1;
        }}
        onKeyDown={onKeyDown}
        className="cmd-input min-w-0 flex-1 bg-transparent text-t1 outline-none focus-visible:outline-none"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-keyshortcuts=":"
      />
      <span className="ml-auto whitespace-nowrap text-t3 max-md:hidden">
        click a tab below ·{" "}
        <button type="button" className="slink cursor-pointer" onClick={() => execute("help")}>
          help
        </button>{" "}
        ·{" "}
        <button
          type="button"
          className="slink cursor-pointer"
          aria-keyshortcuts="/"
          onClick={() => setPalette(true)}
        >
          / commands
        </button>
      </span>
    </div>
  );
}
