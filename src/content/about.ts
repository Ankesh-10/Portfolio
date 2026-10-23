import type { Photo } from "./types";

// PLACEHOLDER copy for the about tab.
export const aboutParagraphs = [
  "I'm Ankesh, a full-stack developer from India. I like turning vague ideas into small, fast products that people actually use.",
  "I care about the details nobody notices until they're wrong: load time, keyboard support, empty states, error messages.",
  "I'm looking for a team that ships often and lets me own features from design to deploy.",
];

export const nowText = "Learning: system design and Postgres internals. Building: project-name.";

// PLACEHOLDER — 3–4 B&W photos for the about stack (spec §14). Missing files show their caption instead.
export const photos: Photo[] = [
  { src: "/images/about/portrait.jpg", alt: "Ankesh at his desk", caption: "desk · 2025" },
  { src: "/images/about/workspace.jpg", alt: "Workspace with two monitors", caption: "workspace" },
  {
    src: "/images/about/internship.jpg",
    alt: "Team photo from the internship",
    caption: "internship · 2025",
  },
  { src: "/images/about/campus.jpg", alt: "University campus", caption: "campus · 2024" },
];
