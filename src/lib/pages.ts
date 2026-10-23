import { createHash } from "node:crypto";
import { profile } from "@/content/profile";
import { links } from "@/content/links";
import { projects, sortedProjects } from "@/content/projects";
import { skills, philosophy } from "@/content/skills";
import { certificates } from "@/content/certificates";
import { timeline } from "@/content/timeline";
import { aboutParagraphs, nowText } from "@/content/about";
import type { Line } from "./lines";

export type Page = { title: string; lines: Line[] };

const hash = (date: string, title: string) =>
  createHash("sha1")
    .update(date + title)
    .digest("hex")
    .slice(0, 7);

const prompt = (cmd: string, path: string, heading?: string): Line => ({
  t: "prompt",
  cmd,
  path,
  heading,
});
const ext = (href: string) => /^https?:/.test(href);
const link = (label: string, href: string) => ({ label, href, external: ext(href) });

export function homePage(): Page {
  const featured = sortedProjects().slice(0, 2);
  const now = profile.now;
  return {
    title: `${profile.firstName} ${profile.lastName}`,
    lines: [
      prompt("figlet ankesh jaiswal", "~"),
      { t: "figlet" },
      prompt("cat intro.txt", "~", "Intro"),
      { t: "lead", text: profile.tagline },
      {
        t: "text",
        parts: [
          "Currently building ",
          now.href ? link(now.label, now.href) : now.label,
          ` — ${now.blurb}`,
        ],
      },
      { t: "text", parts: profile.intro },
      { t: "comment", text: "# new here? click a tab below — or type help", id: "nudge" },
      prompt("ls ~/projects --featured", "~", "Featured projects"),
      {
        t: "featured",
        rows: featured.map((p) => ({
          name: p.name,
          href: `/projects/${p.slug}`,
          summary: p.summary,
          year: p.year,
        })),
      },
      prompt("ls ~", "~", "Sections"),
      { t: "dirs" },
      prompt("ls ~/links", "~", "Links"),
      {
        t: "links",
        items: links.map((l) => ({
          label: l.label,
          href: l.href,
          external: ext(l.href),
          download: l.kind === "resume",
        })),
      },
      prompt("stat --summary", "~", "Summary"),
      {
        t: "table",
        cols: [
          { label: "Projects", value: String(projects.length) },
          { label: "Years coding", value: String(new Date().getFullYear() - profile.since) },
          { label: "Certificates", value: String(certificates.length) },
          { label: "Now", value: now.label, href: now.href },
        ],
      },
    ],
  };
}

export function aboutPage(): Page {
  return {
    title: "About",
    lines: [
      prompt("cat about.md", "~/about", "About"),
      ...aboutParagraphs.map((p): Line => ({ t: "text", parts: [p] })),
      prompt("git log --oneline --graph", "~/about", "Experience"),
      {
        t: "gitlog",
        id: "experience",
        rows: timeline.map((e) => ({
          hash: hash(e.date, e.title),
          date: e.date,
          title: e.title,
          org: e.org,
          orgHref: e.orgHref,
          hot: e.photo ? { group: "photo" as const, id: e.photo } : undefined,
        })),
      },
      prompt("cat now.txt", "~/about", "Now"),
      { t: "text", parts: [nowText] },
    ],
  };
}

export function projectsPage(): Page {
  const list = sortedProjects();
  return {
    title: "Projects",
    lines: [
      prompt("ls ~/projects", "~/projects", "Projects"),
      list.length
        ? {
            t: "projects",
            rows: list.map((p) => ({
              name: p.name,
              href: `/projects/${p.slug}`,
              stack: p.stack.join(" · "),
              year: p.year,
              status: p.status,
              hot: { group: "project" as const, id: p.slug },
            })),
          }
        : { t: "comment", text: "total 0\n# nothing here yet — check back soon" },
    ],
  };
}

