"use client";
import { useState } from "react";
import Image from "next/image";

/** Image that falls back to the item's name centred on --card at the same aspect ratio (spec §13). */
export function FallbackImage({
  src,
  alt,
  sizes,
  gray = true,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  gray?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center p-4 text-center text-[length:var(--fs-ui)] text-t3"
        style={{ background: "var(--card)" }}
      >
        {alt}
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      style={gray ? { filter: "grayscale(1) contrast(1.1)" } : undefined}
    />
  );
}
