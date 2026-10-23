import { helpGroups } from "@/lib/commands";
import { Fragment } from "react";
import { RunButton } from "./RunButton";

/** `help` (spec §8): four groups, every command name clickable. */
export function Help() {
  return (
    <dl className="help-grid m-0">
      {helpGroups.map((g) => (
        <Fragment key={g.label}>
          {g.rows.map((r, i) => (
            <div key={i} className="help-row">
              {i === 0 ? (
                <dt className="help-group text-t3">{g.label}</dt>
              ) : (
                <dt className="help-group" aria-hidden />
              )}
              <dd className="help-cmds m-0 text-t2">
                {r.items.map((it, j) => (
                  <span key={it.label}>
                    {j > 0 && (
                      <span aria-hidden className="text-t4">
                        {" · "}
                      </span>
                    )}
                    <RunButton
                      cmd={it.run ?? it.fill ?? it.label}
                      label={it.label}
                      fill={!it.run}
                    />
                  </span>
                ))}
              </dd>
              <dd className="help-desc m-0 text-t2">{r.desc}</dd>
            </div>
          ))}
        </Fragment>
      ))}
    </dl>
  );
}

/** `history`: numbered like bash. Each entry runs again when clicked. */
export function History({ items }: { items: string[] }) {
  const w = String(items.length).length;
  return (
    <ol className="m-0 list-none p-0">
      {items.map((c, i) => (
        <li key={i} className="whitespace-pre text-t2">
          <span className="text-t3">{String(i + 1).padStart(w + 2)} </span>
          <RunButton cmd={c} label={c} />
        </li>
      ))}
    </ol>
  );
}
