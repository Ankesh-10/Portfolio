"use client";
import { motion, useReducedMotion } from "motion/react";
import type { Photo } from "@/content/types";
import { Shot } from "./Shot";

// Fixed scatter per position in the stack (deterministic, so SSR and client agree).
const SCATTER = [
  { rotate: -4, x: -18, y: -10 },
  { rotate: 3.5, x: 16, y: 8 },
  { rotate: -1.5, x: -6, y: 16 },
  { rotate: 5, x: 12, y: -14 },
];

/** About tab (spec §7.1): 3–4 B&W polaroids. The photo of the hovered or focused timeline entry
 *  comes to the front. Clicking the front photo opens the lightbox. */
export function PhotoStack({
  photos,
  front,
  exists,
  onOpen,
}: {
  photos: Photo[];
  front: string | undefined;
  exists: (src: string) => boolean;
  onOpen: (src: string, el: HTMLElement) => void;
}) {
  const reduce = useReducedMotion();
  const top = photos.find((p) => p.src === front) ?? photos[0];
  // Back to front: everything but the top photo keeps its order, the top photo goes last.
  const order = [...photos.filter((p) => p !== top), top];
  return (
    <div className="relative flex h-full items-center justify-center p-8">
      {order.map((p, depth) => {
        const isTop = p === top;
        const s = SCATTER[photos.indexOf(p) % SCATTER.length];
        const has = exists(p.src);
        const card = (
          <>
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-line2 bg-[#0a0a0a]">
              <Shot src={p.src} alt={p.alt} exists={has} sizes="300px" />
            </div>
            <p className="m-0 pt-2 text-[length:var(--fs-ui)] leading-4 text-t3">{p.caption}</p>
          </>
        );
        return (
          <motion.div
            key={p.src}
            className="absolute w-[min(300px,72%)] border border-line3 p-3 pb-2 shadow-[0_8px_24px_rgba(0,0,0,.6)]"
            style={{ background: "var(--card)", zIndex: depth }}
            initial={false}
            animate={
              isTop
                ? { rotate: -1, x: 0, y: -6, scale: 1 }
                : { rotate: s.rotate, x: s.x, y: s.y, scale: 0.96 }
            }
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
            aria-hidden={!isTop}
          >
            {isTop && has ? (
              <button
                type="button"
                className="block w-full cursor-zoom-in text-left"
                aria-label={`Enlarge photo: ${p.alt}`}
                onClick={(e) => onOpen(p.src, e.currentTarget)}
              >
                {card}
              </button>
            ) : (
              card
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
