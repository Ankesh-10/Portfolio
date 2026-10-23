import type { SkillGroup } from "./types";

// PLACEHOLDER — levels are self-rated (0–100).
export const skills: SkillGroup[] = [
  {
    group: "languages",
    items: [
      { name: "typescript", level: 85 },
      { name: "python", level: 70 },
      { name: "javascript", level: 88 },
      { name: "sql", level: 72 },
    ],
  },
  {
    group: "frontend",
    items: [
      { name: "react", level: 86 },
      { name: "next.js", level: 82 },
      { name: "tailwind", level: 84 },
    ],
  },
  {
    group: "backend",
    items: [
      { name: "node.js", level: 80 },
      { name: "express", level: 76 },
      { name: "postgres", level: 70 },
      { name: "supabase", level: 68 },
    ],
  },
  {
    group: "tools",
    items: [{ name: "git" }, { name: "docker" }, { name: "vercel" }, { name: "figma" }],
  },
];

export const philosophy = [
  "Ship the smallest thing that works, then make it better with real feedback.",
  "Boring tech, sharp details: speed and accessibility are features, not polish.",
];
