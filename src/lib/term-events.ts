"use client";
// Tiny event bus between the buffer (clickable commands), the palette and the command line,
// which owns the one command runner.

export const RUN_EVENT = "term:run";
export const PALETTE_EVENT = "term:palette";
export const MATRIX_EVENT = "term:matrix";

export type RunDetail = { cmd: string; fill?: boolean; source?: "palette" | "buffer" };

export function runCommand(cmd: string, opts: Omit<RunDetail, "cmd"> = {}) {
  window.dispatchEvent(new CustomEvent<RunDetail>(RUN_EVENT, { detail: { cmd, ...opts } }));
}

export function openPalette() {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}
