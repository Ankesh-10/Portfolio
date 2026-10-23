import type { Metadata } from "next";
import { Buffer } from "@/components/terminal/Buffer";
import { projectsPage } from "@/lib/pages";

export const metadata: Metadata = { title: "Projects", description: "Things I've built." };

export default function Projects() {
  const p = projectsPage();
  return <Buffer title={p.title} lines={p.lines} />;
}
