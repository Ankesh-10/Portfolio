"use client";
import { setMotion, useMotion } from "@/lib/motion-store";

/** `‖ motion` pause control (WCAG 2.2.2). Real <button aria-pressed>; `pressed` = motion paused. */
export function MotionToggle({ className = "" }: { className?: string }) {
  const m = useMotion();
  return (
    <button
      type="button"
      aria-pressed={m === "off"}
      aria-label="Pause motion"
      title="pause continuous motion"
      onClick={() => setMotion(m === "off" ? "on" : "off")}
      className={`h-8 items-center gap-1 whitespace-nowrap px-2 text-t3 transition-colors duration-150 hover:text-yellow focus-visible:text-yellow ${className}`}
    >
      <span aria-hidden>‖</span> motion{m === "off" ? " off" : ""}
    </button>
  );
}
