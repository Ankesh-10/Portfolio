"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { profile } from "@/content/profile";
import { skills } from "@/content/skills";
import { links } from "@/content/links";
import { useMotion } from "@/lib/motion-store";
import { Qr } from "./Qr";

export type BadgeProps = {
  flipped: boolean;
  onFlip: () => void;
  onDrag?: () => void;
  /** Sway with device tilt (inside the phone sheet only, spec §12). */
  device?: boolean;
  qr: boolean[][];
};

const statusDot =
  profile.status === "open to work" ? (
    <span className="text-red">●</span>
  ) : profile.status === "building" ? (
    <span className="text-t2">●</span>
  ) : (
    <span className="text-t3">○</span>
  );

const bars = Array.from(profile.serial).flatMap((c, i) => [
  1 + (c.charCodeAt(0) % 3),
  1 + ((c.charCodeAt(0) + i) % 2),
]);
const Corner = ({ cls }: { cls: string }) => (
  <span aria-hidden className={`absolute h-2 w-2 border-t4 ${cls}`} />
);

function Header() {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[length:var(--fs-label)] tracking-[.14em] text-t3">ANKESH.DEV</span>
      <span aria-hidden className="text-[length:var(--fs-micro)] tracking-[.14em] text-t4">
        ID//{profile.badgeId}
      </span>
    </div>
  );
}

function FlipButton({ flipped, onFlip }: { flipped: boolean; onFlip: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onFlip();
      }}
      aria-label={flipped ? "Show front of badge" : "Show back of badge"}
      className="ylink absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center text-[length:var(--fs-ui)]"
    >
      <span aria-hidden>↻</span>
      <span className="sr-only">flip</span>
    </button>
  );
}

