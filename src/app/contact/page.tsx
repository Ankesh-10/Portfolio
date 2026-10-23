import type { Metadata } from "next";
import { Buffer } from "@/components/terminal/Buffer";
import { contactPage } from "@/lib/pages";

export const metadata: Metadata = { title: "Contact", description: "Get in touch." };

export default function Contact() {
  const p = contactPage();
  return <Buffer title={p.title} lines={p.lines} />;
}
