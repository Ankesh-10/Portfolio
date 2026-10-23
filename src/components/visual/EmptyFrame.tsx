/** Keeps the frame the same size when a list is empty, so there is no void (spec §7). */
export function EmptyFrame({ ratio = 1.25, width = 320 }: { ratio?: number; width?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[14px] border border-line3"
      style={{ width, height: width * ratio, background: "var(--card)" }}
    >
      <p className="m-0 px-6 text-center text-[length:var(--fs-ui)] text-t3">
        # nothing here yet — check back soon
      </p>
    </div>
  );
}
