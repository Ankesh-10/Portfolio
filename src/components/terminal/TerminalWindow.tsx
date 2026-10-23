import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { Nav } from "./Nav";
import { CommandLine } from "./CommandLine";

/** DOM order (spec §6.2/§13): header → nav → main → footer. CSS grid places the nav in the bottom bar. */
export function TerminalWindow({ children }: { children: ReactNode }) {
  return (
    <div
      className="term-win relative z-20 min-w-0 flex-1 overflow-hidden rounded-[10px] border border-line1 bg-[var(--term-bg)] max-md:h-full max-md:rounded-none max-md:border-0"
      style={{ margin: "var(--win-margin)", marginLeft: 0 }}
    >
      <div className="term-grid h-full">
        <TitleBar />
        <Nav />
        <main
          id="content"
          tabIndex={-1}
          className="min-h-0 focus-visible:outline-offset-[-2px]"
          style={{ gridArea: "buffer", container: "buf / size" }}
        >
          {children}
        </main>
        <footer className="contents">
          <CommandLine />
        </footer>
      </div>
    </div>
  );
}
