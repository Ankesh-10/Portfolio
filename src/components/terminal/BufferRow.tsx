import type { Line as LineT } from "@/lib/lines";
import { Line, gutterLh } from "./Line";

/** One buffer line: gutter number + content (spec §6.3). Shared by page output and session output. */
export function BufferRow({
  line,
  n,
  first,
  latest,
  session,
}: {
  line: LineT;
  n: number;
  first: boolean;
  latest: boolean;
  session?: boolean;
}) {
  const prompt = line.t === "prompt";
  return (
    <div
      className={`grid grid-cols-[48px_1fr] pr-6 max-md:grid-cols-[32px_1fr] max-md:pr-4 ${session && prompt ? "sess-prompt" : ""}`}
      style={{ marginTop: prompt && !first ? 8 : 0 }}
    >
      <span
        aria-hidden
        data-ln={n}
        className={`select-none pr-3 text-right text-[length:var(--fs-ui)] ${latest ? "gut-latest text-t3" : "text-t5"}`}
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
