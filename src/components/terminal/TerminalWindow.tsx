import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { TmuxBar } from "./TmuxBar";
import { VimStatusLine } from "./VimStatusLine";
import { CommandLine } from "./CommandLine";

/** DOM order (spec §6.2/§13): header → nav → main → footer. CSS grid places the nav at the bottom. */
export function TerminalWindow({
  children,
  build,
}: {
  children: ReactNode;
  build: { sha?: string; iso: string };
}) {
  return (
    <div
      className="term-win relative z-20 min-w-0 flex-1 overflow-hidden rounded-xl border border-line2 bg-[var(--term-bg)] max-md:rounded-none max-md:border-0"
      style={{
        margin: "var(--win-margin)",
        marginLeft: 0,
        display: "grid",
        gridTemplateRows: "36px minmax(0,1fr) 28px 32px auto",
        gridTemplateAreas: '"title" "buffer" "status" "cmd" "tmux"',
      }}
    >
      <TitleBar />
      <TmuxBar />
      <main
        id="content"
        tabIndex={-1}
        className="min-h-0 pt-2 focus-visible:outline-offset-[-2px]"
        style={{ gridArea: "buffer", container: "buf / size" }}
      >
        {children}
      </main>
      <footer className="contents">
        <VimStatusLine build={build} />
        <CommandLine />
      </footer>
    </div>
  );
}
