"use client";
import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/lib/motion-store";
import { useTerminal } from "./TerminalProvider";

const GLYPHS = "01<>/\\|{}[]=+*#$%&";

/** `matrix`: 3s monochrome rain over the background, then it fades (spec §8). Static frame for 1s when motion is off. */
export function MatrixRain() {
  const { matrix } = useTerminal();
  const motion = useMotion();
  const ref = useRef<HTMLCanvasElement>(null);
  const [fading, setFading] = useState(false);
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    if (!matrix) return;
    const c = ref.current;
    if (!c) return;
    const still = motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = c.getContext("2d")!;
    const w = (c.width = window.innerWidth);
    const h = (c.height = window.innerHeight);
    const cols = Math.ceil(w / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    ctx.font = `14px ${getComputedStyle(document.body).fontFamily}`;
    setAlive(true);
    setFading(false);

    const step = () => {
      ctx.fillStyle = "rgba(7,7,7,0.18)";
      ctx.fillRect(0, 0, w, h);
      drops.forEach((d, i) => {
        const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillStyle = "#8a8a8a";
        ctx.fillText(g, i * 14, d * 16);
        drops[i] = d * 16 > h && Math.random() > 0.96 ? 0 : d + 1;
      });
    };
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 50) {
        step();
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    if (still) for (let i = 0; i < 60; i++) step();
    else raf = requestAnimationFrame(loop);

    const fade = setTimeout(() => setFading(true), still ? 1000 : 3000);
    const end = setTimeout(() => setAlive(false), (still ? 1000 : 3000) + 600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fade);
      clearTimeout(end);
    };
  }, [matrix, motion]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 h-full w-full transition-opacity duration-500"
      style={{ opacity: alive && !fading ? 0.7 : 0, display: alive ? "block" : "none" }}
    />
  );
}
