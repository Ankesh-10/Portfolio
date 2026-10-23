"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setVisual, type VisualKind } from "@/lib/visual-store";

/** One delegated listener: hover, focus or a tap on any `[data-visual]` row drives the left visual. */
export function VisualSync() {
  const path = usePathname();
  useEffect(() => {
    const on = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.("[data-visual]");
      if (!el) return;
      const [kind, ...rest] = el.getAttribute("data-visual")!.split(":");
      setVisual(path, kind as VisualKind, rest.join(":"));
    };
    document.addEventListener("pointerover", on);
    document.addEventListener("focusin", on);
    document.addEventListener("pointerdown", on);
    return () => {
      document.removeEventListener("pointerover", on);
      document.removeEventListener("focusin", on);
      document.removeEventListener("pointerdown", on);
    };
  }, [path]);
  return null;
}
