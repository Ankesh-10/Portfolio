import type { TimelineEntry } from "./types";
import { profile } from "./profile";
import { aboutPhotos } from "./about";

// PLACEHOLDER — newest first. "First line of code" is generated from profile.since.
const entries: TimelineEntry[] = [
  {
    date: "2025-06",
    title: "Software Engineer Intern",
    org: "Company",
    photo: aboutPhotos[0]?.src,
  },
  { date: "2024-08", title: "Started B.Tech CSE", org: "University", photo: aboutPhotos[1]?.src },
];

export const timeline: TimelineEntry[] = [
  ...entries,
  { date: `${profile.since}-01`, title: "First line of code", photo: aboutPhotos[2]?.src },
];
