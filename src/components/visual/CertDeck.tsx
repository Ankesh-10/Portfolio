"use client";
import { motion, useReducedMotion } from "motion/react";
import type { Certificate } from "@/content/types";
import { setVisual } from "@/lib/visual-store";
import { Shot } from "./Shot";
import { Empty } from "./ProjectPreview";

/** Certs tab (spec §7.4): a fanned deck of monochrome certificate cards. The selected one slides
 *  to the top; clicking it opens the lightbox, clicking a card behind brings it forward. */
export function CertDeck({
  certs,
  selected,
  path,
  exists,
  onOpen,
}: {
  certs: Certificate[];
  selected: string | undefined;
  path: string;
  exists: (src: string) => boolean;
  onOpen: (slug: string, el: HTMLElement) => void;
}) {
  const reduce = useReducedMotion();
  if (!certs.length) return <Empty />;
  const top = certs.find((c) => c.slug === selected) ?? certs[0];
  const rest = certs.filter((c) => c !== top);
  const order = [...rest, top];
  return (
    <div className="relative flex h-full items-center justify-center p-8">
      {order.map((c, depth) => {
        const isTop = c === top;
        const k = rest.indexOf(c); // fan position for cards behind
        const fan = {
          rotate: (k - (rest.length - 1) / 2) * 5,
          y: 18 + k * 6,
          x: (k - (rest.length - 1) / 2) * 14,
        };
        const has = exists(c.image);
        const face = (
          <div className="relative aspect-[1.414] w-full overflow-hidden rounded-sm">
            <Shot
              src={c.image}
              alt={`${c.name} certificate`}
              exists={has}
              fit="contain"
              fallback={`${c.name} — ${c.issuer}`}
              sizes="(min-width: 1280px) 40vw, 400px"
            />
          </div>
        );
        return (
          <motion.div
            key={c.slug}
            className="absolute w-[min(440px,86%)] rounded-md border border-line3 p-2 shadow-[0_8px_24px_rgba(0,0,0,.6)]"
            style={{ background: "var(--card)", zIndex: depth, transformOrigin: "50% 100%" }}
            initial={false}
            animate={isTop ? { rotate: 0, x: 0, y: -16 } : fan}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
          >
            {isTop && has ? (
              <button
                type="button"
                className="block w-full cursor-zoom-in"
                aria-label={`Enlarge ${c.name} certificate`}
                onClick={(e) => onOpen(c.slug, e.currentTarget)}
              >
                {face}
              </button>
            ) : isTop ? (
              face
            ) : (
              <button
                type="button"
                className="block w-full cursor-pointer"
                aria-label={`Bring ${c.name} to the front`}
                onClick={() => setVisual(path, "cert", c.slug)}
              >
                {face}
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
