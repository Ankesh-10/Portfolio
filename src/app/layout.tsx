import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import QRCode from "qrcode";
import "./globals.css";
import { Shell } from "@/components/shell/Shell";
import { buildInfo, existingImages } from "@/lib/pages";
import { githubStats } from "@/lib/github";
import { projects } from "@/content/projects";
import { certificates } from "@/content/certificates";
import { photos } from "@/content/about";
import { githubUrl } from "@/content/links";
import { profile } from "@/content/profile";

// Full JetBrains Mono (official release woff2): the Google/Fontsource latin subset has no box-drawing glyphs.
const jb = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/JetBrainsMono-Medium.woff2", weight: "500" },
    { path: "../../public/fonts/JetBrainsMono-Bold.woff2", weight: "700" },
  ],
  variable: "--font-jb",
  display: "swap",
  preload: true,
});

const site = "https://ankesh.dev";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: `${profile.firstName} ${profile.lastName} — ${profile.role}`,
    template: `%s — ${profile.firstName} ${profile.lastName}`,
  },
  description: profile.tagline,
  openGraph: {
    type: "website",
    siteName: "ankesh.dev",
    title: `${profile.firstName} ${profile.lastName}`,
    description: profile.tagline,
  },
};

export const viewport: Viewport = { themeColor: "#070707", colorScheme: "dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Inline script: restore the `‖ motion` choice before first paint (spec §9).
  const init = `try{if(localStorage.getItem("motion")==="off")document.documentElement.dataset.motion="off"}catch(e){}`;
  const qr = QRCode.create(githubUrl, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const modules = Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => !!qr.modules.get(x, y)),
  );
  const images = existingImages([
    profile.photo,
    ...projects.map((p) => p.image),
    ...certificates.map((c) => c.image),
    ...photos.map((p) => p.src),
  ]);
  const github = await githubStats(githubUrl.split("/").pop()!);
  return (
    <html lang="en" className={jb.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body>
        <Shell build={buildInfo()} qr={modules} images={images} github={github}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
