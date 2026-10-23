"use client";
import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});

/** Live IST clock — decorative, aria-hidden. Rendered after mount to avoid a hydration mismatch. */
export function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span aria-hidden className="tm-clock min-w-[8ch] text-right text-t3">
      {t && `${t} IST`}
    </span>
  );
}
