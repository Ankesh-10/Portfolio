import { renderOg, ogSize, ogContentType } from "@/lib/og";
import { projects } from "@/content/projects";

export const alt = "Project";
export const size = ogSize;
export const contentType = ogContentType;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return renderOg({
    cmd: `open ${slug}`,
    title: p?.name ?? slug,
    sub: p ? `${p.summary} · ${p.stack.join(" · ")}` : undefined,
  });
}
