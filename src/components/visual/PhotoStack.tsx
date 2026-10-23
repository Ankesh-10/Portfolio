"use client";
import { aboutPhotos } from "@/content/about";
import { Fan } from "./Fan";
import { FallbackImage } from "./FallbackImage";
import { EmptyFrame } from "./EmptyFrame";
import { useVisual } from "./VisualContext";
import type { LightboxItem } from "./Lightbox";

/** About: polaroid-style B&W stack. The photo of the hovered/focused timeline entry comes to the front. */
export function PhotoStack({ onOpen }: { onOpen: (items: LightboxItem[], i: number) => void }) {
  const { hot } = useVisual();
  if (!aboutPhotos.length) return <EmptyFrame />;
  const items = aboutPhotos.map((p) => ({ ...p, id: p.src }));
  const frontId = hot?.group === "photo" ? hot.id : items[0].id;
  const lb = items.map((p) => ({ src: p.src, alt: p.alt, ratio: 4 / 5 }));
  return (
    <Fan
      items={items}
      frontId={frontId}
      width={300}
      ratio={1.22}
      render={(p, front) => (
        <button
          type="button"
          tabIndex={front ? 0 : -1}
          aria-label={`Open photo: ${p.alt}`}
          onClick={() => onOpen(lb, items.indexOf(p))}
          className="block h-full w-full rounded-sm border border-line3 bg-[#151515] p-3 pb-9 shadow-[0_6px_24px_rgba(0,0,0,.5)]"
        >
          <span className="relative block h-full w-full overflow-hidden">
            <FallbackImage src={p.src} alt={p.alt} sizes="300px" />
          </span>
          <span
            aria-hidden
            className="absolute bottom-2.5 left-3 text-[length:var(--fs-micro)] tracking-[.12em] text-t4"
          >
            {p.alt.toUpperCase()}
          </span>
        </button>
      )}
    />
  );
}
