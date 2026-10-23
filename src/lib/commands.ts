import { profile } from "@/content/profile";
import { links } from "@/content/links";
import { projects } from "@/content/projects";
import { certificates } from "@/content/certificates";
import { skills } from "@/content/skills";
import { tabs } from "./routes";
import type { Inline, Line } from "./lines";

// Command registry (spec §8). Pure: no React, no DOM. The provider executes the returned effects.

export type Effect =
  | { k: "nav"; href: string; delay?: number }
  | { k: "download" }
  | { k: "copy"; text: string }
  | { k: "open"; href: string }
  | { k: "palette" }
  | { k: "clear" }
  | { k: "motion"; v: "on" | "off" }
  | { k: "shortcuts"; v: "on" | "off" }
  | { k: "theme"; v: "hex" | "log" }
  | { k: "matrix" };

export type Result = {
  lines: Line[];
  effects: Effect[];
  announce?: string;
  heading?: string;
  echo?: boolean;
};
export type Ctx = { history: string[]; resumeKb?: number };

const alias: Record<string, string> = {
  work: "projects",
  experience: "about",
  jobs: "about",
  education: "about",
};
const tabSlugs = tabs.map((t) => t.slug);

/** Names offered by Tab-completion and did-you-mean (easter eggs stay hidden: discovery is the fun). */
export const commandNames = [
  ...tabSlugs,
  "work",
  "experience",
  "jobs",
  "education",
  "cv",
  "help",
  "whoami",
  "ls",
  "cd",
  "open",
  "resume",
  "github",
  "linkedin",
  "email",
  "mail",
  "clear",
  "history",
  "theme",
  "shortcuts",
  "motion",
];

const text = (...parts: Inline[]): Line => ({ t: "text", parts });
const comment = (c: string): Line => ({ t: "comment", text: c });
const say = (lines: Line[], extra: Partial<Result> = {}): Result => ({
  lines,
  effects: [],
  ...extra,
});
const go = (href: string, announce?: string): Result => ({
  lines: [],
  effects: [{ k: "nav", href }],
  echo: false,
  announce,
});

function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[a.length][b.length];
}

function suggest(word: string): string | undefined {
  let best: string | undefined;
  let bestD = Infinity;
  for (const n of commandNames) {
    const dist = lev(word, n);
    if (dist < bestD) [best, bestD] = [n, dist];
  }
  return bestD <= Math.max(2, Math.floor(word.length / 3)) ? best : undefined;
}

