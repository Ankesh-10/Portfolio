"use client";
import { useEffect, useRef, useState } from "react";
import { IdBadge } from "./IdBadge";
import { useVisual } from "./VisualContext";

type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};

/** Full-size badge in a focus-trapping <dialog> (spec §12): flip, drag, and optional device tilt. */
export function BadgeSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const { qr } = useVisual();
  const [flipped, setFlipped] = useState(false);
  // Mounted only after a tap, so window is available. Android/desktop need no permission; iOS asks only
  // when the visitor taps `tilt to swing`.
  const O =
    typeof window === "undefined"
      ? undefined
      : (window as unknown as { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent;
  const canTilt = !!O;
  const [tilt, setTilt] = useState(!!O && typeof O.requestPermission !== "function");

  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
    close.current?.focus();
    return () => d.close();
  }, []);

  const askTilt = async () => {
    const O = (window as unknown as { DeviceOrientationEvent: OrientationCtor })
      .DeviceOrientationEvent;
    try {
      if ((await O.requestPermission?.()) === "granted") setTilt(true);
    } catch {}
  };

  return (
    <dialog
      ref={ref}
      aria-label="ID badge"
      className="lightbox-in fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-t2 backdrop:bg-black/85"
      onClose={onClose}
    >
      <button
        ref={close}
        type="button"
        onClick={onClose}
        className="ylink absolute right-2 top-2 z-10 h-11 px-3 text-[length:var(--fs-ui)]"
      >
        <span aria-hidden>✕ </span>close
      </button>
      <div className="relative flex h-full w-full justify-center [--badge-w:252px] [--photo-h:200px] [--rest-offset:56px]">
        <div className="w-full pt-0">
          <IdBadge flipped={flipped} onFlip={() => setFlipped((f) => !f)} qr={qr} device={tilt} />
        </div>
      </div>
      {canTilt && !tilt && (
        <button
          type="button"
          onClick={askTilt}
          className="slink absolute bottom-6 left-0 right-0 mx-auto h-11 w-fit px-3 text-[length:var(--fs-ui)]"
        >
          tilt to swing
        </button>
      )}
    </dialog>
  );
}
