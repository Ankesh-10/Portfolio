import type { Link } from "./types";
import { profile } from "./profile";

export const links: Link[] = [
  { label: "github", href: "https://github.com/ankesh-10", kind: "github" },
  { label: "linkedin", href: "https://www.linkedin.com/in/ankesh-10", kind: "linkedin" },
  { label: "email", href: `mailto:${profile.email}`, kind: "email" },
  { label: "resume.pdf", href: "/resume.pdf", kind: "resume" },
];

export const githubUrl = links[0].href;
