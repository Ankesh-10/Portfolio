"use client";
import { usePathname } from "next/navigation";
import { tabFor } from "@/lib/routes";
import { profile } from "@/content/profile";
import { Clock } from "./Clock";
import { MotionToggle } from "./MotionToggle";

const dot = {
  "open to work": <span className="text-red">●</span>,
  building: <span className="text-t2">●</span>,
  busy: <span className="text-t3">○</span>,
} as const;

/** One quiet line: path on the left, status · clock · motion · resume on the right. */
export function TitleBar() {
  const tab = tabFor(usePathname());
  return (
    <header
      className="flex h-10 items-center gap-5 px-6 text-[length:var(--fs-ui)] leading-4 text-t3 max-md:px-4"
      style={{ gridArea: "title" }}
    >
      <span aria-hidden className="text-t4">
        ~/{tab?.slug ?? "?"}
      </span>
      <span className="ml-auto whitespace-nowrap">
        <span aria-hidden>{dot[profile.status]} </span>
        {profile.status}
      </span>
      <Clock />
      <MotionToggle />
      <a href="/resume.pdf" download className="ylink whitespace-nowrap">
        resume<span aria-hidden> ↓</span>
      </a>
    </header>
  );
}
