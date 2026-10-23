import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { statSync } from "node:fs";
import QRCode from "qrcode";
import "./globals.css";
import { Shell } from "@/components/shell/Shell";
import { buildInfo } from "@/lib/pages";
import { getGithubStats } from "@/lib/github";
import { githubUrl } from "@/content/links";
import { profile } from "@/content/profile";

// Full JetBrains Mono (official release woff2): the Google/Fontsource latin subset has no box-drawing glyphs.
const jb = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-Regular.woff2", weight: "400" },
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
  // Inline boot script (≤ 1KB, runs before first paint — spec §9). It restores `‖ motion`, decides boot (first visit
  // to /) vs landing (any other page load), lets any key / click skip, and removes the attribute at the 1.5s end
  // state. No motion attribute is set when motion is paused or reduced, so those visitors never get the intro.
  const init = `(function(){var d=document.documentElement;try{var off=localStorage.getItem("motion")==="off";if(off)d.dataset.motion="off";if(off||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var s=sessionStorage,v=JSON.parse(s.getItem("visited")||"[]"),p=location.pathname.split("/")[1]||"home",a=p==="home"&&!v.length?"data-boot":"data-landing";if(v.indexOf(p)<0){v.push(p);s.setItem("visited",JSON.stringify(v))}d.setAttribute(a,"1");function k(){d.setAttribute(a,"skip");removeEventListener("keydown",k,true);removeEventListener("pointerdown",k,true)}addEventListener("keydown",k,true);addEventListener("pointerdown",k,true);setTimeout(function(){d.removeAttribute(a)},1600)}catch(e){}})()`;
  const resumeKb = Math.max(1, Math.round(statSync("public/resume.pdf").size / 1024));
  const qr = QRCode.create(githubUrl, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const modules = Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) => !!qr.modules.get(x, y)),
  );
  return (
    <html lang="en" className={jb.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body>
        <Shell build={buildInfo()} qr={modules} resumeKb={resumeKb} gh={await getGithubStats()}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
