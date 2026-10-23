import type { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { TmuxBar } from "./TmuxBar";
import { PhoneBar, PhoneTopBar, PhoneCommand } from "./Phone";
import { VimStatusLine } from "./VimStatusLine";
import { CommandLine } from "./CommandLine";
import { CommandPalette } from "./CommandPalette";
import { LiveRegion } from "./LiveRegion";

/** DOM order (spec §6.2/§13): header → nav → main → footer. CSS grid places the nav at the bottom. */
export function TerminalWindow({
  children,
  build,
}: {
  children: ReactNode;
  build: { sha?: string; iso: string };
}) {
  return (
    <div className="term-win term-grid relative z-20 min-w-0 flex-1 rounded-xl border border-line2 bg-[var(--term-bg)]">
      <PhoneTopBar />
      <TitleBar />
      <TmuxBar />
      <main
        id="content"
        tabIndex={-1}
        className="term-main relative min-h-0 pt-2 focus-visible:outline-offset-[-2px]"
      >
        {children}
      </main>
      <PhoneBar />
      <PhoneCommand />
      <LiveRegion />
      <CommandPalette />
      <footer className="contents">
        <VimStatusLine build={build} />
        <CommandLine />
      </footer>
    </div>
  );
}
