"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { tabFor, wideTabs } from "@/lib/routes";
import { useVisual } from "@/lib/visual-store";
import { visitFor } from "@/lib/visited";
import type { GithubStats } from "@/lib/github";
import { sortedProjects } from "@/content/projects";
import { certificates } from "@/content/certificates";
import { photos } from "@/content/about";
import { skills } from "@/content/skills";
import { IdBadge } from "./IdBadge";
import { ProjectPreview } from "./ProjectPreview";
import { PhotoStack } from "./PhotoStack";
import { SkillGraphs } from "./SkillGraphs";
import { CertDeck } from "./CertDeck";
import { Lightbox, type LightboxItem } from "./Lightbox";

type Box = { items: LightboxItem[]; start: number; origin: DOMRect };

/** Left visual (spec §6.7): swaps per tab with a 200ms crossfade; the badge drops and retracts. */
export function VisualPanel({
  qr,
  images,
  github,
}: {
  qr: boolean[][];
  images: string[];
  github: GithubStats | null;
}) {
  const pathname = usePathname();
  const slug = tabFor(pathname)?.slug ?? "";
  const deep = pathname.split("/")[2];
  const reduce = useReducedMotion();
  // Visual timings follow the terminal's (spec §9): a new visual enters at 400ms on a first visit
  // and 240ms on a return; the badge drops at 100ms in the boot; a deep link shows it at once.
  const visit = visitFor(pathname);
  const enter = { boot: 0.1, land: 0, instant: 0, first: 0.4, return: 0.24 }[visit];
  const hasBadge = slug === "home" || slug === "contact";
  const [flipped, setFlipped] = useState(slug === "contact");
  const [hintGone, setHintGone] = useState(false); // `# drag me · ↻ flip` goes away after the first drag or flip
  const [box, setBox] = useState<Box | null>(null);
  const exists = (src: string) => images.includes(src);

  // Hovered/focused row first, then the open item (deep link), then the first in the list.
  const projectSlug = useVisual(pathname, "project") ?? (slug === "projects" ? deep : undefined);
  const certSlug = useVisual(pathname, "cert") ?? (slug === "certs" ? deep : undefined);
  const photo = useVisual(pathname, "photo");
  const skill = useVisual(pathname, "skill");
  const projects = sortedProjects();
  const project = projects.find((p) => p.slug === projectSlug) ?? projects[0];

  // Home ↔ contact: the badge stays and flips in place (spec §9). Adjusted during render, not in an effect.
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setBox(null);
    if (slug === "contact") setFlipped(true);
    else if (slug === "home") setFlipped(false);
  }

  const wide = wideTabs.has(slug);
  const open = (items: LightboxItem[], start: number, el: HTMLElement) =>
    setBox({ items, start, origin: el.getBoundingClientRect() });

  let visual: React.ReactNode = null;
  if (slug === "projects")
    visual = (
      <ProjectPreview
        project={project}
        exists={!!project && exists(project.image)}
        onOpen={(el) => {
          const shots = projects
            .filter((p) => exists(p.image))
            .map((p) => ({ src: p.image, alt: `Screenshot of ${p.name}`, aspect: 16 / 10 }));
          open(
            shots,
            Math.max(
              0,
              shots.findIndex((s) => s.src === project.image),
            ),
            el,
          );
        }}
      />
    );
  else if (slug === "about")
    visual = (
      <PhotoStack
        photos={photos}
        front={photo}
        exists={exists}
        onOpen={(src, el) => {
          const list = photos
            .filter((p) => exists(p.src))
            .map((p) => ({ src: p.src, alt: p.alt, aspect: 4 / 5 }));
          open(
            list,
            Math.max(
              0,
              list.findIndex((p) => p.src === src),
            ),
            el,
          );
        }}
      />
    );
  else if (slug === "skills")
    visual = <SkillGraphs skills={skills} github={github} active={skill} />;
  else if (slug === "certs")
    visual = (
      <CertDeck
        certs={certificates}
        selected={certSlug}
        path={pathname}
        exists={exists}
        onOpen={(s, el) => {
          const list = certificates
            .filter((c) => exists(c.image))
            .map((c) => ({ src: c.image, alt: `${c.name} — ${c.issuer}`, aspect: 1.414 }));
          const c = certificates.find((x) => x.slug === s)!;
          open(
            list,
            Math.max(
              0,
              list.findIndex((x) => x.src === c.image),
            ),
            el,
          );
        }}
      />
    );

  return (
    <aside
      id="visual"
      aria-label="Visual"
      tabIndex={-1}
      className="relative z-10 shrink-0 overflow-clip max-md:hidden"
      style={{
        order: -1,
        width: wide ? "var(--visual-w-wide)" : "var(--visual-w)",
        // The width tweens only inside the gap after `clear`, so text never reflows on screen.
        transition: reduce ? "none" : "width 180ms cubic-bezier(0.2, 0, 0, 1) 60ms",
      }}
    >
      <AnimatePresence custom={visit}>
        {hasBadge ? (
          <IdBadgeSlot
            key="badge"
            flipped={flipped}
            onFlip={() => {
              setHintGone(true);
              setFlipped((f) => !f);
            }}
            onDrag={() => setHintGone(true)}
            showHint={slug === "home" && !hintGone}
            qr={qr}
            photo={exists}
            delay={enter}
          />
        ) : (
          <motion.div
            key={slug || "x"}
            className="absolute inset-0"
            initial={{ opacity: reduce ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            transition={{ duration: 0.2, delay: reduce ? 0 : enter, ease: [0.2, 0, 0, 1] }}
          >
            {visual}
          </motion.div>
        )}
      </AnimatePresence>
      {box && (
        <Lightbox
          items={box.items}
          start={box.start}
          origin={box.origin}
          onClose={() => setBox(null)}
        />
      )}
    </aside>
  );
}

function IdBadgeSlot({
  showHint,
  photo,
  ...props
}: {
  flipped: boolean;
  onFlip: () => void;
  onDrag: () => void;
  showHint: boolean;
  qr: boolean[][];
  photo: (src: string) => boolean;
  delay: number;
}) {
  return (
    <div className="absolute inset-x-0 top-0 [--badge-w:296px] [--photo-h:370px] [--rest-offset:clamp(96px,14vh,160px)] max-[1279px]:[--badge-w:272px] max-[1279px]:[--photo-h:300px] [@media(max-height:820px)]:[--badge-w:252px] [@media(max-height:820px)]:[--photo-h:200px]">
      <IdBadge {...props} hasPhoto={photo} />
      {showHint && (
        <p className="m-0 mt-4 px-6 text-[length:var(--fs-ui)] text-t3">
          <span aria-hidden># </span>drag me · ↻ flip
        </p>
      )}
    </div>
  );
}
