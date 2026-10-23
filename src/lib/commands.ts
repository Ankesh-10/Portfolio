// Command parser, registry and autocomplete (spec §8). Pure: no DOM, no React.
// The runner in CommandLine turns a Result into buffer output and side effects.
import type { Line, Inline } from "./lines";
import { tabs, tabFor } from "./routes";
import { projects } from "@/content/projects";
import { certificates } from "@/content/certificates";
import { links } from "@/content/links";
import { profile } from "@/content/profile";

export type Effect =
  | { k: "nav"; href: string; label: string }
  | { k: "external"; href: string }
  | { k: "download" }
  | { k: "copy"; text: string }
  | { k: "clear" }
  | { k: "motion"; v: "on" | "off" }
  | { k: "shortcuts"; v: "on" | "off" }
  | { k: "matrix" }
  | { k: "theme"; v: "hex" | "log" };

/** `echo: false` for commands that replace the buffer (navigation) or wipe it (clear). */
export type Result = { lines: Line[]; effects: Effect[]; announce?: string; echo?: boolean };

export type Ctx = { pathname: string; history: string[]; resumeKb?: number };

type Command = {
  name: string;
  aliases?: string[];
  /** Completions for the first argument. */
  args?: () => string[];
  /** Hidden commands are runnable but never suggested or completed. */
  hidden?: boolean;
  run: (args: string[], ctx: Ctx) => Result;
};

const out = (...lines: Line[]): Result => ({ lines, effects: [] });
const say = (text: string, announce?: string): Result => ({
  lines: [{ t: "text", parts: [text] }],
  effects: [],
  announce: announce ?? text,
});
const note = (text: string): Result => ({
  lines: [{ t: "comment", text }],
  effects: [],
  announce: text.replace(/^# /, ""),
});
const nav = (href: string, label: string): Result => ({
  lines: [],
  effects: [{ k: "nav", href, label }],
  echo: false,
});

const byKind = (k: string) => links.find((l) => l.kind === k)!;
const bare = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "");
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const tabAlias: Record<string, string> = { work: "projects" };
const aboutAlias = ["experience", "jobs", "education"];

/** Resolve `projects`, `~/projects`, `/projects`, `..` etc. to a route. */
function resolvePath(arg: string, pathname: string): { href: string; label: string } | null {
  const a = arg.replace(/^~?\/?/, "").replace(/\/$/, "");
  if (a === "" || a === "~" || a === "home") return { href: "/", label: "Home" };
  if (a === "..") {
    const parts = pathname.split("/").filter(Boolean);
    const up = parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : "/";
    const t = tabFor(up);
    return { href: up, label: cap(t?.label ?? "home") };
  }
  if (aboutAlias.includes(a)) return { href: "/about#experience", label: "Experience" };
  const [first, slug] = a.split("/");
  const tab = tabs.find((t) => t.slug === (tabAlias[first] ?? first));
  if (!tab) return null;
  if (slug) {
    const item = findItem(slug);
    if (item && item.href.startsWith(tab.href + "/")) return item;
    return null;
  }
  return { href: tab.href, label: cap(tab.label) };
}

function findItem(q: string): { href: string; label: string } | null {
  const s = q.toLowerCase();
  const p = projects.find((x) => x.slug === s || x.name.toLowerCase() === s);
  if (p) return { href: `/projects/${p.slug}`, label: p.name };
  const c = certificates.find((x) => x.slug === s || x.name.toLowerCase() === s);
  if (c) return { href: `/certs/${c.slug}`, label: c.name };
  return null;
}

const resume = (ctx: Ctx): Result => ({
  lines: [
    {
      t: "text",
      parts: [`downloading resume.pdf${ctx.resumeKb ? ` (${ctx.resumeKb} KB)` : ""} ✓`],
    },
  ],
  effects: [{ k: "download" }],
  announce: "résumé downloaded",
});

const openProfile = (kind: "github" | "linkedin"): Result => {
  const href = byKind(kind).href;
  return {
    lines: [{ t: "text", parts: ["opening ", { href, label: bare(href), external: true }] }],
    effects: [{ k: "external", href }],
    announce: `opening ${kind}`,
  };
};

