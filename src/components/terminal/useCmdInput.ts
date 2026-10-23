"use client";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { complete } from "@/lib/commands";
import { useTerminal } from "./TerminalProvider";

/** Shared behaviour of the desktop command line and the phone's docked one (spec §8 "Input behavior"). */
export function useCmdInput(onEscape: (e: KeyboardEvent<HTMLInputElement>) => void) {
  const { run, history } = useTerminal();
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
      cursor.current += dir;
      if (cursor.current < 0) cursor.current = 0;
      if (cursor.current >= history.length) {
        cursor.current = -1;
        setValue(draft.current);
        return;
      }
    }
    setValue(history[cursor.current]);
  };

  const onChange = (v: string) => {
    cursor.current = -1;
    setValue(v);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
    } else if (e.key === "Escape") onEscape(e);
  };

  return { value, onChange, onKeyDown };
}
