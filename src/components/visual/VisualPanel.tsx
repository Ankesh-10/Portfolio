"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { tabFor, wideTabs } from "@/lib/routes";
import { IdBadge } from "./IdBadge";

// Placeholder frames until Phase 4 ships the real visuals. Same card language as the badge.
const copy: Record<string, { file: string; what: string }> = {
  about: { file: "~/about/photos", what: "photos" },
  projects: { file: "~/projects/preview.png", what: "project screenshots" },
  skills: { file: "~/skills/graphs", what: "activity graphs" },
  certs: { file: "~/certs/scans", what: "certificate scans" },
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
            className="flex h-full items-center justify-center p-8"
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <Placeholder {...(copy[slug] ?? { file: "~", what: "visuals" })} />
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
        <p className="m-0 mt-4 px-6 text-[length:var(--fs-ui)] text-t3">
          <span aria-hidden># </span>drag me · ↻ flip
        </p>
      )}
    </div>
  );
}

const Tick = ({ cls }: { cls: string }) => (
  <span aria-hidden className={`absolute h-2 w-2 border-t4 ${cls}`} />
);

function Placeholder({ file, what }: { file: string; what: string }) {
  return (
    <figure
      className="relative m-0 flex aspect-[4/5] w-full max-w-[420px] flex-col gap-3 rounded-[14px] border border-line3 p-4"
      style={{ background: "var(--card)" }}
    >
      <Tick cls="left-1.5 top-1.5 border-l border-t" />
      <Tick cls="right-1.5 top-1.5 border-r border-t" />
      <Tick cls="bottom-1.5 left-1.5 border-b border-l" />
      <Tick cls="bottom-1.5 right-1.5 border-b border-r" />
      <div
        aria-hidden
        translate="no"
        className="flex items-center justify-between gap-4 text-[length:var(--fs-micro)] tracking-[.14em] text-t4"
      >
        <span className="truncate">{file}</span>
        <span>PENDING</span>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-sm border border-line3 bg-[#0a0a0a]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)",
          }}
        />
        <figcaption className="relative px-6 text-center text-[length:var(--fs-ui)] leading-5 text-t3">
          <span aria-hidden># </span>
          {what} coming soon
        </figcaption>
      </div>
    </figure>
  );
}
