// Buffer line model (spec §6.3). Pages build these from typed content; components only render them.

export type Inline =
  string | { href: string; label: string; external?: boolean } | { run: string; label?: string }; // a command name that runs when clicked (help output)

export type Line =
  | { t: "prompt"; cmd: string; path: string; heading?: string }
  | { t: "figlet" }
  | { t: "lead"; text: string }
  | { t: "text"; parts: Inline[] }
  | { t: "comment"; text: string; id?: string }
  | { t: "table"; cols: { label: string; value: string; href?: string }[] }
  | { t: "links"; items: { label: string; href: string; external?: boolean; download?: boolean }[] }
  | { t: "dirs" }
  | { t: "featured"; rows: { name: string; href: string; summary: string; year: number }[] }
  | {
      t: "projects";
      rows: { name: string; href: string; stack: string; year: number; status: string }[];
    }
  | {
      t: "gitlog";
      id?: string;
      rows: {
        hash: string;
        date: string;
        title: string;
        org?: string;
        orgHref?: string;
        href?: string;
      }[];
    }
  | { t: "tree"; label: string; rows: { key: string; items: string[] }[] }
  | { t: "detail"; title: string; body: string; rows: { k: string; v: Inline[] }[] }
  | { t: "help"; rows: { group: string; cmds: Inline[]; desc: string }[] }
  | { t: "pre"; rows: string[] }
  | { t: "kv"; rows: { k: string; v: Inline[] }[] };
