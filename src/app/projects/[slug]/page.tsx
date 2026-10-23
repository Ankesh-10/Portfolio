import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Buffer } from "@/components/terminal/Buffer";
import { projects } from "@/content/projects";
import { projectPage } from "@/lib/pages";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function Project({ params }: Props) {
  const p = projectPage((await params).slug);
  if (!p) notFound();
  return <Buffer title={p.title} lines={p.lines} />;
}
