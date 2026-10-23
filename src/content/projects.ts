import type { Project } from "./types";

// PLACEHOLDER COPY — replace with real projects (3–6, mark 1–2 featured).
export const projects: Project[] = [
  {
    slug: "project-name",
    name: "project-name",
    year: 2025,
    status: "wip",
    summary: "one-line summary of what it does",
    description:
      "One paragraph: the problem, what you built and the outcome. Replace this with the real story.",
    stack: ["next.js", "postgres", "tailwind"],
    role: "solo",
    links: { github: "https://github.com/ankesh-10" },
    image: "/projects/project-name.png",
    result: "one line with the measurable outcome",
    featured: true,
  },
  {
    slug: "project-two",
    name: "project-two",
    year: 2024,
    status: "live",
    summary: "one-line summary of what it does",
    description:
      "One paragraph: the problem, what you built and the outcome. Replace this with the real story.",
    stack: ["typescript", "node.js", "supabase"],
    role: "team of 3",
    links: { github: "https://github.com/ankesh-10" },
    image: "/projects/project-two.png",
    featured: true,
  },
];

/** Featured first (max 2 on home), then newest. */
export function sortedProjects(): Project[] {
  return [...projects].sort(
    (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.year - a.year,
  );
}
