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
  // Inline script, before first paint (spec §9, ≤ 1KB): restores `‖ motion` and picks the reveal:
  // `boot` on the first visit of a session to `/` (desktop and tablet), `land` on any other first
  // paint, nothing when motion is paused or reduced. Any key or click skips; at 1.6s it is done,
  // so the text is complete even if the main bundle never loads. No JS: no attribute, no animation.
  const init = `try{var d=document.documentElement,s=sessionStorage,m=localStorage.getItem("motion")=="off",r;if(m)d.dataset.motion="off";if(!m&&!matchMedia("(prefers-reduced-motion: reduce)").matches){r=location.pathname=="/"&&!s.getItem("rv-booted")&&matchMedia("(min-width: 768px)").matches?"boot":"land";d.dataset.reveal=r;var k=function(){if(d.dataset.reveal==r)d.dataset.reveal="skip";removeEventListener("keydown",k,!0);removeEventListener("pointerdown",k,!0)};addEventListener("keydown",k,!0);addEventListener("pointerdown",k,!0);setTimeout(function(){if(d.dataset.reveal==r)d.dataset.reveal="done"},1600)}s.setItem("rv-booted","1")}catch(e){}`;
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
    <html lang="en" className={jb.variable} suppressHydrationWarning>
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
