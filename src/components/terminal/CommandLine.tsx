"use client";
import { useCmdInput } from "./useCmdInput";
import { useTerminal } from "./TerminalProvider";

/** The command line (spec §6.6, §8): Enter runs, Tab completes, ↑/↓ walk history, Esc blurs. */
export function CommandLine() {
  const { run, openPalette } = useTerminal();
  const input = useCmdInput((e) => e.currentTarget.blur());

  return (
    <div className="term-cmd flex h-8 items-center gap-2 bg-[var(--term-chrome)] px-3 text-[length:var(--fs-ui)] leading-4 max-md:hidden">
      <label htmlFor="cmdline" className="text-t3">
        <span aria-hidden>:</span>
        <span className="sr-only">Command line</span>
      </label>
      <input
        id="cmdline"
        className="cmd-input min-w-0 flex-1 bg-transparent text-t1 outline-none focus-visible:outline-none"
        value={input.value}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        onChange={(e) => input.onChange(e.target.value)}
        onKeyDown={input.onKeyDown}
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
