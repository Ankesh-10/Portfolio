"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { tabFor, wideTabs } from "@/lib/routes";
import { IdBadge } from "./IdBadge";

const copy: Record<string, string> = {
  about: "photos",
  projects: "screenshots",
  skills: "graphs",
  certs: "certificates",
};

/** Left visual (spec §6.7). Phase 4 swaps the placeholder frames for PhotoStack / ProjectPreview / SkillGraphs / CertDeck. */
export function VisualPanel({ qr }: { qr: boolean[][] }) {
  const pathname = usePathname();
  const slug = tabFor(pathname)?.slug ?? "";
  const reduce = useReducedMotion();
  const hasBadge = slug === "home" || slug === "contact";
  const [flipped, setFlipped] = useState(slug === "contact");
  const [hintGone, setHintGone] = useState(false); // `# drag me · ↻ flip` goes away after the first drag or flip

  // Home ↔ contact: the badge stays and flips in place (spec §9). Adjusted during render, not in an effect.
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    if (slug === "contact") setFlipped(true);
    else if (slug === "home") setFlipped(false);
  }

  const wide = wideTabs.has(slug);

  return (
    <aside
      id="visual"
      aria-label="Visual"
      tabIndex={-1}
      className="relative z-10 shrink-0 overflow-clip max-md:hidden"
      style={{
        order: -1,
        width: wide ? "clamp(420px, 42vw, 640px)" : "var(--visual-w)",
        transition: reduce ? "none" : "width 180ms cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      <AnimatePresence>
        {hasBadge ? (
          <IdBadgeSlot
            key="badge"
            flipped={flipped}
            onFlip={() => {
              setHintGone(true);
              setFlipped((f) => !f);
            }}
            onDrag={() => setHintGone(true)}
            showHint={slug === "home" && !hintGone}
            qr={qr}
          />
        ) : (
          <motion.div
            key={slug || "x"}
            className="flex h-full items-start justify-center px-8 pb-[var(--win-margin)] pt-[var(--win-margin)]"
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <div
              className="badge-face flex aspect-[4/5] max-h-full w-full max-w-[420px] items-center justify-center rounded-[14px] border border-line3 text-t3"
              style={{ background: "var(--card)" }}
            >
              <p className="m-0 px-6 text-center text-[length:var(--fs-ui)]">
                # {copy[slug] ?? "visual"} go here
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function IdBadgeSlot({
  showHint,
  ...props
}: {
  flipped: boolean;
  onFlip: () => void;
  onDrag: () => void;
  showHint: boolean;
  qr: boolean[][];
}) {
  return (
    <div className="absolute inset-x-0 top-0 [--badge-w:296px] [--photo-h:370px] [--rest-offset:clamp(96px,14vh,160px)] max-[1279px]:[--badge-w:272px] max-[1279px]:[--photo-h:300px] [@media(max-height:820px)]:[--badge-w:252px] [@media(max-height:820px)]:[--photo-h:200px]">
      <IdBadge {...props} />
      {showHint && (
        <p className="m-0 mt-5 text-center text-[length:var(--fs-ui)] text-t3">
          <span aria-hidden># </span>drag me · ↻ flip
        </p>
      )}
    </div>
  );
}
