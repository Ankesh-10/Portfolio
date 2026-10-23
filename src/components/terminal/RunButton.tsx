"use client";
import { useTerminal } from "./TerminalProvider";

/** A command name inside output (help): clicking runs it, like typing it. */
export function RunButton({ cmd, label }: { cmd: string; label?: string }) {
  const { run } = useTerminal();
  return (
    <button type="button" className="slink" onClick={() => run(cmd)}>
      {label ?? cmd}
    </button>
  );
}
