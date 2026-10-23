import type { Line } from "./lines";
import type { Slot, Spec } from "./timeline";

// Bridges buffer lines and the pure schedule() (spec §9): what each line is, and its slot as CSS vars.

/** Lines whose list rows stream one by one (each <li> is a logical line). */
const listRows = (l: Line): number | undefined => {
  switch (l.t) {
    case "featured":
    case "projects":
    case "gitlog":
      return l.rows.length;
    case "tree":
      return l.rows.length;
    case "history":
      return l.items.length;
  }
};

export function specOf(l: Line): Spec {
  if (l.t === "prompt") return { k: "p", n: l.cmd.length };
  if (l.t === "figlet") return { k: "f", n: 1 };
  if (l.t === "lead") return { k: "l", n: l.text.length };
  return { k: "o", n: listRows(l) ?? 1 };
}

/** `--{p}t: 340ms` etc. The unprefixed set is what the reveal CSS reads. */
export function slotVars(s: Slot, prefix = ""): Record<string, string> {
  return {
    [`--${prefix}t`]: `${s.t}ms`,
    [`--${prefix}d`]: `${s.d}ms`,
    [`--${prefix}s`]: `${s.s}ms`,
    [`--${prefix}h`]: `${s.h}ms`,
  };
}
