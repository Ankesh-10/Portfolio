"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Project } from "@/content/types";
import { Shot } from "./Shot";

/** Projects tab (spec §7.2): the selected project's screenshot in a minimal window frame,
 *  crossfading on change. Click opens the lightbox. */
export function ProjectPreview({
  project,
  exists,
  onOpen,
}: {
  project: Project | undefined;
  exists: boolean;
  onOpen: (el: HTMLElement) => void;
}) {
  const reduce = useReducedMotion();
  if (!project) return <Empty />;
  const body = (
    <AnimatePresence initial={false}>
      <motion.div
        key={project.slug}
        className="absolute inset-0"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
      >
        <Shot
          src={project.image}
          alt={`Screenshot of ${project.name}`}
          exists={exists}
          fallback={project.name}
          sizes="(min-width: 1280px) 42vw, 420px"
        />
      </motion.div>
    </AnimatePresence>
  );
  return (
    <div className="flex h-full flex-col justify-center p-8">
      <figure className="m-0 overflow-hidden rounded-[10px] border border-line3 bg-[#0b0b0b]">
        <div className="flex h-7 items-center gap-1.5 border-b border-line2 px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden className="h-2 w-2 rounded-full bg-t4/60" />
          ))}
          <span className="ml-2 truncate text-[length:var(--fs-ui)] text-t3">
            ~/projects/{project.slug}
          </span>
        </div>
        {exists ? (
          <button
            type="button"
            onClick={(e) => onOpen(e.currentTarget)}
            aria-label={`Enlarge screenshot of ${project.name}`}
            className="relative block aspect-[16/10] w-full cursor-zoom-in"
          >
            {body}
          </button>
        ) : (
          <div className="relative aspect-[16/10] w-full">{body}</div>
        )}
      </figure>
    </div>
  );
}

export function Empty() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div
        className="flex aspect-[16/10] w-full items-center justify-center rounded-[10px] border border-line3 text-[length:var(--fs-ui)] text-t3"
        style={{ background: "var(--card)" }}
      >
        # nothing here yet — check back soon
      </div>
    </div>
  );
}
