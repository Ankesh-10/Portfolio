"use client";
import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

// Motion's feature set (animations, drag, gestures) loads after first paint instead of weighing down the
// initial bundle (spec §13: JS < 150KB gzipped). Components use `m.*`; `strict` fails loudly on a stray `motion.*`.
const features = () => import("./motionFeatures").then((m) => m.default);

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      {children}
    </LazyMotion>
  );
}
