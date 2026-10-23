import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Buffer } from "@/components/terminal/Buffer";
import { certificates } from "@/content/certificates";
import { certPage } from "@/lib/pages";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => certificates.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = certificates.find((x) => x.slug === slug);
  return c ? { title: c.name, description: `${c.name} — ${c.issuer}` } : {};
}

export default async function Cert({ params }: Props) {
  const p = certPage((await params).slug);
  if (!p) notFound();
  return <Buffer title={p.title} lines={p.lines} />;
}
