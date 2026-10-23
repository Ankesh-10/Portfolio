"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Line } from "@/lib/lines";
import { tabFor, tabs } from "@/lib/routes";
import { commandNames, copyResult, execute } from "@/lib/commands";
import { setMotion } from "@/lib/motion-store";
import { infoOf, schedule } from "@/lib/timeline";
import type { Timing } from "@/lib/timeline";
import { shortcutsPref, themePref } from "@/lib/prefs";

export type Entry = { line: Line; timing?: Timing };

type Terminal = {
  entries: Entry[];
  announcement: string;
  history: string[];
  paletteOpen: boolean;
  matrix: number;
  resumeFlash: boolean;
  run: (raw: string) => void;
  openPalette: () => void;
  closePalette: () => void;
  announce: (msg: string) => void;
};

const Ctx = createContext<Terminal | null>(null);
export const useTerminal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTerminal outside TerminalProvider");
  return c;
};

const HKEY = "history";
const isField = (el: Element | null) =>
  !!el &&
  (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);

export function TerminalProvider({
  children,
  resumeKb,
}: {
  children: ReactNode;
  resumeKb?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [announcement, setAnnouncement] = useState("");
  // Session history (spec §8). Only read after interaction, never rendered on the server, so a lazy read is safe.
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(sessionStorage.getItem(HKEY) ?? "[]");
      return Array.isArray(saved) ? saved.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [matrix, setMatrix] = useState(0);
  const [resumeFlash, setResumeFlash] = useState(false);
  const shortcuts = shortcutsPref.use();
  const returnFocus = useRef<HTMLElement | null>(null);
  const lastAnnounce = useRef(0);

  // Output belongs to the tab it was run on: a route change clears it (adjusted during render).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setEntries([]);
  }

  const announce = useCallback((msg: string) => {
    // Alternate a trailing zero-width space so an identical message is announced again.
    lastAnnounce.current ^= 1;
    setAnnouncement(msg + (lastAnnounce.current ? "​" : ""));
  }, []);

  // Output of a command the visitor ran: the prompt commits instantly, the output streams (spec §9 `echo`).
  // Starting a new command first completes the current output at once.
  const append = useCallback((lines: Line[]) => {
    const animate =
      document.documentElement.dataset.motion !== "off" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const times = animate ? schedule(lines.map(infoOf), "echo") : [];
    const end = times.reduce((m, t) => Math.max(m, t.t + t.d), 0);
    setEntries((prev) => [
      ...prev.map((e) => ({ line: e.line })),
      ...lines.map((line, i) => ({ line, timing: times[i] })),
    ]);
    if (animate)
      setTimeout(
        () => setEntries((cur) => cur.map((e) => (e.timing ? { line: e.line } : e))),
        end + 100,
      );
  }, []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;
      const nextHistory = [
        ...history.filter((h, i) => !(i === history.length - 1 && h === input)),
        input,
      ].slice(-50);
      setHistory(nextHistory);
      try {
        sessionStorage.setItem(HKEY, JSON.stringify(nextHistory));
      } catch {}

      const res = execute(input, { history: nextHistory, resumeKb });
      const slug = tabFor(pathname)?.slug ?? "home";
      const path = slug === "home" ? "~" : `~/${slug}`;
      if (res.echo !== false)
        append([
          { t: "prompt", cmd: input, path, heading: res.heading ?? "Command output" },
          ...res.lines,
        ]);
      if (res.announce) announce(res.announce);

      for (const fx of res.effects) {
        switch (fx.k) {
          case "nav":
            if (fx.delay) setTimeout(() => router.push(fx.href), fx.delay);
            else router.push(fx.href);
            break;
          case "download": {
            const a = document.createElement("a");
            a.href = "/resume.pdf";
            a.download = "resume.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            setResumeFlash(true);
            setTimeout(() => setResumeFlash(false), 2000);
            break;
          }
          case "open":
            window.open(fx.href, "_blank", "noopener,noreferrer");
            break;
          case "copy": {
            const done = (ok: boolean) => {
              append([
                { t: "prompt", cmd: input, path, heading: "Email" },
                ...copyResult(ok, fx.text),
              ]);
              announce(ok ? "Copied email address" : "Couldn't copy the email address");
            };
            if (!navigator.clipboard?.writeText) done(false);
            else
              navigator.clipboard.writeText(fx.text).then(
                () => done(true),
                () => done(false),
              );
            break;
          }
          case "palette":
            setPaletteOpen(true);
            break;
          case "clear":
            setEntries([]);
            break;
          case "motion":
            setMotion(fx.v);
            break;
          case "shortcuts":
            shortcutsPref.set(fx.v);
            break;
          case "theme":
            themePref.set(fx.v);
            break;
          case "matrix":
            setMatrix((m) => m + 1);
            break;
        }
      }
    },
    [history, pathname, resumeKb, router, append, announce],
  );

  const openPalette = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => {
    setPaletteOpen(false);
    const el = returnFocus.current;
    returnFocus.current = null;
    if (el && el !== document.body && document.contains(el)) el.focus();
  }, []);

  // Any key or click completes pending output at once (spec §9 "Interrupts").
  useEffect(() => {
    const settle = () =>
      setEntries((cur) => (cur.some((e) => e.timing) ? cur.map((e) => ({ line: e.line })) : cur));
    addEventListener("keydown", settle, true);
    addEventListener("pointerdown", settle, true);
    return () => {
      removeEventListener("keydown", settle, true);
      removeEventListener("pointerdown", settle, true);
    };
  }, []);

  // Global keys. Single-key shortcuts only fire outside text fields and can be turned off (WCAG 2.1.4).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setEntries([]);
        return;
      }
      if (isField(document.activeElement) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (shortcuts === "off" || paletteOpen) return;
      const tab = tabs.find((t) => String(t.index) === e.key);
      if (tab) router.push(tab.href);
      else if (e.key === "/") {
        e.preventDefault();
        openPalette();
      } else if (e.key === ":") {
        e.preventDefault();
        document.getElementById("cmdline")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts, paletteOpen, router, openPalette]);

  const value = useMemo(
    () => ({
      entries,
      announcement,
      history,
      paletteOpen,
      matrix,
      resumeFlash,
      run,
      openPalette,
      closePalette,
      announce,
    }),
    [
      entries,
      announcement,
      history,
      paletteOpen,
      matrix,
      resumeFlash,
      run,
      openPalette,
      closePalette,
      announce,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { commandNames };
