"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markNudgeDone } from "./Nudge";

/** Lives in the shell so it sees every navigation, including ones that unmount the home page. */
export function NavTracker() {
  const pathname = usePathname();
  const first = useRef(pathname);
  useEffect(() => {
    if (pathname !== first.current) markNudgeDone();
  }, [pathname]);
  return null;
}
