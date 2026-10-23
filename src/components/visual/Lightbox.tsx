"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export type LightboxItem = { src: string; alt: string; aspect: number };

/** Full-screen view for screenshots, certificates and photos (spec §6.9). A modal <dialog>:
 *  focus starts on `✕ close`, is trapped inside, and returns to the thumbnail on close.
 *  The image scales from its thumbnail (220ms ease-out) and back on close (160ms). */
export function Lightbox({
  items,
  start,
  origin,
  onClose,
}: {
  items: LightboxItem[];
  start: number;
  origin: DOMRect | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [i, setI] = useState(start);
  const [closing, setClosing] = useState(false);
  const reduce = useReducedMotion();
  const item = items[i];

  // Target box: as large as fits 90vw × 85vh at the item's aspect ratio.
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(vw * 0.9, vh * 0.85 * item.aspect, 1400);
  const h = w / item.aspect;
  const fromThumb =
    origin && i === start && !reduce
      ? {
          x: origin.left + origin.width / 2 - vw / 2,
          y: origin.top + origin.height / 2 - vh / 2,
          scale: origin.width / w,
          opacity: 1,
        }
      : { x: 0, y: 0, scale: reduce ? 1 : 0.96, opacity: 0 };

  useEffect(() => {
    const d = dialog.current!;
    const opener = document.activeElement as HTMLElement | null;
    d.showModal();
    return () => {
      if (d.open) d.close();
      opener?.focus();
    };
  }, []);

  const close = () => setClosing(true);
  const step = (d: number) => setI((x) => (x + d + items.length) % items.length);

  return (
    <dialog
      ref={dialog}
      aria-label={item.alt}
      className="lightbox fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onKeyDown={(e) => {
        // `✕ close` is the only control, so Tab stays on it (focus is trapped, spec §6.9).
        if (e.key === "Tab") {
          e.preventDefault();
          closeBtn.current?.focus();
        } else if (e.key === "ArrowRight" && items.length > 1) step(1);
        else if (e.key === "ArrowLeft" && items.length > 1) step(-1);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop) close();
      }}
    >
      <motion.div
        data-backdrop="1"
        className="absolute inset-0 bg-black/85"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.16 : 0.22, ease: "easeOut" }}
      />
      <button
        ref={closeBtn}
        type="button"
        autoFocus
        onClick={close}
        className="ylink absolute right-4 top-4 z-10 flex h-8 items-center px-2 text-[length:var(--fs-ui)]"
      >
        <span aria-hidden>✕ </span>close
      </button>
      <div
        data-backdrop="1"
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
      >
        <motion.div
          key={i}
          className="relative overflow-hidden rounded-sm border border-line3"
          style={{ width: w, height: h, background: "var(--card)" }}
          initial={fromThumb}
          animate={closing ? fromThumb : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: closing ? 0.16 : 0.22, ease: "easeOut" }}
          onAnimationComplete={() => closing && onClose()}
        >
          <Image src={item.src} alt={item.alt} fill sizes="90vw" className="mono object-contain" />
        </motion.div>
        <p className="m-0 text-[length:var(--fs-ui)] text-t2">
          {item.alt}
          {items.length > 1 && (
            <span className="text-t3">
              {"  "}
              {i + 1} / {items.length} · ← →
            </span>
          )}
        </p>
      </div>
    </dialog>
  );
}
