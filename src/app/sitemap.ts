import type { MetadataRoute } from "next";
import { tabs } from "@/lib/routes";
import { projects } from "@/content/projects";
import { certificates } from "@/content/certificates";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ankesh.dev";
  return [
    ...tabs.map((t) => t.href),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...certificates.map((c) => `/certs/${c.slug}`),
  ].map((p) => ({ url: base + p }));
}
