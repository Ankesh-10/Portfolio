"use client";
import { useRef, useState } from "react";
import { complete } from "@/lib/commands";
import { useTerminal } from "./TerminalProvider";

/** The command line (spec §6.6, §8): Enter runs, Tab completes, ↑/↓ walk history, Esc blurs. */
export function CommandLine() {
  const { run, history, openPalette } = useTerminal();
  const [value, setValue] = useState("");
  const cursor = useRef(-1); // -1 = not browsing history
  const draft = useRef("");

  const walk = (dir: -1 | 1) => {
    if (!history.length) return;
    if (cursor.current === -1) {
      if (dir === 1) return;
      draft.current = value;
      cursor.current = history.length - 1;
    } else {
      cursor.current += dir === -1 ? -1 : 1;
      if (cursor.current < 0) cursor.current = 0;
      if (cursor.current >= history.length) {
        cursor.current = -1;
        setValue(draft.current);
        return;
      }
    }
    setValue(history[cursor.current]);
  };

  return (
    <div
      className="flex h-8 items-center gap-2 bg-[var(--term-chrome)] px-3 text-[length:var(--fs-ui)] leading-4"
      style={{ gridArea: "cmd" }}
    >
      <label htmlFor="cmdline" className="text-t3">
        <span aria-hidden>:</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline"
        className="cmd-input min-w-0 flex-1 bg-transparent text-t1 outline-none focus-visible:outline-none"
        value={value}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        onChange={(e) => {
          cursor.current = -1;
          setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            run(value);
            setValue("");
            cursor.current = -1;
          } else if (e.key === "Tab") {
            e.preventDefault();
            setValue(complete(value));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            walk(-1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            walk(1);
          } else if (e.key === "Escape") e.currentTarget.blur();
        }}
      />
      <span className="ml-auto whitespace-nowrap text-t3 max-md:hidden">
        click a tab below <span aria-hidden>·</span>{" "}
        <button type="button" className="slink" onClick={() => run("help")}>
          help
        </button>{" "}
        <span aria-hidden>·</span>{" "}
        <button type="button" className="slink" onClick={openPalette}>
          / commands
        </button>
      </span>
    </div>
  );
}
