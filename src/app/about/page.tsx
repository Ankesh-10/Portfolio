import type { Metadata } from "next";
import { Buffer } from "@/components/terminal/Buffer";
import { aboutPage } from "@/lib/pages";

export const metadata: Metadata = { title: "About", description: "Experience and background." };

export default function About() {
  const p = aboutPage();
  return <Buffer title={p.title} lines={p.lines} />;
}