const toggle =
  (key: "motion" | "shortcuts", on: string, off: string) =>
  (args: string[]): Result => {
    const v = args[0];
    if (v !== "on" && v !== "off") return note(`# usage: ${key} on|off`);
    return {
      lines: [{ t: "text", parts: [v === "on" ? on : off] }],
      effects: [{ k: key, v }],
      announce: v === "on" ? on : off,
    };
  };

export const commands: Command[] = [
  ...tabs.map((t): Command => ({
    name: t.slug,
    aliases: t.slug === "projects" ? ["work"] : undefined,
    run: () => nav(t.href, cap(t.label)),
  })),
  {
    name: "experience",
    aliases: ["jobs", "education"],
    run: () => nav("/about#experience", "Experience"),
  },
  {
    name: "cd",
    args: () => ["~", "..", ...tabs.filter((t) => t.slug !== "home").map((t) => t.slug)],
    run: (args, ctx) => {
      const r = resolvePath(args[0] ?? "~", ctx.pathname);
      return r ? nav(r.href, r.label) : say(`cd: no such file or directory: ${args[0]}`);
    },
  },
  {
    name: "ls",
    args: () => ["~", "projects", "certs"],
    run: (args, ctx) => {
      const a = args.find((x) => !x.startsWith("-"));
      if (!a || a === "~" || a === "~/" || a === "/")
        return { ...out({ t: "dirs" }), announce: "5 sections" };
      const r = resolvePath(a, ctx.pathname);
      return r ? nav(r.href, r.label) : say(`ls: cannot access '${a}': No such file or directory`);
    },
  },
  {
    name: "open",
    args: () => [...projects.map((p) => p.slug), ...certificates.map((c) => c.slug)],
    run: (args) => {
      if (!args.length)
        return note("# usage: open <project|cert> — e.g. open " + (projects[0]?.slug ?? "name"));
      const item = findItem(args.join(" "));
      return item
        ? nav(item.href, item.label)
        : say(`open: no project or cert named '${args.join(" ")}' — try ls ~/projects`);
    },
  },
  {
    name: "help",
    aliases: [":help", "man"],
    run: () => ({ lines: [{ t: "help" }], effects: [], announce: "help, 4 groups" }),
  },
  {
    name: "whoami",
    run: () => say(`${profile.firstName.toLowerCase()} — ${profile.role}`),
  },
  { name: "resume", aliases: ["cv"], run: (_, ctx) => resume(ctx) },
  { name: "github", run: () => openProfile("github") },
  { name: "linkedin", run: () => openProfile("linkedin") },
  {
    name: "email",
    run: () => ({ lines: [], effects: [{ k: "copy", text: profile.email }] }),
  },
  {
    name: "mail",
    args: () => ["--discard"],
    run: (args) =>
      args[0] === "--discard"
        ? note("# no saved draft")
        : {
            lines: [
              {
                t: "text",
                parts: [
                  "mail: the message form isn't ready yet — write to ",
                  { href: `mailto:${profile.email}`, label: profile.email },
                  " or type ",
                  { run: "email", label: "email" },
                  " to copy the address",
                ],
              },
            ],
            effects: [],
            announce: "mail form isn't ready yet",
          },
  },
  {
    name: "clear",
    run: () => ({ lines: [], effects: [{ k: "clear" }], echo: false, announce: "cleared" }),
  },
  {
    name: "history",
    run: (_, ctx) =>
      ctx.history.length
        ? {
            lines: [{ t: "history", items: ctx.history }],
            effects: [],
            announce: `${ctx.history.length} commands`,
          }
        : note("# no history yet"),
  },
  {
    name: "motion",
    args: () => ["on", "off"],
    run: toggle("motion", "motion on", "motion off — continuous motion paused"),
  },
  {
    name: "shortcuts",
    args: () => ["on", "off"],
    run: toggle(
      "shortcuts",
      "shortcuts on — 0–5 / and : work again",
      "shortcuts off — single-key shortcuts disabled",
    ),
  },
  {
    name: "theme",
    args: () => ["hex", "log"],
    run: (args) => {
      const v = args[0];
      if (v !== "hex" && v !== "log") return note("# usage: theme hex|log");
      const text = v === "hex" ? "background: hex dump" : "background: system log";
      return {
        lines: [{ t: "text", parts: [text] }],
        effects: [{ k: "theme", v }],
        announce: text,
      };
    },
  },
  // ── easter eggs (spec §8): runnable, never listed or completed ──
  {
    name: "sudo",
    hidden: true,
    run: (args) =>
      args.join(" ") === "hire-me"
        ? {
            lines: [
              { t: "text", parts: ["[sudo] password for recruiter: ****"] },
              { t: "text", parts: ["access granted. opening contact…"] },
            ],
            effects: [{ k: "nav", href: "/contact", label: "Contact" }],
            announce: "access granted, opening contact",
          }
        : say("recruiter is not in the sudoers file. This incident will be reported."),
  },
  {
    name: "rm",
    hidden: true,
    run: (args) => (args.includes("-rf") ? say("nice try.") : say("rm: permission denied")),
  },
  { name: "vim", aliases: ["vi", "nvim"], hidden: true, run: () => say("you're already in it.") },
  {
    name: "exit",
    aliases: [":q", ":q!", ":wq", ":x", "quit", "logout"],
    hidden: true,
    run: () => say("there is no escape. (try :help)"),
  },
  {
    name: "neofetch",
    hidden: true,
    run: () => ({ lines: [{ t: "neofetch" }], effects: [], announce: "neofetch" }),
  },
  {
    name: "matrix",
    hidden: true,
    run: () => ({ lines: [], effects: [{ k: "matrix" }], announce: "wake up" }),
  },
  {
    name: "pwd",
    hidden: true,
    run: (_, ctx) =>
      say(`/home/${profile.firstName.toLowerCase()}${ctx.pathname === "/" ? "" : ctx.pathname}`),
  },
  { name: "echo", hidden: true, run: (args) => say(args.join(" ")) },
  { name: "date", hidden: true, run: () => say(new Date().toString()) },
];

