import type { Metadata } from "next";
import { Buffer } from "@/components/terminal/Buffer";
import { certsPage } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Certificates and credentials.",
};

export default function Certs() {
  const p = certsPage();
  return <Buffer title={p.title} lines={p.lines} />;
}
