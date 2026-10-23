import { profile } from "@/content/profile";

/** Phone home header (spec §12): decorative mini badge + name, role and status as real text, above the fold. */
export function PhoneIntro() {
  return (
    <div className="hidden items-center gap-4 border-b border-line1 px-4 pb-4 pt-3 max-md:flex">
      <div aria-hidden className="flex shrink-0 flex-col items-center">
        <span className="h-4 w-2.5 border-x border-[#262626] bg-[#111]" />
        <span className="-mt-0.5 h-2 w-3 rounded-[2px] border border-t4 bg-[#1a1a1a]" />
        <span
          className="badge-face -mt-px flex h-[76px] w-[58px] -rotate-3 flex-col gap-1 rounded-[6px] border border-line3 p-1.5"
          style={{ background: "var(--card)" }}
        >
          <span className="mx-auto h-[3px] w-4 rounded-full bg-bg ring-1 ring-line3" />
          <span className="flex flex-1 items-center justify-center rounded-[2px] border border-line3 bg-[#0a0a0a] text-[13px] font-bold text-[#2a2a2a]">
            AJ
          </span>
          <span className="h-[3px] w-8 bg-t4" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[20px] font-bold leading-7 text-t1">
          {profile.firstName} {profile.lastName}
        </p>
        <p className="m-0 text-[length:var(--fs-ui)] leading-5 text-t3">{profile.role}</p>
        <p className="m-0 text-[length:var(--fs-ui)] leading-5 text-t2">
          <span aria-hidden className={profile.status === "open to work" ? "text-red" : "text-t3"}>
            {profile.status === "busy" ? "○" : "●"}{" "}
          </span>
          {profile.status}
        </p>
      </div>
    </div>
  );
}