export function IdBadge({ flipped, onFlip, onDrag, device, qr }: BadgeProps) {
  const motionState = useMotion();
  const reduce = useReducedMotion();
  const still = reduce || motionState === "off";
  // Subtle tilt toward the cursor, max 4° (spec §6.1). Stops with ‖ motion.
  const tx = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const ty = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  useEffect(() => {
    if (still) {
      tx.set(0);
      ty.set(0);
      return;
    }
    if (device) {
      const onTilt = (e: DeviceOrientationEvent) => {
        const clamp = (v: number) => Math.max(-12, Math.min(12, v));
        tx.set(clamp(((e.beta ?? 0) - 45) * -0.3));
        ty.set(clamp((e.gamma ?? 0) * 0.3));
      };
      window.addEventListener("deviceorientation", onTilt);
      return () => window.removeEventListener("deviceorientation", onTilt);
    }
    const onMove = (e: PointerEvent) => {
      tx.set(((e.clientY / window.innerHeight) * 2 - 1) * -4);
      ty.set(((e.clientX / window.innerWidth) * 2 - 1) * 4);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [still, device, tx, ty]);
  const down = useRef<{ x: number; y: number } | null>(null);
  const github = links.find((l) => l.kind === "github")!;
  const tags = skills.flatMap((g) => g.items.map((i) => i.name)).slice(0, 8);

  // A pointer gesture that moved > 4px is a drag, never a flip (spec §6.1).
  const onUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    onFlip();
  };

  return (
    <motion.div
      className="relative mx-auto flex w-[var(--badge-w)] flex-col items-center"
      style={{ transformOrigin: "50% 0" }}
      initial={reduce ? { opacity: 0 } : { y: "-110vh", rotate: 0 }}
      animate={reduce ? { opacity: 1 } : { y: 0, rotate: -3 }}
      exit={
        reduce
          ? { opacity: 0, transition: { duration: 0.15 } }
          : { y: "-110vh", transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } }
      }
      transition={
        reduce ? { duration: 0.15 } : { type: "spring", stiffness: 120, damping: 9, mass: 1 }
      }
      drag={!reduce}
      dragSnapToOrigin
      onDragStart={onDrag}
      dragElastic={0.25}
      dragMomentum={false}
    >
      {/* sway: idle pendulum ±0.6° over ~6s; stops with ‖ motion */}
      <motion.div
        className="flex w-full flex-col items-center"
        style={{ transformOrigin: "50% 0", rotateX: tx, rotateY: ty }}
        animate={still ? { rotate: 0 } : { rotate: [-0.6, 0.6] }}
        transition={
          still
            ? { duration: 0.2 }
            : { duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
      >
        {/* lanyard + clip */}
        <div
          aria-hidden
          className="relative w-6 border-x border-[#262626] bg-[#111]"
          style={{
            height: "var(--rest-offset)",
            marginTop: "-2px",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.03) 3px 4px)",
          }}
        >
          <span
            className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-[length:var(--fs-micro)] tracking-[.2em] text-[#3a3a3a]"
            style={{ writingMode: "vertical-rl" }}
          >
            ANKESH.DEV · ROOT ACCESS ·
          </span>
        </div>
        <div
          aria-hidden
          className="-mt-1 h-5 w-5 rounded-sm border border-t4 bg-gradient-to-b from-[#2a2a2a] to-[#111]"
        />

        <section
          role="group"
          aria-label="ID badge"
          onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={onUp}
          className="relative w-full cursor-grab touch-none active:cursor-grabbing"
          style={{ perspective: 1200 }}
        >
          <motion.div
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={still && reduce ? {} : { rotateY: flipped ? 180 : 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.2, 0, 0, 1] }}
          >
            {/* FRONT */}
            <div
              inert={flipped}
              className="badge-face relative flex flex-col gap-3 rounded-[14px] border border-line3 p-4"
              style={{
                background: "var(--card)",
                backfaceVisibility: "hidden",
                opacity: reduce && flipped ? 0 : 1,
              }}
            >
              <Corner cls="left-1.5 top-1.5 border-l border-t" />
              <Corner cls="right-1.5 top-1.5 border-r border-t" />
              <Corner cls="bottom-1.5 left-1.5 border-b border-l" />
              <Corner cls="bottom-1.5 right-1.5 border-b border-r" />
              <span
                aria-hidden
                className="mx-auto -mt-1 h-1.5 w-12 rounded-full bg-bg ring-1 ring-line3"
              />
              <Header />
              <div
                className="relative w-full overflow-hidden rounded-sm border border-line3 bg-[#0a0a0a]"
                style={{ height: "var(--photo-h)" }}
              >
                <Image
                  src={profile.photo}
                  alt="Ankesh Jaiswal"
                  fill
                  priority
                  sizes="300px"
                  className="object-cover"
                  style={{ filter: "grayscale(1) contrast(1.1)" }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px)",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute left-2 top-1.5 text-[length:var(--fs-micro)] tracking-[.12em] text-t4"
                >
                  IMG_0001.RAW
                </span>
                <span
                  aria-hidden
                  className="absolute bottom-1.5 right-2 text-[length:var(--fs-micro)] tracking-[.12em] text-t4"
                >
                  B/W · 4:5
                </span>
              </div>
              <div>
                <p className="m-0 text-[length:var(--fs-lead)] font-bold leading-7 text-t1">
                  {profile.firstName.toUpperCase()} {profile.lastName.toUpperCase()}
                </p>
                <p className="m-0 text-[length:var(--fs-ui)] leading-4 text-t3">{profile.role}</p>
              </div>
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[length:var(--fs-ui)] leading-4">
                {[
                  ["LOC", profile.location],
                  ["SINCE", String(profile.since)],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-[length:var(--fs-label)] uppercase tracking-[.14em] text-t3">
                      {k}
                    </dt>
                    <dd className="m-0 text-t2">{v}</dd>
                  </div>
                ))}
                <dt
                  aria-hidden
                  className="text-[length:var(--fs-micro)] uppercase tracking-[.14em] text-t4"
                >
                  ACCESS
                </dt>
                <dd aria-hidden className="m-0 text-[length:var(--fs-micro)] text-t4">
                  root
                </dd>
                <dt className="text-[length:var(--fs-label)] uppercase tracking-[.14em] text-t3">
                  STATUS
                </dt>
                <dd className="m-0 text-t2">
                  <span aria-hidden>{statusDot} </span>
                  {profile.status}
                </dd>
              </dl>
              <div className="relative flex items-end justify-between gap-2 pr-8 pt-1">
                <div aria-hidden className="flex h-7 items-stretch gap-px">
                  {bars.map((w, i) => (
                    <span
                      key={i}
                      className={i % 2 ? "bg-transparent" : "bg-t2"}
                      style={{ width: w }}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    aria-hidden
                    className="text-[length:var(--fs-micro)] tracking-[.12em] text-t4"
                  >
                    SN {profile.serial}
                  </span>
                  <a
                    className="text-[length:var(--fs-micro)] text-t3 underline decoration-ydim underline-offset-2 hover:text-yellow"
                    href={github.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {github.href.replace("https://", "")}
                  </a>
                </div>
                <FlipButton flipped={flipped} onFlip={onFlip} />
              </div>
            </div>

            {/* BACK */}
            <div
              inert={!flipped}
              className="badge-face absolute inset-0 flex flex-col gap-3 rounded-[14px] border border-line3 p-4"
              style={{
                background: "var(--card)",
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                opacity: reduce && !flipped ? 0 : 1,
              }}
            >
              <Header />
              <div className="flex flex-col gap-1 text-[length:var(--fs-ui)] leading-4 text-t2">
                {profile.bio.map((l) => (
                  <p key={l} className="m-0">
                    {l}
                  </p>
                ))}
              </div>
              <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
                {tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-sm border border-line3 px-1.5 text-[length:var(--fs-label)] leading-4 text-t2"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <ul className="m-0 list-none p-0 text-[length:var(--fs-ui)] leading-5">
                {links.map((l) => (
                  <li key={l.label}>
                    <span aria-hidden className="text-t4">
                      →{" "}
                    </span>
                    <a
                      className="slink"
                      href={l.href}
                      {...(l.kind === "resume"
                        ? { download: true }
                        : l.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="relative mt-auto flex items-end justify-center">
                <Qr
                  modules={qr}
                  label={`QR code linking to ${github.href.replace("https://", "")}`}
                />
                <FlipButton flipped={flipped} onFlip={onFlip} />
              </div>
            </div>
          </motion.div>
        </section>
      </motion.div>
    </motion.div>
  );
}
