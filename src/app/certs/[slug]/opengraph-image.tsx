import { renderOg, ogSize, ogContentType } from "@/lib/og";
import { certificates } from "@/content/certificates";

export const alt = "Certificate";
export const size = ogSize;
export const contentType = ogContentType;
export const generateStaticParams = () => certificates.map((c) => ({ slug: c.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = certificates.find((x) => x.slug === slug);
  return renderOg({
    cmd: `open ${slug}`,
    title: c?.name ?? slug,
    sub: c ? `${c.issuer} · ${c.date}` : undefined,
  });
}
