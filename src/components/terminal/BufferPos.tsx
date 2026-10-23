"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Pos = { line: number; where: string };

function measure(): Pos | null {
  const el = document.querySelector<HTMLElement>(".buf-scroll");
  if (!el) return null;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const top = el.getBoundingClientRect().top;
  // Top visible line = first numbered row whose bottom is below the buffer's top edge.
  let line = 1;
  for (const g of el.querySelectorAll<HTMLElement>("[data-ln]"))
    if (g.getBoundingClientRect().bottom > top + 1) {
      line = Number(g.dataset.ln);
      break;
    }
  const max = scrollHeight - clientHeight;
  const where =
    max <= 1
      ? "All"
      : scrollTop <= 1
        ? "Top"
        : scrollTop >= max - 1
          ? "Bot"
          : `${Math.round((scrollTop / max) * 100)}%`;
  return { line, where };
}

/** vim's `line:col` and `All/Top/Bot/NN%`, from the buffer's real scroll position (spec §4). */
export function BufferPos() {
  const path = usePathname();
  const [pos, setPos] = useState<Pos | null>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPos(measure()));
    };
    update();
    document.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    // New command output changes the height without a scroll event.
    const mo = new MutationObserver(update);
    const main = document.getElementById("content");
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      mo.disconnect();
    };
  }, [path]);
  if (!pos) return null;
  return (
    <>
      <span>{pos.line}:1</span>
      <span>{pos.where}</span>
    </>
  );
}
