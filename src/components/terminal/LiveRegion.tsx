"use client";
import { useTerminal } from "./TerminalProvider";

/** One polite live region for command results (spec §13). Never announces typing or streaming. */
export function LiveRegion() {
  const { announcement } = useTerminal();
  return (
    <div role="status" aria-live="polite" aria-atomic className="sr-only">
      {announcement}
    </div>
  );
}
