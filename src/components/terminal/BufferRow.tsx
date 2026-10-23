import type { Line as LineT } from "@/lib/lines";
import type { Spec } from "@/lib/timeline";
import { Line, gutterLh } from "./Line";

/** One buffer line: gutter number + content (spec §6.3). Shared by page output and session output.
 *  `rv` marks it for the reveal CSS (spec §9): its kind and size, plus its timing as CSS vars. */
export function BufferRow({
  line,
  n,
  first,
  latest,
  session,
  spec,
  vars,
}: {
  line: LineT;
  n: number;
  first: boolean;
  latest: boolean;
  session?: boolean;
  spec: Spec;
  vars?: Record<string, string>;
}) {
  const prompt = line.t === "prompt";
  // Session output reveals on its own (`rvs`), so the page's reveal state never cancels it.
  const base = session ? "rvs" : "rv";
  return (
    <div
      className={`${base} ${base}-${spec.k} grid grid-cols-[48px_1fr] pr-6 max-md:grid-cols-[32px_1fr] max-md:pr-4 ${session && prompt ? "sess-prompt" : ""}`}
      data-k={spec.k}
      data-n={spec.n}
      style={
        {
          marginTop: prompt && !first ? 8 : 0,
          "--n-chars": Math.max(1, spec.n),
          ...vars,
        } as React.CSSProperties
      }
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
