"use client";
import { runCommand } from "@/lib/term-events";

/** A command name in the buffer that runs when clicked (or fills the command line). */
export function RunButton({ cmd, label, fill }: { cmd: string; label: string; fill?: boolean }) {
  return (
    <button
      type="button"
      className="slink cursor-pointer"
      onClick={() => runCommand(cmd, { fill, source: "buffer" })}
    >
      {label}
    </button>
  );
}
