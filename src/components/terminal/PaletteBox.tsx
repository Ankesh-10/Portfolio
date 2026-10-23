"use client";
import { useEffect, useId, useRef, useState } from "react";
import { paletteItems } from "@/lib/commands";

export function Palette({ onClose, run }: { onClose: () => void; run: (c: string) => void }) {
  const id = useId();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const items = paletteItems(q);

  useEffect(() => input.current?.focus(), []);

  const choose = (i: number) => {
    const it = items[i];
    if (!it) return;
    onClose();
    run(it.cmd);
  };

  return (
    <div
      className="palette-in absolute inset-x-3 bottom-[104px] z-40 mx-auto max-w-[560px] overflow-hidden rounded-lg border border-line3 bg-[#0c0c0c] shadow-[0_8px_32px_rgba(0,0,0,.6)]"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="flex items-center gap-2 border-b border-line1 px-3 text-[length:var(--fs-ui)] leading-4">
        <span aria-hidden className="text-t3">
          /
        </span>
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-activedescendant={items.length ? `${id}-${active}` : undefined}
          aria-label="Search commands"
          autoComplete="off"
          spellCheck={false}
          value={q}
          placeholder="type a command or section"
          className="cmd-input h-9 min-w-0 flex-1 bg-transparent text-t1 outline-none placeholder:text-t3 focus-visible:outline-none"
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (items.length ? (a + 1) % items.length : 0));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(active);
            }
          }}
        />
      </div>
      <ul id={`${id}-list`} role="listbox" aria-label="Commands" className="m-0 list-none p-0">
        {items.map((it, i) => (
          <li
            key={it.cmd}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(i)}
            className={`flex min-h-8 cursor-pointer items-center border-l-2 px-3 text-[length:var(--fs-ui)] leading-4 ${
              i === active ? "border-yellow text-t1" : "border-transparent text-t2"
            }`}
          >
            {it.desc}
          </li>
        ))}
        {!items.length && (
          <li className="px-3 py-2 text-[length:var(--fs-ui)] leading-4 text-t3">
            no match — try help
          </li>
        )}
      </ul>
    </div>
  );
}
