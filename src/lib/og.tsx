import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { figletCompact } from "@/content/figlet";
import { profile } from "@/content/profile";

// OG images in the site's own style (spec §13): a dim terminal window, a prompt, big white text.
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const font = (f: string) => readFileSync(join(process.cwd(), "src/assets/fonts", f));

type Props = { cmd: string; title?: string; sub?: string; art?: boolean };

export function renderOg({ cmd, title, sub, art }: Props) {
  const regular = font("JetBrainsMono-Regular.ttf");
  const bold = font("JetBrainsMono-Bold.ttf");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#070707",
        padding: 56,
        fontFamily: "JB",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: "1px solid #2c2c2c",
          borderRadius: 16,
          background: "#0c0c0c",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 56,
            padding: "0 24px",
            borderBottom: "1px solid #191919",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ width: 14, height: 14, borderRadius: 7, background: "#3a3a3a" }}
            />
          ))}
          <div style={{ marginLeft: "auto", color: "#8a8a8a", fontSize: 20 }}>ankesh.dev</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "36px 48px", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 28, color: "#a8a8a8" }}>
            <span style={{ color: "#8a8a8a" }}>ankesh@portfolio:~$</span>
            <span style={{ marginLeft: 14 }}>{cmd}</span>
          </div>
          {art ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 40,
                color: "#f5f5f5",
                fontSize: 26,
                lineHeight: 1,
              }}
            >
              {figletCompact.single.map((row, i) => (
                <div key={i} style={{ whiteSpace: "pre", height: 34.32 }}>
                  {row}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                marginTop: 44,
                fontSize: 64,
                fontWeight: 700,
                color: "#f5f5f5",
                lineHeight: 1.15,
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 30,
              color: "#a8a8a8",
              maxWidth: 940,
              lineHeight: 1.35,
            }}
          >
            {sub ?? profile.tagline}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              alignItems: "center",
              fontSize: 24,
              color: "#8a8a8a",
            }}
          >
            <span
              style={{
                color: profile.status === "open to work" ? "#ff3b30" : "#a8a8a8",
                marginRight: 12,
              }}
            >
              ●
            </span>
            {profile.status}
          </div>
        </div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "JB", data: regular, weight: 400, style: "normal" },
        { name: "JB", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
