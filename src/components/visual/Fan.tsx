"use client";
import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

/** The widest the visual can be here: full width on phones, 40% on tablets (spec §12), unlimited on desktop. */
function avail(): number {
  const w = window.innerWidth;
  return w < 768 ? w - 48 : w < 1024 ? w * 0.4 - 64 : Infinity;
}
export function useFitWidth(max: number): number {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => Math.round(Math.min(max, avail())),
    () => max,
  );
}

const TILT = [0, -5, 4, -3, 2];

/** A fanned stack: the front item sits on top, the rest peek out behind it. Shared by PhotoStack and CertDeck. */
export function Fan<T extends { id: string }>({
  items,
  frontId,
  width,
  ratio,
  render,
}: {
  items: T[];
  frontId: string;
  width: number;
  ratio: number; // height / width
  render: (item: T, front: boolean) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const w = useFitWidth(width);
  const front = items.findIndex((i) => i.id === frontId);
  const order = [...items.slice(front < 0 ? 0 : front), ...items.slice(0, front < 0 ? 0 : front)];
  const rank = (id: string) => order.findIndex((i) => i.id === id);
  const h = w * ratio;
  return (
    <div className="relative" style={{ width: w, height: h + 36 }}>
      {items.map((it) => {
        const r = rank(it.id);
        return (
          <motion.div
            key={it.id}
            className="absolute left-0 top-0"
            style={{ width: w, height: h, zIndex: items.length - r, transformOrigin: "50% 100%" }}
            initial={false}
            animate={{ rotate: TILT[r % TILT.length], x: r * 10, y: r * 8, scale: 1 - r * 0.025 }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            {render(it, r === 0)}
          </motion.div>
        );
      })}
    </div>
  );
}
