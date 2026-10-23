"use client";
import dynamic from "next/dynamic";
import { useTerminal } from "./TerminalProvider";

// The palette (and its fuzzy-search data) loads the first time it is opened.
const Palette = dynamic(() => import("./PaletteBox").then((m) => m.Palette));

/** ARIA combobox (spec §6.8): `/` or the `/ commands` hint opens it; ↑/↓ move, Enter runs, Esc closes. */
export function CommandPalette() {
  const { paletteOpen, closePalette, run } = useTerminal();
  if (!paletteOpen) return null;
  return <Palette onClose={closePalette} run={run} />;
}
