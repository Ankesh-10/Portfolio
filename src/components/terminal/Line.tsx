import type { Line as LineT } from "@/lib/lines";
import { Prompt } from "./Prompt";
import { Figlet } from "../blocks/Figlet";
import { Table } from "../blocks/Table";
import { Links, Dirs } from "../blocks/Links";
import { Featured, Projects } from "../blocks/Rows";
import { GitLog } from "../blocks/GitLog";
import { Tree } from "../blocks/Tree";
import { Detail, Kv } from "../blocks/Detail";
import { Inlines } from "../blocks/Inline";

export function Line({ line }: { line: LineT }) {
  switch (line.t) {
    case "prompt":
      return <Prompt cmd={line.cmd} heading={line.heading} />;
    case "figlet":
      return <Figlet />;
    case "lead":
      return (
        <p className="m-0 max-w-[60ch] text-[length:var(--fs-lead)] font-bold leading-[var(--lh-lead)] text-t1">
          {line.text}
        </p>
      );
    case "text":
      return (
        <p className="m-0 max-w-[70ch] text-t2">
          <Inlines parts={line.parts} />
        </p>
      );
    case "comment":
      return <p className="m-0 max-w-[70ch] whitespace-pre-line text-t3">{line.text}</p>;
    case "table":
      return <Table cols={line.cols} />;
    case "links":
      return <Links items={line.items} />;
    case "dirs":
      return <Dirs />;
    case "featured":
      return <Featured rows={line.rows} />;
    case "projects":
      return <Projects rows={line.rows} />;
    case "gitlog":
      return <GitLog rows={line.rows} id={line.id} />;
    case "tree":
      return <Tree label={line.label} rows={line.rows} />;
    case "detail":
      return <Detail title={line.title} body={line.body} rows={line.rows} />;
    case "kv":
      return <Kv rows={line.rows} />;
  }
}
