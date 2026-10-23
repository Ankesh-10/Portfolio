import { renderOg, ogSize, ogContentType } from "@/lib/og";

export const alt = "Ankesh Jaiswal — full-stack developer";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg({ cmd: "figlet ankesh jaiswal", art: true });
}