export function projectPage(slug: string): Page | undefined {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return undefined;
  const rows = [
    { k: "stack", v: [p.stack.join(" · ")] },
    { k: "role", v: [p.role] },
    ...(p.result ? [{ k: "result", v: [p.result] }] : []),
    {
      k: "links",
      v: [
        ...(p.links.live ? [link("live", p.links.live)] : []),
        ...(p.links.live && p.links.github ? ["  "] : []),
        ...(p.links.github ? [link("github", p.links.github)] : []),
      ],
    },
  ];
  return {
    title: p.name,
    lines: [
      prompt(`open ${p.slug}`, "~/projects", p.name),
      { t: "detail", title: p.name, body: p.description, rows },
      prompt("ls ~/projects", "~/projects", "All projects"),
      {
        t: "projects",
        rows: sortedProjects().map((x) => ({
          name: x.name,
          href: `/projects/${x.slug}`,
          stack: x.stack.join(" · "),
          year: x.year,
          status: x.status,
          hot: { group: "project" as const, id: x.slug },
        })),
      },
    ],
  };
}

export function skillsPage(): Page {
  return {
    title: "Skills",
    lines: [
      prompt("skills --tree", "~/skills", "Skills"),
      {
        t: "tree",
        label: "skills",
        rows: skills.map((g) => ({ key: g.group, items: g.items.map((i) => i.name) })),
        hotItems: skills.flatMap((g) =>
          g.items.filter((i) => i.level !== undefined).map((i) => i.name),
        ),
      },
      prompt("cat philosophy.txt", "~/skills", "Philosophy"),
      ...philosophy.map((p): Line => ({ t: "text", parts: [p] })),
    ],
  };
}

export function certsPage(): Page {
  return {
    title: "Certificates",
    lines: [
      prompt("ls ~/certs", "~/certs", "Certificates"),
      certificates.length
        ? {
            t: "gitlog",
            rows: certificates.map((c) => ({
              hash: hash(c.date, c.name),
              date: c.date,
              title: c.name,
              org: c.issuer,
              href: `/certs/${c.slug}`,
              hot: { group: "cert" as const, id: c.slug },
            })),
          }
        : { t: "comment", text: "total 0\n# nothing here yet — check back soon" },
    ],
  };
}

export function certPage(slug: string): Page | undefined {
  const c = certificates.find((x) => x.slug === slug);
  if (!c) return undefined;
  return {
    title: c.name,
    lines: [
      prompt(`open ${c.slug}`, "~/certs", c.name),
      {
        t: "kv",
        rows: [
          { k: "name", v: [c.name] },
          { k: "issuer", v: [c.issuer] },
          { k: "date", v: [c.date] },
          ...(c.credentialId ? [{ k: "id", v: [c.credentialId] }] : []),
          ...(c.verifyUrl ? [{ k: "verify", v: [link("verify ↗", c.verifyUrl)] }] : []),
        ],
      },
      prompt("ls ~/certs", "~/certs", "All certificates"),
      {
        t: "gitlog",
        rows: certificates.map((x) => ({
          hash: hash(x.date, x.name),
          date: x.date,
          title: x.name,
          org: x.issuer,
          href: `/certs/${x.slug}`,
          hot: { group: "cert" as const, id: x.slug },
        })),
      },
    ],
  };
}

export function contactPage(): Page {
  const byKind = (k: string) => links.find((l) => l.kind === k)!;
  return {
    title: "Contact",
    lines: [
      prompt("cat contact.txt", "~/contact", "Contact"),
      {
        t: "kv",
        rows: [
          { k: "email", v: [link(profile.email, byKind("email").href)] },
          {
            k: "github",
            v: [link(byKind("github").href.replace("https://", ""), byKind("github").href)],
          },
          {
            k: "linkedin",
            v: [link(byKind("linkedin").href.replace("https://www.", ""), byKind("linkedin").href)],
          },
          { k: "resume", v: [{ href: "/resume.pdf", label: "resume.pdf" }] },
        ],
      },
    ],
  };
}

/** Real build info (spec §4): only present when the host injects it. */
export function buildInfo() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return { sha: sha ? sha.slice(0, 7) : undefined, iso: new Date().toISOString() };
}
