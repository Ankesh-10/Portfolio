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

const HELP = `commands: ${["home", ...tabs.slice(1).map((t) => t.slug), "resume"].join(" ")} · keys: 0–5 switch tabs, : focus`;

/** Phase-2 command line: navigation, `help` and `resume`. The parser/registry, history and palette are Phase 3 (spec §8). */
export function CommandLine() {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");

  // Single-key shortcuts (0–5, `:`) only when no text field is focused (spec §8).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tab = tabs.find((t) => String(t.index) === e.key);
      if (tab) router.push(tab.href);
      else if (e.key === ":") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  function run(raw: string) {
    const cmd = raw
      .trim()
      .toLowerCase()
      .replace(/^cd\s+~?\/?/, "");
    if (!cmd) return;
    if (cmd === "help" || cmd === "?") return setNote(HELP);
    if (cmd === "resume" || cmd === "resume.pdf") {
      setNote("opening resume.pdf…");
      window.open("/resume.pdf", "_blank", "noopener");
      return;
    }
    const slug = alias[cmd] ?? (cmd === "~" ? "home" : cmd);
    const tab = tabs.find((t) => t.slug === slug);
    if (tab) {
      setNote("");
      router.push(tab.href + (alias[cmd] === "about" ? "#experience" : ""));
    } else {
      setNote(`command not found: ${cmd} — type help for the list`);
    }
  }

  return (
    <div
      translate="no"
      className="cmd-bar flex h-8 min-w-0 items-center gap-2 bg-[var(--term-chrome)] px-3 text-[length:var(--fs-ui)] leading-4"
      style={{ gridArea: "cmd" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.focus();
      }}
    >
      <label htmlFor="cmdline" className="cmd-colon text-t3">
        <span aria-hidden>:</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline"
        ref={ref}
        name="command"
        type="text"
        className="cmd-input min-w-0 flex-1 bg-transparent text-t1"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-describedby="cmd-status"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            run(e.currentTarget.value);
            e.currentTarget.value = "";
          } else if (e.key === "Escape") e.currentTarget.blur();
        }}
      />
      <span
        id="cmd-status"
        role="status"
        title={note || undefined}
        className={`ml-auto min-w-0 truncate text-t3 ${note ? "" : "max-md:hidden"}`}
      >
        {note || (
          <>
            click a tab below<span aria-hidden> · </span>
            <button
              type="button"
              className="slink"
              onClick={() => {
                run("help");
                ref.current?.focus();
              }}
            >
              help
            </button>
          </>
        )}
      </span>
    </div>
  );
}
