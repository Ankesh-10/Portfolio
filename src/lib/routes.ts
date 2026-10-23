export type Tab = { index: number; slug: string; label: string; href: string; desc: string };

export const tabs: Tab[] = [
  { index: 0, slug: "home", label: "home", href: "/", desc: "home — start here" },
  {
    index: 1,
    slug: "about",
    label: "about",
    href: "/about",
    desc: "about — experience & background",
  },
  {
    index: 2,
    slug: "projects",
    label: "projects",
    href: "/projects",
    desc: "projects — things I've built",
  },
  { index: 3, slug: "skills", label: "skills", href: "/skills", desc: "skills — tools I use" },
  {
    index: 4,
    slug: "certs",
    label: "certs",
    href: "/certs",
    desc: "certs — certificates & credentials",
  },
  { index: 5, slug: "contact", label: "contact", href: "/contact", desc: "contact — get in touch" },
];

export function tabFor(pathname: string): Tab | undefined {
  const seg = pathname.split("/")[1] ?? "";
  return tabs.find((t) => (seg === "" ? t.slug === "home" : t.slug === seg));
}

/** Tabs whose left visual is wide (spec §4). */
export const wideTabs = new Set(["projects", "certs"]);