const byName = new Map<string, Command>();
for (const c of commands) for (const n of [c.name, ...(c.aliases ?? [])]) byName.set(n, c);

/** Split on whitespace, keeping "quoted words" together. */
export function parse(raw: string): { name: string; args: string[] } {
  const words = raw.trim().match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  const [name = "", ...args] = words.map((w) => w.replace(/^["']|["']$/g, ""));
  return { name: name.toLowerCase(), args };
}

export function run(raw: string, ctx: Ctx): Result {
  const { name, args } = parse(raw);
  if (!name) return out();
  // A tab's tmux index jumps to it (`3` → skills), like the single-key shortcut.
  const byIndex = tabs.find((t) => String(t.index) === name);
  if (byIndex && !args.length) return nav(byIndex.href, cap(byIndex.label));
  // `/about`, `/resume`, `/theme log`: the slash form of any command; `/` alone lists them.
  if (name === "/") return run("help", ctx);
  const cmd =
    byName.get(name) ?? byName.get(name.replace(/^:/, "")) ?? byName.get(name.replace(/^\//, ""));
  if (cmd) return cmd.run(args, ctx);
  // `~/projects` or `/about` typed alone works like cd.
  if (/^[~/.]/.test(name)) {
    const r = resolvePath(name, ctx.pathname);
    if (r) return nav(r.href, r.label);
  }
  const guess = suggest(name);
  const parts: Inline[] = [`command not found: ${name}.`];
  if (guess) parts.push(" did you mean '", { run: guess, label: guess }, "'?");
  parts.push(" — type ", { run: "help", label: "help" }, ", or / to see every command");
  return {
    lines: [{ t: "text", parts }],
    effects: [],
    announce: `command not found: ${name}${guess ? `. did you mean ${guess}?` : ""}`,
  };
}

/** True when the input runs as typed: a command (hidden ones too), a tab index or a path. */
export function isKnown(raw: string): boolean {
  const { name } = parse(raw);
  if (!name) return false;
  if (tabs.some((t) => String(t.index) === name)) return true;
  if (byName.has(name) || byName.has(name.replace(/^[:/]/, ""))) return true;
  return /^[~.]/.test(name) || (/^\//.test(name) && !!resolvePath(name, "/"));
}

const visibleNames = () =>
  commands
    .filter((c) => !c.hidden)
    .flatMap((c) => [c.name, ...(c.aliases ?? [])].filter((n) => !n.startsWith(":")));

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

/** Closest visible command by edit distance, or a prefix match; null when nothing is close. */
export function suggest(name: string): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const n of visibleNames()) {
    const d = n.startsWith(name) && name.length >= 2 ? 1 : distance(name, n);
    if (d < bestD) [best, bestD] = [n, d];
  }
  return bestD <= Math.max(1, Math.floor(name.length / 3)) ? best : null;
}

/** Candidates for Tab completion of the whole input. */
export function completions(input: string): string[] {
  const m = input.match(/^(\S*)(\s+)?(.*)$/)!;
  const [, first, space, rest] = m;
  if (!space)
    return visibleNames()
      .filter((n) => n.startsWith(first.toLowerCase()))
      .sort();
  const cmd = byName.get(first.toLowerCase());
  if (!cmd?.args) return [];
  return cmd
    .args()
    .filter((a) => a.startsWith(rest))
    .map((a) => `${first} ${a}`);
}

/** Longest shared prefix, for bash-style partial completion. */
export function commonPrefix(xs: string[]): string {
  if (!xs.length) return "";
  let p = xs[0];
  for (const x of xs) while (!x.startsWith(p)) p = p.slice(0, -1);
  return p;
}

// ── help (spec §8): four groups, ≤ 4 rows each, every command clickable ──
export type HelpItem = { label: string; run?: string; fill?: string };
export type HelpRow = { items: HelpItem[]; desc: string };
export const helpGroups: { label: string; rows: HelpRow[] }[] = [
  {
    label: "navigate",
    rows: [
      { items: tabs.map((t) => ({ label: t.slug, run: t.slug })), desc: "open a section" },
      { items: [{ label: "open <name>", fill: "open " }], desc: "show one project or cert" },
      { items: [{ label: "/<command>", fill: "/" }], desc: "type / to search every command" },
    ],
  },
  {
    label: "get in touch",
    rows: [
      {
        items: [
          { label: "resume", run: "resume" },
          { label: "email", run: "email" },
          { label: "mail", run: "mail" },
        ],
        desc: "download, copy, write to me",
      },
      {
        items: [
          { label: "github", run: "github" },
          { label: "linkedin", run: "linkedin" },
        ],
        desc: "open profiles",
      },
    ],
  },
  {
    label: "settings",
    rows: [
      {
        items: [
          { label: "motion on|off", fill: "motion " },
          { label: "shortcuts on|off", fill: "shortcuts " },
        ],
        desc: "calmer page, fewer hotkeys",
      },
      {
        items: [
          { label: "theme hex|log", fill: "theme " },
          { label: "clear", run: "clear" },
          { label: "history", run: "history" },
        ],
        desc: "background, tidy up, recall",
      },
    ],
  },
  {
    label: "fun",
    rows: [{ items: [], desc: "there are a few classic commands hidden here" }],
  },
];

// ── palette entries (spec §6.8) ──
export type PaletteItem = { id: string; label: string; desc: string; cmd: string };

export const paletteItems: PaletteItem[] = [
  ...tabs.map((t) => ({
    id: `tab-${t.slug}`,
    label: t.slug,
    desc: t.desc.split(" — ")[1] ?? t.desc,
    cmd: t.slug,
  })),
  { id: "resume", label: "resume", desc: "download resume.pdf", cmd: "resume" },
  { id: "help", label: "help", desc: "list every command", cmd: "help" },
  ...projects.map((p) => ({
    id: `p-${p.slug}`,
    label: `open ${p.slug}`,
    desc: p.summary,
    cmd: `open ${p.slug}`,
  })),
  ...certificates.map((c) => ({
    id: `c-${c.slug}`,
    label: `open ${c.slug}`,
    desc: `${c.name} — ${c.issuer}`,
    cmd: `open ${c.slug}`,
  })),
  { id: "email", label: "email", desc: "copy my email address", cmd: "email" },
  { id: "github", label: "github", desc: "open my GitHub", cmd: "github" },
  { id: "linkedin", label: "linkedin", desc: "open my LinkedIn", cmd: "linkedin" },
  { id: "whoami", label: "whoami", desc: "one line about me", cmd: "whoami" },
  { id: "motion-off", label: "motion off", desc: "pause continuous motion", cmd: "motion off" },
  { id: "motion-on", label: "motion on", desc: "resume continuous motion", cmd: "motion on" },
  {
    id: "shortcuts-off",
    label: "shortcuts off",
    desc: "disable single-key shortcuts",
    cmd: "shortcuts off",
  },
  {
    id: "shortcuts-on",
    label: "shortcuts on",
    desc: "enable single-key shortcuts",
    cmd: "shortcuts on",
  },
  { id: "theme-log", label: "theme log", desc: "system-log background", cmd: "theme log" },
  { id: "theme-hex", label: "theme hex", desc: "hex-dump background", cmd: "theme hex" },
  { id: "clear", label: "clear", desc: "tidy the buffer", cmd: "clear" },
  { id: "history", label: "history", desc: "commands you ran", cmd: "history" },
];

/** Empty query: the 6 tabs + resume + help (spec §6.8). */
export const paletteDefault = paletteItems.slice(0, tabs.length + 2);

/** Subsequence match, scored so prefix and word-start hits rank first. */
export function filterPalette(q: string, limit = 8): PaletteItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return paletteDefault;
  const scored: { item: PaletteItem; score: number }[] = [];
  for (const item of paletteItems) {
    const hay = item.label.toLowerCase();
    let score = 0;
    if (hay.startsWith(s)) score = 300 - hay.length;
    else if (hay.includes(s)) score = 200 - hay.indexOf(s);
    else if (subsequence(s, hay)) score = 100;
    else if (item.desc.toLowerCase().includes(s)) score = 50;
    if (score) scored.push({ item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

function subsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
}

// ── suggestions while typing (spec §6.8): the command line is its own palette ──
export type Suggestion = { id: string; label: string; desc: string; value: string };

const descFor = (cmd: string): string => {
  const hit = paletteItems.find((p) => p.cmd === cmd);
  if (hit) return hit.desc;
  const [name, arg] = cmd.split(" ");
  if ((name === "cd" || name === "ls") && arg) {
    const t = tabs.find((x) => x.slug === arg);
    if (t) return t.desc.split(" — ")[1] ?? t.desc;
    if (arg === "~") return "home";
    if (arg === "..") return "up one level";
  }
  return "";
};

/** What to show under the cursor as the visitor types. `/…` searches every command (fuzzy);
 *  anything else completes command names and their arguments; a tab index names its tab. */
export function suggestions(input: string, limit = 8): Suggestion[] {
  if (input.startsWith("/")) {
    const q = input.slice(1);
    const items = q.trim() ? filterPalette(q, limit) : paletteItems.slice(0, limit + 2);
    return items.map((it) => ({
      id: it.id,
      label: `/${it.cmd}`,
      desc: it.desc,
      value: `/${it.cmd}`,
    }));
  }
  const t = input.trim();
  if (!t) return [];
  const tab = tabs.find((x) => String(x.index) === t);
  if (tab) return [{ id: `idx-${tab.slug}`, label: t, desc: `go to ${tab.slug}`, value: t }];
  return completions(input)
    .slice(0, limit)
    .map((c, i) => ({ id: `c${i}`, label: c, desc: descFor(c), value: c }));
}
