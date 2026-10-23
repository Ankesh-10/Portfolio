"use client";
import { useEffect, useRef } from "react";
import { FallbackImage } from "./FallbackImage";

export type LightboxItem = { src: string; alt: string; ratio: number }; // ratio = width / height

/** Modal <dialog> (spec §6.9): Esc / ✕ close / backdrop click, ←/→ step, focus trapped and restored natively. */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const item = items[index];

  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
    close.current?.focus();
    return () => d.close();
  }, []);

  const step = (dir: 1 | -1) => onIndex((index + dir + items.length) % items.length);

  return (
    <dialog
      ref={ref}
      aria-label={item.alt}
      className="lightbox-in fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-t2 backdrop:bg-black/85"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (items.length > 1 && e.key === "ArrowRight") step(1);
        if (items.length > 1 && e.key === "ArrowLeft") step(-1);
      }}
    >
      <button
        ref={close}
        type="button"
        onClick={onClose}
        className="ylink absolute right-4 top-4 z-10 h-10 px-3 text-[length:var(--fs-ui)]"
      >
        <span aria-hidden>✕ </span>close
      </button>
      <div
        className="flex h-full w-full items-center justify-center p-12"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="relative max-h-full max-w-full"
          style={{
            aspectRatio: item.ratio,
            height: `min(100%, calc((100vw - 96px) / ${item.ratio}))`,
          }}
        >
          <FallbackImage key={item.src} src={item.src} alt={item.alt} sizes="90vw" gray={false} />
        </div>
      </div>
      {items.length > 1 && (
        <p
          className="absolute bottom-4 left-0 right-0 m-0 text-center text-[length:var(--fs-ui)] text-t3"
          aria-hidden
        >
          ← {index + 1} / {items.length} →
        </p>
      )}
    </dialog>
  );
}
