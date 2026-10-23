"use client";
import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion-store";

// Hex-dump texture (spec §5). Bytes encode the real intro text. Redrawn at ~0.5fps, never per frame.
const TEXT =
  "ankesh jaiswal :: full-stack developer :: building fast, thoughtful web apps :: open to work :: ";
const LINE_H = 16;
const COL_W = 68 * 7.2 + 96;

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

export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);
  const motion = useMotion();
  const offset = useRef(0);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    let ready = false;

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
      const cols = Math.ceil(w / COL_W);
      const rows = Math.ceil(h / LINE_H) + 1;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const n = r + offset.current;
          const l = hexLine(n * 16 + c * 0x130, c * 7);
          const x = c * COL_W - 8;
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

    const sync = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
      const running = motion === "on" && !reduced.matches && !document.hidden;
      if (running)
        timer = setInterval(() => {
          offset.current += 1; // ~1 line per 2s
          draw();
        }, 2000);
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
      if (timer) clearInterval(timer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [motion]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
