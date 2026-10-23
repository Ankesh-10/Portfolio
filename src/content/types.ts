export type Profile = {
  firstName: string;
  lastName: string;
  role: string;
  tagline: string;
  intro: string[];
  location: string;
  since: number;
  status: "open to work" | "building" | "busy";
  now: { label: string; href?: string; blurb: string };
  photo: string;
  badgeId: string;
  serial: string;
  bio: string[];
  email: string;
};

export type Link = {
  label: string;
  href: string;
  kind: "github" | "linkedin" | "email" | "resume" | "other";
};

export type Project = {
  slug: string;
  name: string;
  year: number;
  status: "live" | "wip" | "archived";
  summary: string;
  description: string;
  stack: string[];
  role: string;
  links: { live?: string; github?: string };
  image: string;
  result?: string;
  featured?: boolean;
};

export type SkillGroup = { group: string; items: { name: string; level?: number }[] };

export type Certificate = {
  slug: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  verifyUrl?: string;
  image: string;
};

export type TimelineEntry = {
  date: string;
  title: string;
  org?: string;
  orgHref?: string;
  photo?: string;
};
