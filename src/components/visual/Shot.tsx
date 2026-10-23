import Image from "next/image";

/** An image in the visual area, always monochrome. A missing file shows its name centered in
 *  `--text-3` on the card at the same aspect ratio, so nothing shifts (spec §13 "Image fails"). */
export function Shot({
  src,
  alt,
  exists,
  fit = "cover",
  sizes,
  priority,
  fallback,
}: {
  src: string;
  alt: string;
  exists: boolean;
  fit?: "cover" | "contain";
  sizes: string;
  priority?: boolean;
  fallback?: string;
}) {
  if (!exists)
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-4 text-center text-[length:var(--fs-ui)] text-t3"
        style={{ background: "var(--card)" }}
      >
        {fallback ?? alt}
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`mono ${fit === "cover" ? "object-cover" : "object-contain"}`}
    />
  );
}
