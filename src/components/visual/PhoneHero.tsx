"use client";
import { useState } from "react";
import Image from "next/image";
import { profile } from "@/content/profile";
import { BadgeSheet } from "./BadgeSheet";

const dot =
  profile.status === "open to work" ? (
    <span className="text-red">●</span>
  ) : profile.status === "building" ? (
    <span className="text-t2">●</span>
  ) : (
    <span className="text-t3">○</span>
  );

/**
 * Phone home header (spec §12): a mini badge thumbnail (decorative art inside a real button) beside the name
 * (the page's visible <h1>), role and status as real text, so all of it is above the fold.
 */
export function PhoneHero() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-4 px-4 pb-3 pt-2 md:hidden">
      <button
        type="button"
        aria-label="Open ID badge"
        onClick={() => setOpen(true)}
        className="relative h-[104px] w-[84px] shrink-0"
      >
        <span aria-hidden className="absolute inset-0 block">
          <span className="absolute left-1/2 top-0 block h-5 w-2.5 -translate-x-1/2 bg-[#111] ring-1 ring-[#262626]" />
          <span
            className="absolute inset-x-0 bottom-0 top-4 block overflow-hidden rounded-lg border border-line3"
            style={{ background: "var(--card)", transform: "rotate(-3deg)" }}
          >
            <span className="relative mx-1.5 mt-3 block h-[56px] overflow-hidden rounded-sm border border-line3">
              <Image
                src={profile.photo}
                alt=""
                fill
                sizes="84px"
                className="object-cover"
                style={{ filter: "grayscale(1) contrast(1.1)" }}
              />
            </span>
            <span className="mx-1.5 mt-1.5 block h-1 w-10 bg-t4" />
            <span className="mx-1.5 mt-1 block h-1 w-7 bg-t5" />
          </span>
        </span>
      </button>
      <div className="min-w-0">
        <h1 className="m-0 text-xl font-bold leading-7 text-t1">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="m-0 text-[length:var(--fs-ui)] leading-5 text-t2">{profile.role}</p>
        <p className="m-0 text-[length:var(--fs-ui)] leading-5 text-t2">
          <span aria-hidden>{dot} </span>
          {profile.status}
        </p>
      </div>
      {open && <BadgeSheet onClose={() => setOpen(false)} />}
    </div>
  );
}
