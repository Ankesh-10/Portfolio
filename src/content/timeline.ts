import type { TimelineEntry } from "./types";
import { profile } from "./profile";

// PLACEHOLDER — newest first. "First line of code" is generated from profile.since.
const entries: TimelineEntry[] = [
  {
    date: "2025-06",
    title: "Software Engineer Intern",
    org: "Company",
    photo: "/images/about/internship.jpg",
  },
  {
    date: "2024-08",
    title: "Started B.Tech CSE",
    org: "University",
    photo: "/images/about/campus.jpg",
  },
];

export const timeline: TimelineEntry[] = [
  ...entries,
  {
    date: `${profile.since}-01`,
    title: "First line of code",
    photo: "/images/about/workspace.jpg",
  },
];
