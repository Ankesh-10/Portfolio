import type { ReactNode } from "react";
import { Background } from "./Background";
import { TerminalWindow } from "../terminal/TerminalWindow";
import { NavTracker } from "../terminal/NavTracker";
import { VisualPanel } from "../visual/VisualPanel";

/** DOM order (spec §13): skip links → terminal window → visual aside. CSS places the aside on the left. */
export function Shell({
  children,
  build,
  qr,
}: {
  children: ReactNode;
  build: { sha?: string; iso: string };
  qr: boolean[][];
}) {
  return (
    <>
      <Background />
      <NavTracker />
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <a className="skip-link" href="#sections">
        Skip to sections
      </a>
      <a className="skip-link" href="#visual">
        Skip to visual
      </a>
      <div className="relative z-10 flex h-dvh w-full">
        <TerminalWindow build={build}>{children}</TerminalWindow>
        <VisualPanel qr={qr} />
      </div>
    </>
  );
}
