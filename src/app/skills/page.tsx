import type { Metadata } from "next";
import { Buffer } from "@/components/terminal/Buffer";
import { skillsPage } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Skills",
  description: "Languages, frameworks and tools I use.",
};

export default function Skills() {
  const p = skillsPage();
  return <Buffer title={p.title} lines={p.lines} />;
}
