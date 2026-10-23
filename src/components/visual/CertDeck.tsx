"use client";
import { usePathname, useRouter } from "next/navigation";
import { certificates } from "@/content/certificates";
import { Fan } from "./Fan";
import { FallbackImage } from "./FallbackImage";
import { EmptyFrame } from "./EmptyFrame";
import { useVisual } from "./VisualContext";
import type { LightboxItem } from "./Lightbox";

/** Certs: fanned deck of certificate cards. The selected one slides to the top; clicking it opens the lightbox. */
export function CertDeck({ onOpen }: { onOpen: (items: LightboxItem[], i: number) => void }) {
  const { hot } = useVisual();
  const router = useRouter();
  const routeSlug = usePathname().split("/")[2];
  if (!certificates.length) return <EmptyFrame ratio={0.72} width={440} />;
  const items = certificates.map((c) => ({ ...c, id: c.slug }));
  const frontId = hot?.group === "cert" ? hot.id : (routeSlug ?? items[0].id);
  const lb = items.map((c) => ({ src: c.image, alt: c.name, ratio: 1600 / 1131 }));
  return (
    <Fan
      items={items}
      frontId={frontId}
      width={440}
      ratio={1131 / 1600}
      render={(c, front) => (
        <button
          type="button"
          aria-label={front ? `Open certificate: ${c.name}` : `Select certificate: ${c.name}`}
          onClick={() => (front ? onOpen(lb, items.indexOf(c)) : router.push(`/certs/${c.slug}`))}
          className="relative block h-full w-full overflow-hidden rounded-md border border-line3 shadow-[0_6px_24px_rgba(0,0,0,.5)]"
          style={{ background: "var(--card)" }}
        >
          <FallbackImage src={c.image} alt={c.name} sizes="440px" />
        </button>
      )}
    />
  );
}
