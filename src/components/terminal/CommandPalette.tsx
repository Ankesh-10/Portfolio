"use client";
import { useEffect, useRef, useState } from "react";
import { filterPalette } from "@/lib/commands";

/** `/` palette (spec §6.8): an ARIA combobox above the command line. ↑/↓ move, Enter runs,
 *  Esc or a click outside closes. Focus returns to wherever it was when the palette opened. */
export function CommandPalette({
  onClose,
  onRun,
}: {
  onClose: () => void;
  onRun: (cmd: string) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const items = filterPalette(q);
  const cur = items[Math.min(active, items.length - 1)];

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const box = root.current;
    input.current?.focus();
    const away = (e: PointerEvent) => {
      if (!box?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", away);
    return () => {
      document.removeEventListener("pointerdown", away);
      // Running a navigation moves focus to <main>; otherwise go back where we came from.
      if (document.activeElement === document.body || box?.contains(document.activeElement))
        prev?.focus();
    };
  }, [onClose]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (Math.min(a, items.length - 1) + d + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cur) onRun(cur.cmd);
      else if (q.trim()) onRun(q.trim());
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") onClose();
  }

  return (
    <div
      ref={root}
      className="palette absolute bottom-full left-0 z-30 w-[min(640px,100%)] border border-line3 bg-[#0c0c0c] text-[length:var(--fs-ui)] leading-4"
    >
      <ul id="palette-list" role="listbox" aria-label="Commands" className="m-0 list-none p-0 py-1">
        {items.map((it) => {
          const on = it === cur;
          return (
            <li
              key={it.id}
              id={`pal-${it.id}`}
              role="option"
              aria-selected={on}
              onPointerMove={() => setActive(items.indexOf(it))}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onRun(it.cmd)}
              className={`relative grid cursor-pointer grid-cols-[22ch_1fr] gap-x-[2ch] px-3 py-1.5 ${on ? "bg-white/[0.04] text-t1" : "text-t2"}`}
            >
              {on && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-yellow" />}
              <span className="truncate">{it.label}</span>
              <span className={`truncate ${on ? "text-t2" : "text-t3"}`}>{it.desc}</span>
            </li>
          );
        })}
        {!items.length && (
          <li role="presentation" className="px-3 py-1.5 text-t3">
            # no match — Enter runs “{q.trim()}” as a command
          </li>
        )}
      </ul>
      <div className="flex h-8 items-center gap-2 border-t border-line2 px-3">
        <span aria-hidden className="text-t3">
          /
        </span>
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-autocomplete="list"
          aria-activedescendant={cur ? `pal-${cur.id}` : undefined}
          aria-label="Search commands"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="cmd-input min-w-0 flex-1 bg-transparent text-t1 outline-none focus-visible:outline-none"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <span aria-hidden className="whitespace-nowrap text-t3 max-md:hidden">
          ↑↓ move · ⏎ run · esc close
        </span>
      </div>
    </div>
  );
}
