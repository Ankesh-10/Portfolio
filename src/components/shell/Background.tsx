"use client";
import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion-store";
import { themePref } from "@/lib/prefs";

// Dim terminal-text texture (spec §5). `hex` (default) encodes the real intro text; `log` is syslog.
// Drawn to a canvas; hex redraws at ~0.5fps, log appends a line every 3–6s. Never per frame.
const TEXT =
  "ankesh jaiswal :: full-stack developer :: building fast, thoughtful web apps :: open to work :: ";
const LINE_H = 16;
const CH = 7.2;
const HEX_COL_W = 68 * CH + 96;
const LOG_COL_W = 78 * CH + 64;

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MESSAGES = [
  "ankesh-pc git[%p]: pushed 3 commits to origin/main",
  "ankesh-pc systemd[1]: Started Daily apt download activities.",
  "ankesh-pc sshd[%p]: Accepted publickey for ankesh from 10.0.0.4",
  "ankesh-pc node[%p]: next build finished in 4.2s",
  "ankesh-pc CRON[%p]: (ankesh) CMD (/usr/local/bin/backup.sh)",
  "ankesh-pc kernel: [%p.1] usb 1-2: new high-speed USB device",
  "ankesh-pc code[%p]: extension host started",
  "ankesh-pc docker[%p]: container portfolio-db healthy",
  "ankesh-pc vercel[%p]: deployment ready",
];

function stamp(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
type Log = { t: string; m: string };
const logAt = (d: Date, n: number): Log => ({
  t: stamp(d),
  m: MESSAGES[n % MESSAGES.length].replace("%p", String(2000 + ((n * 137) % 7000))),
});

export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);
  const motion = useMotion();
  const mode = themePref.use();
  const offset = useRef(0);
  const logs = useRef<Log[]>([]);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;
    let n = 0;

    if (mode === "log" && !logs.current.length) {
      const now = Date.now();
      logs.current = Array.from({ length: 80 }, (_, i) =>
        logAt(new Date(now - (80 - i) * 4500), i),
      );
      n = 80;
    }

    const draw = () => {
      if (!ready) return;
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
      const rows = Math.ceil(h / LINE_H) + 1;
      if (mode === "hex") {
        const cols = Math.ceil(w / HEX_COL_W);
        for (let c = 0; c < cols; c++)
          for (let r = 0; r < rows; r++) {
            const l = hexLine((r + offset.current) * 16 + c * 0x130, c * 7);
            const x = c * HEX_COL_W - 8;
            const y = r * LINE_H;
            ctx.fillStyle = "#1d1d1d";
            ctx.fillText(l.a, x, y);
            ctx.fillStyle = "#151515";
            ctx.fillText(l.b, x + 10 * CH, y);
            ctx.fillStyle = "#121212";
            ctx.fillText(l.c, x + 52 * CH, y);
          }
      } else {
        const cols = Math.ceil(w / LOG_COL_W);
        const L = logs.current;
        for (let c = 0; c < cols; c++)
          for (let r = 0; r < rows; r++) {
            const l = L[(L.length - rows + r + c * 11 + L.length * 4) % L.length];
            const x = c * LOG_COL_W - 8;
            ctx.fillStyle = "#1d1d1d";
            ctx.fillText(l.t, x, r * LINE_H);
            ctx.fillStyle = "#151515";
            ctx.fillText(l.m, x + 16 * CH, r * LINE_H);
          }
      }
    };

    const running = () => motion === "on" && !reduced.matches && !document.hidden;
    const tick = () => {
      if (running()) {
        if (mode === "hex") {
          offset.current += 1; // ~1 line per 2s
          draw();
          timer = setTimeout(tick, 2000);
          return;
        }
        logs.current.push(logAt(new Date(), n++));
        if (logs.current.length > 200) logs.current.shift();
        draw();
      }
      timer = setTimeout(tick, mode === "hex" ? 2000 : 3000 + Math.random() * 3000);
    };
    const sync = () => {
      clearTimeout(timer);
      timer = setTimeout(tick, mode === "hex" ? 2000 : 3000 + Math.random() * 3000);
      draw();
    };

    document.fonts.ready.then(() => {
      ready = true;
      draw();
    });
    window.addEventListener("resize", draw);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", draw);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [motion, mode]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="bg-canvas pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
