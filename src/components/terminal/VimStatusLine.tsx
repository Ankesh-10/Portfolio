"use client";
import { usePathname } from "next/navigation";
import { tabFor } from "@/lib/routes";
import { RelTime } from "./RelTime";
import { BufferPos } from "./BufferPos";

type Build = { sha?: string; iso: string };

export function VimStatusLine({ build }: { build: Build }) {
  const tab = tabFor(usePathname());
  return (
    <div
      className="flex h-7 items-center gap-3 bg-[var(--term-chrome)] pr-3 text-[length:var(--fs-ui)] leading-4 text-t3"
      style={{ gridArea: "status" }}
    >
      <span className="flex h-full items-center bg-t2 px-3 font-bold text-bg">NORMAL</span>
      <span>~/{tab?.slug ?? "?"}.md</span>
      <span className="ml-auto flex items-center gap-3 max-md:hidden">
        {build.sha && (
          <span>
            <a
              className="underline decoration-ydim underline-offset-2 hover:text-yellow"
              href={`https://github.com/Ankesh-10/Portfolio/commit/${build.sha}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              main@{build.sha}
            </a>
            <span aria-hidden> · </span>
          </span>
        )}
        <RelTime iso={build.iso} />
        <BufferPos />
      </span>
    </div>
  );
}
