"use client";
import { useSyncExternalStore } from "react";
import { Buffer } from "@/components/terminal/Buffer";

// Renders inside the shell (spec §13): `cd: no such file or directory` + the `ls ~` tabs. Real 404 status.
export default function NotFound() {
  // The server renders the shared 404 shell and cannot know the URL, so read it from the client snapshot
  // (hydration-safe: the server snapshot is empty, then it updates).
  const path = useSyncExternalStore(
    () => () => {},
    () => location.pathname,
    () => "",
  );
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
