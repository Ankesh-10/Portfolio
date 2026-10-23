"use client";
import { usePathname } from "next/navigation";
import { Buffer } from "@/components/terminal/Buffer";

// Renders inside the shell (spec §13): `cd: no such file or directory` + the `ls ~` tabs. Real 404 status.
export default function NotFound() {
  const path = usePathname();
  return (
    <Buffer
      title="Not found"
      lines={[
        { t: "prompt", cmd: `cd ~${path}`, path: "~", heading: "Not found" },
        { t: "text", parts: [`cd: no such file or directory: ~${path}`] },
        { t: "prompt", cmd: "ls ~", path: "~", heading: "Sections" },
        { t: "dirs" },
      ]}
    />
  );
}
