"use client";
import { useEffect, useRef, useState } from "react";
import { MATRIX_EVENT } from "@/lib/term-events";

// `matrix` easter egg (spec §8): 3s of monochrome character rain over the background, then a fade.
// Reduced motion or `‖ motion` off: one static frame for 1s.
const GLYPHS = "0123456789abcdef│─┼╳▚▞";
const SIZE = 14;

export function Matrix() {
  const [run, setRun] = useState(0);
  useEffect(() => {
    const on = () => setRun((n) => n + 1);
    window.addEventListener(MATRIX_EVENT, on);
    return () => window.removeEventListener(MATRIX_EVENT, on);
  }, []);
  return run ? <Rain key={run} /> : null;
}

function Rain() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"on" | "fading" | "done">("on");

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const cols = Math.ceil(w / SIZE);
    const drops = Array.from({ length: cols }, () => Math.floor((Math.random() * -h) / SIZE));
    const still =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "off";
    ctx.font = `${SIZE - 2}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textBaseline = "top";
    const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const frame = () => {
      ctx.fillStyle = "rgba(7,7,7,0.14)";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * SIZE;
        ctx.fillStyle = "#8a8a8a";
        ctx.fillText(glyph(), i * SIZE, y);
        ctx.fillStyle = "#2c2c2c";
        ctx.fillText(glyph(), i * SIZE, y - SIZE);
        drops[i] = y > h && Math.random() > 0.97 ? 0 : drops[i] + 1;
      }
    };

    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (still) {
      for (let i = 0; i < 40; i++) {
        for (let c = 0; c < cols; c++) drops[c] = Math.floor(Math.random() * (h / SIZE));
        frame();
      }
      timers.push(setTimeout(() => setState("done"), 1000));
    } else {
      let last = 0;
      const loop = (t: number) => {
        if (t - last > 50) {
          frame();
          last = t;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      timers.push(setTimeout(() => setState("fading"), 3000));
      timers.push(setTimeout(() => setState("done"), 3500));
    }
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (state === "done") return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] h-full w-full transition-opacity duration-500"
      style={{ opacity: state === "fading" ? 0 : 1 }}
    />
  );
}
