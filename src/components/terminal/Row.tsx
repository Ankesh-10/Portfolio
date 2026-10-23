import type { Line as LineT } from "@/lib/lines";
import { Line, gutterLh } from "./Line";

/** One numbered buffer line (gutter + content). Shared by page output and command output. */
export function Row({ line, n }: { line: LineT; n: number }) {
  const prompt = line.t === "prompt";
  return (
    <div
      data-prompt={prompt || undefined}
      className="buf-row grid grid-cols-[48px_1fr] pr-6 max-md:grid-cols-[32px_1fr] max-md:pr-4"
      style={{ marginTop: prompt && n > 1 ? 8 : 0 }}
    >
      <span
        aria-hidden
        className="buf-gut select-none pr-3 text-right text-[length:var(--fs-ui)]"
        style={{ lineHeight: `${gutterLh(line)}px` }}
      >
        {n}
      </span>
      <div className="min-w-0">
        <Line line={line} />
      </div>
    </div>
  );
}
