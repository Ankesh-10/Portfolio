"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tabs } from "@/lib/routes";

const alias: Record<string, string> = {
  work: "projects",
  experience: "about",
  jobs: "about",
  education: "about",
};

const HINT = "type a page name, or press 0–5";

/** Phase-2 command line: navigation only. The parser/registry, history and palette are Phase 3 (spec §8). */
export function CommandLine() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");

  // Single-key shortcuts (0–5, `:`, `/`) only when no text field is focused (spec §8).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tab = tabs.find((t) => String(t.index) === e.key);
      if (tab) router.push(tab.href);
      else if (e.key === ":" || e.key === "/") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  function run(raw: string) {
    const cmd = raw.trim().replace(/^cd\s+~?\/?/, "");
    if (!cmd) return;
    const slug = alias[cmd] ?? cmd;
    const tab = tabs.find((t) => t.slug === slug);
    if (tab) {
      setNote("");
      router.push(tab.href + (alias[cmd] === "about" ? "#experience" : ""));
    } else {
      setNote(`not found: ${cmd}`);
    }
  }

  return (
    <div
      className="term-cmd flex h-11 min-w-0 items-center gap-3 px-6 text-[length:var(--fs-ui)] leading-4 max-md:px-4"
      style={{ gridArea: "cmd" }}
    >
      <label htmlFor="cmdline" className="text-t3">
        <span aria-hidden>❯</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline"
        ref={ref}
        className="cmd-input min-w-0 flex-1 bg-transparent text-t1 outline-none placeholder:text-t4 focus-visible:outline-none"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={HINT}
        aria-describedby="cmd-note"
        onChange={() => note && setNote("")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            run(e.currentTarget.value);
            e.currentTarget.value = "";
          } else if (e.key === "Escape") e.currentTarget.blur();
        }}
      />
      <span id="cmd-note" role="status" className="whitespace-nowrap text-t3">
        {note}
      </span>
    </div>
  );
}