const findItem = (q: string) => {
  const s = q.toLowerCase().replace(/^~?\/?(projects|certs)\//, "");
  const p = projects.find((x) => x.slug === s || x.name.toLowerCase() === s);
  if (p) return { href: `/projects/${p.slug}`, name: p.name };
  const c = certificates.find((x) => x.slug === s || x.name.toLowerCase() === s);
  if (c) return { href: `/certs/${c.slug}`, name: c.name };
};

const run = (cmd: string): Inline => ({ run: cmd });

function help(): Result {
  return say(
    [
      {
        t: "help",
        rows: [
          {
            group: "navigate",
            cmds: tabSlugs.flatMap((s, i) => (i ? [" · ", run(s)] : [run(s)])),
            desc: "open a section",
          },
          { group: "", cmds: ["open <name>"], desc: "show one project or cert" },
          {
            group: "get in touch",
            cmds: [run("resume"), " · ", run("email"), " · ", run("mail")],
            desc: "download, copy, write to me",
          },
          { group: "", cmds: [run("github"), " · ", run("linkedin")], desc: "open profiles" },
          {
            group: "settings",
            cmds: ["motion on|off", " · ", "shortcuts on|off"],
            desc: "calmer page, fewer hotkeys",
          },
          {
            group: "",
            cmds: ["theme hex|log", " · ", run("clear"), " · ", run("history")],
            desc: "background, tidy up, recall",
          },
          { group: "fun", cmds: ["there are a few classic commands hidden here"], desc: "" },
        ],
      },
    ],
    { heading: "Help", announce: "Help, 4 groups" },
  );
}

function neofetch(): Result {
  const years = new Date().getFullYear() - profile.since;
  const info = [
    "ankesh@portfolio",
    "────────────────",
    `role     ${profile.role}`,
    `loc      ${profile.location}`,
    `uptime   ${years} years coding`,
    `status   ${profile.status}`,
    `langs    ${skills[0].items.map((i) => i.name).join(", ")}`,
    "shell    portfolio-sh",
    "font     JetBrains Mono",
  ];
  const logo = [
    "  ┌─────┐  ",
    "  │ ▄▀▄ │  ",
    "  │ █▀█ │  ",
    "  └─────┘  ",
    "           ",
    "           ",
    "           ",
    "           ",
    "           ",
  ];
  return say([{ t: "pre", rows: info.map((r, i) => logo[i] + r) }], { announce: "System info" });
}

export function execute(raw: string, ctx: Ctx): Result {
  const input = raw.trim();
  const normal = input.replace(/\s+/g, " ");
  if (normal === "rm -rf /" || normal === "rm -rf /*") return say([text("nice try.")]);
  if (normal === "sudo hire-me")
    return {
      lines: [
        text("[sudo] password for recruiter: ****"),
        text("access granted. opening contact…"),
      ],
      effects: [{ k: "nav", href: "/contact", delay: 900 }],
      announce: "Access granted. Opening contact",
    };
  if (input === ":q" || input === "exit" || input === ":q!")
    return say([text("there is no escape. (try :help)")]);

  const [first, ...args] = normal.replace(/^:/, "").split(" ");
  const cmd = first.toLowerCase();
  const arg = args.join(" ");

  if (tabSlugs.includes(cmd) || alias[cmd]) {
    const slug = alias[cmd] ?? cmd;
    const tab = tabs.find((t) => t.slug === slug)!;
    return go(tab.href + (alias[cmd] === "about" ? "#experience" : ""));
  }

  switch (cmd) {
    case "":
      return say([]);
    case "help":
      return help();
    case "whoami":
      return say([text(`${profile.firstName.toLowerCase()} — ${profile.role}`)]);
    case "ls": {
      const t = arg.replace(/^~\/?/, "").replace(/\/$/, "");
      const tab = tabs.find((x) => x.slug === t && t);
      if (tab) return go(tab.href);
      return say([{ t: "dirs" }], { announce: "5 sections" });
    }
    case "cd": {
      const t = arg.replace(/^~\/?/, "").replace(/\/$/, "");
      if (!t || t === ".." || t === "~") return go("/");
      const tab = tabs.find((x) => x.slug === t);
      if (tab) return go(tab.href);
      return say([text(`cd: no such file or directory: ${arg}`)]);
    }
    case "open": {
      if (!arg) return say([comment("usage: open <project|cert>")]);
      const item = findItem(arg);
      if (item) return go(item.href);
      const names = [...projects.map((p) => p.slug), ...certificates.map((c) => c.slug)].join(", ");
      return say([text(`open: no such project or cert: ${arg}. try: ${names}`)]);
    }
    case "cv":
    case "resume":
      return {
        lines: [text(`downloading resume.pdf${ctx.resumeKb ? ` (${ctx.resumeKb} KB)` : ""} ✓`)],
        effects: [{ k: "download" }],
        announce: "Résumé downloaded",
      };
    case "github":
    case "linkedin": {
      const l = links.find((x) => x.kind === cmd)!;
      return {
        lines: [
          text(`opening ${cmd}… `, {
            href: l.href,
            label: l.href.replace(/^https?:\/\/(www\.)?/, ""),
            external: true,
          }),
        ],
        effects: [{ k: "open", href: l.href }],
        announce: `Opening ${cmd}`,
      };
    }
    case "email":
      return { lines: [], effects: [{ k: "copy", text: profile.email }] };
    case "mail":
      return say([
        text("the mail form isn't live yet — type ", run("email"), " to copy my address."),
      ]);
    case "clear":
      return { lines: [], effects: [{ k: "clear" }], echo: false };
    case "history": {
      const rows = ctx.history.length
        ? ctx.history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`)
        : ["# no history yet"];
      return say([{ t: "pre", rows }], { announce: `${ctx.history.length} previous commands` });
    }
    case "theme":
      if (arg === "hex" || arg === "log")
        return {
          lines: [text(`theme ${arg}`)],
          effects: [{ k: "theme", v: arg }],
          announce: `Background ${arg}`,
        };
      return say([comment("usage: theme hex|log")]);
    case "motion":
      if (arg === "on" || arg === "off")
        return {
          lines: [text(`motion ${arg}`)],
          effects: [{ k: "motion", v: arg }],
          announce: `Motion ${arg}`,
        };
      return say([comment("usage: motion on|off")]);
    case "shortcuts":
      if (arg === "on" || arg === "off")
        return {
          lines: [text(`shortcuts ${arg}`)],
          effects: [{ k: "shortcuts", v: arg }],
          announce: `Shortcuts ${arg}`,
        };
      return say([comment("usage: shortcuts on|off")]);
    case "vim":
    case "vi":
      return say([text("you're already in it.")]);
    case "neofetch":
      return neofetch();
    case "matrix":
      return { lines: [], effects: [{ k: "matrix" }] };
  }

  const s = suggest(cmd);
  return say(
    [
      text(
        `command not found: ${cmd}. ${s ? `did you mean '${s}'?` : "type help"} — or click a tab below`,
      ),
    ],
    { announce: `Command not found: ${cmd}` },
  );
}

/** Tab-completion for commands and their arguments. Returns the completed input (or the input unchanged). */
export function complete(input: string): string {
  const m = input.match(/^(\S*)(?:\s+(.*))?$/);
  if (!m) return input;
  const [, cmd, rest] = m;
  const pick = (opts: string[], prefix: string, head: string) => {
    const hits = opts.filter((o) => o.startsWith(prefix.toLowerCase()));
    if (!hits.length) return input;
    let common = hits[0];
    for (const h of hits) while (!h.startsWith(common)) common = common.slice(0, -1);
    return head + (hits.length === 1 ? hits[0] : common);
  };
  if (rest === undefined) return pick(commandNames, cmd, "");
  const c = cmd.toLowerCase();
  const head = `${cmd} `;
  if (c === "open")
    return pick([...projects.map((p) => p.slug), ...certificates.map((x) => x.slug)], rest, head);
  if (c === "cd" || c === "ls")
    return pick(
      tabSlugs.filter((s) => s !== "home"),
      rest.replace(/^~\//, ""),
      head,
    );
  if (c === "theme") return pick(["hex", "log"], rest, head);
  if (c === "motion" || c === "shortcuts") return pick(["on", "off"], rest, head);
  return input;
}

// ---- Palette (spec §6.8) -------------------------------------------------------------------

export type PaletteItem = { label: string; desc: string; cmd: string };

const base: PaletteItem[] = [
  ...tabs.map((t) => ({
    label: t.slug,
    desc: t.desc.split(" — ")[1] ? `${t.slug} — ${t.desc.split(" — ")[1]}` : t.desc,
    cmd: t.slug,
  })),
  { label: "resume", desc: "resume — download my résumé (PDF)", cmd: "resume" },
  { label: "help", desc: "help — list every command", cmd: "help" },
];

const more: PaletteItem[] = [
  ...projects.map((p) => ({
    label: `open ${p.slug}`,
    desc: `${p.slug} — ${p.summary}`,
    cmd: `open ${p.slug}`,
  })),
  ...certificates.map((c) => ({
    label: `open ${c.slug}`,
    desc: `${c.name} — ${c.issuer}`,
    cmd: `open ${c.slug}`,
  })),
  { label: "email", desc: "email — copy my address", cmd: "email" },
  { label: "github", desc: "github — open my profile", cmd: "github" },
  { label: "linkedin", desc: "linkedin — open my profile", cmd: "linkedin" },
  { label: "experience", desc: "experience — jobs & education", cmd: "experience" },
  { label: "theme log", desc: "theme log — syslog background", cmd: "theme log" },
  { label: "theme hex", desc: "theme hex — hex-dump background", cmd: "theme hex" },
  { label: "motion off", desc: "motion off — calmer page", cmd: "motion off" },
  { label: "motion on", desc: "motion on — bring the motion back", cmd: "motion on" },
  {
    label: "shortcuts off",
    desc: "shortcuts off — disable single-key hotkeys",
    cmd: "shortcuts off",
  },
  { label: "clear", desc: "clear — tidy the buffer", cmd: "clear" },
  { label: "history", desc: "history — recall previous commands", cmd: "history" },
];

function score(q: string, s: string): number {
  // subsequence match; earlier + tighter = better. -1 = no match.
  let i = 0;
  let last = -1;
  let gaps = 0;
  const t = s.toLowerCase();
  for (const ch of q) {
    const at = t.indexOf(ch, i);
    if (at < 0) return -1;
    if (last >= 0) gaps += at - last - 1;
    else gaps += at;
    last = at;
    i = at + 1;
  }
  return gaps;
}

export function paletteItems(query: string): PaletteItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return base;
  return [...base, ...more]
    .map((it) => ({
      it,
      s: Math.min(...[score(q, it.label), score(q, it.desc)].filter((x) => x >= 0), Infinity),
    }))
    .filter((x) => x.s !== Infinity)
    .sort((a, b) => a.s - b.s)
    .slice(0, 8)
    .map((x) => x.it);
}

export function copyResult(ok: boolean, address: string): Line[] {
  return [
    { t: "text", parts: [ok ? `copied ✓ ${address}` : `couldn't copy — here it is: ${address}`] },
  ];
}
