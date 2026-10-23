"use client";
import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion-store";
import { useTheme } from "@/lib/theme-store";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";

// Background texture (spec §5): dim terminal text on a canvas behind everything, never brighter
// than #1d1d1d. `hex` scrolls up ~1 line per 2s; `log` appends a syslog line every 3–6s. Both
// pause when the tab is hidden or motion is paused, and freeze under reduced motion.
const TEXT =
  "ankesh jaiswal :: full-stack developer :: building fast, thoughtful web apps :: open to work :: ";
const LINE_H = 16;
const HEX_COL = 68 * 7.2 + 96;
const LOG_COL = 84 * 7.2 + 72;

function hexLine(addr: number, shift: number) {
  const bytes: number[] = [];
  for (let i = 0; i < 16; i++) bytes.push(TEXT.charCodeAt((addr + i + shift) % TEXT.length));
  const groups: string[] = [];
  for (let i = 0; i < 16; i += 2)
    groups.push(
      bytes[i].toString(16).padStart(2, "0") + bytes[i + 1].toString(16).padStart(2, "0"),
    );
  const ascii = bytes.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
  return { a: addr.toString(16).padStart(8, "0") + ":", b: groups.join(" "), c: ascii };
}

// Seeded, so the log reads the same on every visit and never looks random-noisy.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function logMessages(sha?: string): string[] {
  const host = `${profile.firstName.toLowerCase()}-pc`;
  const p = projects.map((x) => x.slug);
  const msgs = [
    `git[2210]: pushed 3 commits to origin/main`,
    `next[3141]: compiled /projects in 84ms`,
    `node[3141]: GET /about 200 12ms`,
    `tsc[4096]: found 0 errors`,
    `vim[1337]: wrote ~/about.md`,
    `tmux[777]: window 2 renamed to projects`,
    `cron[611]: refreshed github stats`,
    `postgres[5432]: checkpoint complete`,
    `sshd[22]: accepted publickey for recruiter`,
    `${profile.firstName.toLowerCase()}[1]: building ${profile.now.label}`,
    ...p.map((s) => `git[2210]: checkout ${s}`),
    ...(sha ? [`vercel[443]: deployed main@${sha}`] : []),
  ];
  return msgs.map((m) => `${host} ${m}`);
}

const stamp = (d: Date) =>
  d.toLocaleString("en-US", { month: "short", day: "2-digit" }) +
  " " +
  d.toTimeString().slice(0, 8);

export function Background({ sha }: { sha?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const motion = useMotion();
  const theme = useTheme();
  const offset = useRef(0);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;

    // log mode: a seeded pool; the newest line sits at the bottom
    const pool = logMessages(sha);
    const pick = rng(2006);
    const log: { ts: string; msg: string }[] = [];
    const push = (d: Date) =>
      log.push({ ts: stamp(d), msg: pool[Math.floor(pick() * pool.length)] });
    const now = Date.now();
    const rows0 = Math.ceil(window.innerHeight / LINE_H) + 1;
    for (let i = rows0; i > 0; i--) push(new Date(now - i * 4300));

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `12px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textBaseline = "top";
      return { w, h };
    };

    const drawHex = () => {
      const { w, h } = size();
      const cols = Math.ceil(w / HEX_COL);
      const rows = Math.ceil(h / LINE_H) + 1;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const n = r + offset.current;
          const l = hexLine(n * 16 + c * 0x130, c * 7);
          const x = c * HEX_COL - 8;
          const y = r * LINE_H;
          ctx.fillStyle = "#1d1d1d";
          ctx.fillText(l.a, x, y);
          ctx.fillStyle = "#151515";
          ctx.fillText(l.b, x + 10 * 7.2, y);
          ctx.fillStyle = "#121212";
          ctx.fillText(l.c, x + 52 * 7.2, y);
        }
      }
    };

    const drawLog = () => {
      const { w, h } = size();
      const cols = Math.ceil(w / LOG_COL);
      const rows = Math.ceil(h / LINE_H);
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++) {
          // each column shows the same log, offset, so the texture never repeats side by side
          const e = log[log.length - rows + r - c * 7];
          if (!e) continue;
          const x = c * LOG_COL + 8;
          const y = r * LINE_H;
          ctx.fillStyle = "#1d1d1d";
          ctx.fillText(e.ts, x, y);
          ctx.fillStyle = "#151515";
          ctx.fillText(e.msg, x + 16 * 7.2, y);
        }
    };

    const draw = () => {
      if (!ready) return;
      if (theme === "log") drawLog();
      else drawHex();
    };

    const sync = () => {
      clearTimeout(timer);
      timer = undefined;
      if (motion !== "on" || reduced.matches || document.hidden) return;
      const tick = () => {
        if (theme === "log") {
          push(new Date());
          if (log.length > 400) log.splice(0, log.length - 400);
        } else offset.current += 1; // ~1 line per 2s
        draw();
        timer = setTimeout(tick, theme === "log" ? 3000 + pick() * 3000 : 2000);
      };
      timer = setTimeout(tick, theme === "log" ? 3000 + pick() * 3000 : 2000);
    };

    document.fonts.ready.then(() => {
      ready = true;
      draw();
    });
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [motion, theme, sha]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="bg-canvas pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
