"use client";
import { setMotion, useMotion } from "@/lib/motion-store";

/** `‖` pause control (WCAG 2.2.2). Real <button aria-pressed>; `pressed` = motion paused. */
export function MotionToggle({ className = "" }: { className?: string }) {
  const m = useMotion();
  return (
    <button
      type="button"
      aria-pressed={m === "off"}
      aria-label="Pause motion"
      title={m === "off" ? "motion paused" : "pause motion"}
      onClick={() => setMotion(m === "off" ? "on" : "off")}
      className={`flex h-8 items-center px-1 hover:text-yellow ${m === "off" ? "text-t1" : "text-t3"} ${className}`}
    >
      <span aria-hidden>{m === "off" ? "▶" : "‖"}</span>
    </button>
  );
}
