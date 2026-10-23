import type { Line as LineT } from "@/lib/lines";
import { Line } from "./Line";

// Space above a line: commands open a new block; the lead sits apart from the name above it.
const gap: Partial<Record<LineT["t"], number>> = { prompt: 32, lead: 24 };

/** The buffer: output blocks on a quiet column, with breathing room between commands (spec §6.3). */
export function Buffer({ title, lines }: { title: string; lines: LineT[] }) {
  return (
    <div className="buf-scroll h-full overflow-y-auto overflow-x-hidden" tabIndex={-1}>
      <h1 className="sr-only">{title}</h1>
      <div className="px-6 pb-10 pt-4 max-md:px-4">
        {lines.map((l, i) => (
          <div key={i} className="min-w-0" style={{ marginTop: i === 0 ? 0 : (gap[l.t] ?? 4) }}>
            <Line line={l} />
          </div>
        ))}
      </div>
    </div>
  );
}
