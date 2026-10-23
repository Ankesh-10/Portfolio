"use client";
import { usePathname } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { sortedProjects } from "@/content/projects";
import { FallbackImage } from "./FallbackImage";
import { EmptyFrame } from "./EmptyFrame";
import { useVisual } from "./VisualContext";
import type { LightboxItem } from "./Lightbox";

/** Projects: screenshot of the hovered, focused or selected project in a minimal window frame, crossfading. */
export function ProjectPreview({ onOpen }: { onOpen: (items: LightboxItem[], i: number) => void }) {
  const { hot } = useVisual();
  const reduce = useReducedMotion();
  const routeSlug = usePathname().split("/")[2];
  const list = sortedProjects();
  if (!list.length) return <EmptyFrame ratio={0.7} width={440} />;
  const slug = hot?.group === "project" ? hot.id : (routeSlug ?? list[0].slug);
  const idx = Math.max(
    0,
    list.findIndex((p) => p.slug === slug),
  );
  const p = list[idx];
  const lb = list.map((x) => ({ src: x.image, alt: x.name, ratio: 16 / 10 }));
  return (
    <div
      className="w-full max-w-[560px] overflow-hidden rounded-xl border border-line3"
      style={{ background: "var(--card)" }}
    >
      <div className="flex h-8 items-center border-b border-line1 bg-[var(--term-chrome)] px-3">
        <div aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-t4/60" />
          ))}
        </div>
        <span aria-hidden className="mx-auto text-[length:var(--fs-ui)] text-t3">
          {p.name}
        </span>
        <span className="w-10" />
      </div>
      <button
        type="button"
        aria-label={`Open screenshot of ${p.name}`}
        onClick={() => onOpen(lb, idx)}
        className="relative block aspect-[16/10] w-full cursor-zoom-in"
      >
        <AnimatePresence initial={false}>
          <m.span
            key={p.slug}
            className="absolute inset-0 block"
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <FallbackImage src={p.image} alt={p.name} sizes="560px" gray={false} />
          </m.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
