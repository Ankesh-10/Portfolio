"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markNudgeDone } from "./Nudge";
import { useTerminal } from "./TerminalProvider";
import { tabFor } from "@/lib/routes";
import { projects } from "@/content/projects";
import { certificates } from "@/content/certificates";

const counts: Record<string, number> = { projects: projects.length, certs: certificates.length };

/**
 * Lives in the shell so it sees every navigation (spec §13 "Focus on route change"):
 * - from a tab or the command line → focus stays put and the live region announces the route;
 * - from a link in the content, the palette or a 404 → focus moves to <main>, no announcement.
 */
export function NavTracker() {
  const pathname = usePathname();
  const { announce } = useTerminal();
  const first = useRef(pathname);
  useEffect(() => {
    if (pathname === first.current) return;
    markNudgeDone();
    const el = document.activeElement;
    const fromChrome = !!el && (el.id === "cmdline" || !!el.closest("#sections"));
    const tab = tabFor(pathname);
    if (fromChrome) {
      if (tab) {
        const n = pathname.split("/").length === 2 ? counts[tab.slug] : undefined;
        announce(
          `${tab.label[0].toUpperCase()}${tab.label.slice(1)}${n !== undefined ? `, ${n} items` : ""}`,
        );
      }
    } else document.getElementById("content")?.focus();
  }, [pathname, announce]);
  return null;
}
