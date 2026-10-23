# Current state of the owner's portfolio codebase (/home/user/Portfolio)

Scope: repository files only (read-only). Sources are repo paths. HEAD at time of reading: `770f385` (merge of PR #1, "Scaffold Next.js app: tokens, terminal shell, blocks, routes, ID badge"); only 4 commits total. Checks were run on a clean `git archive HEAD` copy in a scratch directory (the repo has no `node_modules`), so the repo itself was not touched.

## 1. Built vs. not-yet-built features (CLAUDE.md + PORTFOLIO_SPEC.md)

### Takeaway
The site is a static, server-rendered terminal shell: all six tabs and deep-link routes render real content, the chrome (title bar, vim status line, command line, tmux tabs) and the ID badge exist, but almost all interactivity and motion that make it feel "alive" (command parser/palette, boot/typing/stream text animations, tab-change timelines, left-panel visuals, phone layout, contact form) are still unbuilt (Phases 3-6 of spec §15).

### Cited Findings
- Built (per CLAUDE.md "Done"): Next.js 16 App Router + TS + Tailwind v4 + Motion; tokens in `globals.css`; self-hosted full JetBrains Mono; hex-dump background canvas; Shell/TerminalWindow/TitleBar/TmuxBar (CSS container-query tiers)/VimStatusLine/CommandLine (navigation + `0`-`5`/`:` shortcuts only); all output blocks; six routes + `/projects/[slug]` + `/certs/[slug]` + not-found + `/work` redirects; ID badge (front/back, real QR, spring drop, sway, drag, flip); `scripts/contrast.mjs` — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- Not yet built (per CLAUDE.md "Not yet"): command parser/registry/palette/easter eggs (Phase 3); PhotoStack, ProjectPreview, SkillGraphs + GitHub data, CertDeck, Lightbox, BadgeSheet (Phase 4; left panel shows a placeholder frame); `schedule()` timeline, boot sequence, typing/stream modes (Phase 5); phone layout, mail form + `/api/contact`, OG images, tests (Phase 6). Real photo, screenshots, certificate images and content are placeholders — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- Spec build phases: Phase 3 commands (parser, autocomplete, history, shortcuts off, palette, easter eggs); Phase 4 visual area (PhotoStack, ProjectPreview, SkillGraphs w/ GitHub data, CertDeck, Lightbox, BadgeSheet, VisualPanel transitions + narrow/wide resize); Phase 5 motion (background modes + `theme` command, 7 text appearance modes with riding cursor, CSS reveal from `schedule()`, boot, first/return-visit timelines); Phase 6 (phone/tablet layouts, 2x4 bottom bar, keyboard-docked command line, mini badge + sheet, a11y pass, OG images, contact form route, Lighthouse >= 95, Vercel deploy) — [PORTFOLIO_SPEC.md §15](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Note: all checkboxes in spec §15 are still unchecked, even for done work (spec not updated to reflect progress) — [PORTFOLIO_SPEC.md §15](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Spec §2 tech stack: Next.js App Router, Tailwind v4 + CSS variables, Motion (`motion/react`) for springs/layout/presence, JetBrains Mono full glyph set, pre-generated figlet (ANSI Shadow), GitHub GraphQL at build with daily ISR, Vercel hosting — [PORTFOLIO_SPEC.md §2](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Dependencies actually installed: `motion ^14.6.0`, `next ^16.4.2`, `qrcode`, `react ^19.3.1`; no testing, no GitHub client, no mail (Resend/Formspree) library — [package.json](/home/user/Portfolio/package.json)

### Inferences
- The gap to a polished, interactive reference site is mostly in planned-but-unbuilt Phases 3-6, not in missing design direction: the spec already defines the command system, animations, lightbox, palette and phone layout in detail. A gap analysis can largely say "implement spec §X" rather than invent new features.
- Because content is placeholder (2 projects, 1 cert, placeholder photo/copy), the live site would currently look sparse regardless of features.

### Gaps
- Whether the site is deployed anywhere (no Vercel config or domain evidence in repo besides `metadataBase: https://ankesh.dev` in layout.tsx).

## 2. Routes, components, content files, and existing motion/responsive handling

### Takeaway
There are 8 page routes plus robots/sitemap, ~30 small components (~2,500 lines of source total), and 9 typed content files. Motion exists only in the ID badge (Motion springs), a 200ms fade of the left placeholder frame, a 180ms visual-area width transition, hover underline transitions, and a 2s-tick background canvas. Responsiveness is handled by CSS container queries on the terminal/buffer and a few `max-md:` tweaks; there is no real phone layout.

### Cited Findings
**Routes** (build output confirms 14 static/SSG pages): `/`, `/about`, `/projects`, `/projects/[slug]` (project-name, project-two), `/skills`, `/certs`, `/certs/[slug]` (aws-cloud-practitioner), `/contact`, not-found, `/robots.txt`, `/sitemap.xml`, `/icon.svg`; `/work` and `/work/:slug` permanent redirects in `next.config.ts` — [src/app/](/home/user/Portfolio/src/app), [next.config.ts](/home/user/Portfolio/next.config.ts). No `api/contact/route.ts`, no `opengraph-image.tsx`, no `loading.tsx`/`template.tsx`.
- Each page is a thin server component: e.g. `app/page.tsx` renders `<Buffer title lines={homePage().lines} />`; page line arrays are built in `src/lib/pages.ts` (264 lines) from content — [src/app/page.tsx](/home/user/Portfolio/src/app/page.tsx), [src/lib/pages.ts](/home/user/Portfolio/src/lib/pages.ts)

**Components** — [src/components/](/home/user/Portfolio/src/components)
- `shell/`: `Shell.tsx` (skip links, background, terminal, visual aside), `Background.tsx` (hex-dump canvas).
- `terminal/`: `TerminalWindow`, `TitleBar`, `Buffer`, `Line`, `Prompt`, `VimStatusLine`, `CommandLine`, `TmuxBar`, `Clock`, `RelTime`, `MotionToggle`, `NavTracker`, `Nudge`.
- `blocks/`: `Figlet`, `Table`, `Links` (Links + Dirs), `Rows` (Featured + Projects), `GitLog`, `Tree`, `Detail` (Detail + Kv), `Inline`.
- `visual/`: `VisualPanel`, `IdBadge` (325 lines, the largest component), `Qr`.
- Missing vs. spec §11: `CommandPalette`, `LiveRegion`, `MailForm`, `BadgeSheet`, `PhotoStack`, `ProjectPreview`, `SkillGraphs`, `CertDeck`, `Lightbox`; `lib/commands.ts`, `lib/typing.ts`, `lib/timeline.ts`, `lib/github.ts`, `lib/visited.ts` — [PORTFOLIO_SPEC.md §11](/home/user/Portfolio/PORTFOLIO_SPEC.md)

**Content files** (all marked PLACEHOLDER): `profile.ts`, `links.ts`, `projects.ts` (2 projects), `certificates.ts` (1 cert), `skills.ts`, `timeline.ts`, `about.ts`, `figlet.ts`, `types.ts` — [src/content/](/home/user/Portfolio/src/content). `public/` holds only `fonts/` and `resume.pdf`; no `images/`, project screenshots or cert images exist — [public/](/home/user/Portfolio/public)

**Motion that exists today**
- ID badge: drop-in from `y: -110vh` with spring (stiffness 120, damping 9, mass 1) to `rotate: -3`; exit retract to `-110vh` over 400ms; idle sway `rotate [-0.6, 0.6]`; `drag` with `dragSnapToOrigin`, `dragElastic 0.25`; 3D flip `rotateY 180` over 600ms; >4px pointer movement counts as drag not flip; reduced-motion path = opacity fades — [src/components/visual/IdBadge.tsx](/home/user/Portfolio/src/components/visual/IdBadge.tsx)
- Cursor tilt toward the pointer (spec §6.1, max 4°) is not implemented: no pointer-move/tilt code in components — [src/components/visual/IdBadge.tsx](/home/user/Portfolio/src/components/visual/IdBadge.tsx)
- Left panel: `AnimatePresence` swaps badge vs. a placeholder frame (`# photos go here`, etc.) with 200ms fade in / 60ms out; visual-area width transition 180ms `cubic-bezier(0.2,0,0,1)` for wide tabs — [src/components/visual/VisualPanel.tsx](/home/user/Portfolio/src/components/visual/VisualPanel.tsx)
- Tmux tab hover: 150ms yellow underline scale-x grow; `.slink` 150ms colour transitions — [TmuxBar.tsx](/home/user/Portfolio/src/components/terminal/TmuxBar.tsx), [globals.css](/home/user/Portfolio/src/app/globals.css)
- Background: hex-dump canvas redrawn every 2s (scrolls 1 line), paused when hidden, on `‖ motion` off, or under reduced motion; only `hex` mode exists (no `log` mode or `theme` command) — [src/components/shell/Background.tsx](/home/user/Portfolio/src/components/shell/Background.tsx)
- `‖ motion` toggle persisted in localStorage and applied pre-paint via an inline `<head>` script — [src/lib/motion-store.ts](/home/user/Portfolio/src/lib/motion-store.ts), [src/app/layout.tsx](/home/user/Portfolio/src/app/layout.tsx)
- Buffer text has no appearance animation: lines render instantly on route change (no `clear`/`type`/`stream`/`draw`, no riding cursor, no boot) — [src/components/terminal/Buffer.tsx](/home/user/Portfolio/src/components/terminal/Buffer.tsx)

**Responsive handling that exists today**
- Breakpoint tokens: <=1023px lead 18px/body 14px, visual width 40%; <=767px window margin 0, lead line-height 24px — [globals.css](/home/user/Portfolio/src/app/globals.css)
- Container queries: `.term-win` is `container: term / inline-size` driving tmux tiers (hide clock <780px, move `‖ motion` to title bar + short status <700px, drop brackets <570px, drop digits and wrap to two rows <480px); `<main>` is `container: buf / size` driving figlet form (full >=560w & >=640h, compact, stacked <500w), stats grid (4 → 2x2 → 2 cols), project rows (drop year <620px, wrap summary <450px) — [globals.css](/home/user/Portfolio/src/app/globals.css), [TerminalWindow.tsx](/home/user/Portfolio/src/components/terminal/TerminalWindow.tsx)
- Spec wanted tmux tiers chosen by measured content width with ResizeObserver; implementation uses fixed container-query thresholds instead (simpler, no JS) — [PORTFOLIO_SPEC.md §4](/home/user/Portfolio/PORTFOLIO_SPEC.md), [globals.css](/home/user/Portfolio/src/app/globals.css)
- Badge sizing: 296px card / 370px photo; 272/300 below 1280px wide; 252/200 when viewport height <=820px — [VisualPanel.tsx](/home/user/Portfolio/src/components/visual/VisualPanel.tsx)
- Phone (<768px): the left visual aside is simply `max-md:hidden` (no badge, no visuals at all); the terminal loses its radius/border; gutter shrinks to 32px; status-line build info and command-line hint are hidden; title-bar path hidden. No top bar, mini badge, bottom 2x4 tab bar, keyboard-docked command line or inline visuals — [VisualPanel.tsx](/home/user/Portfolio/src/components/visual/VisualPanel.tsx), [Shell.tsx](/home/user/Portfolio/src/components/shell/Shell.tsx), [Buffer.tsx](/home/user/Portfolio/src/components/terminal/Buffer.tsx), [PORTFOLIO_SPEC.md §12](/home/user/Portfolio/PORTFOLIO_SPEC.md)

### Inferences
- The page is a fixed `h-dvh` app shell with scrolling only inside the buffer; on phones (`max-md:block` on the shell) the terminal grid still uses `minmax(0,1fr)` for the buffer, so the layout is likely a cramped desktop terminal rather than a scrolling mobile page (not visually verified).
- With only the badge animated, tab switches feel like abrupt full content swaps on the right, while the left fades — i.e. the "story" motion the spec describes is absent.

### Gaps
- No visual/screenshot verification was done (dev server not run in a browser); responsive behaviour is inferred from code.

## 3. Fixed design preferences any change must respect

### Takeaway
The owner wants a near-monochrome black terminal aesthetic with very sparing red (status dot only) and yellow (interactive only), terminal-text backgrounds, a real B&W photo badge, the command line inside the right terminal, and no "eye-catchy" effects; every animation needs a reduced-motion path and readable text must pass AA.

### Cited Findings
- Black background, very sparing accents: red `#ff3b30` only for status dots; yellow `#ffd60a` only for cursor, current line number, links, key hints; everything else greyscale. Owner rejected anything "eye-catchy": glows, bright accent bars, solid coloured chrome — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- Rejected backgrounds: line grids, dot matrices, character "blueprint" grids ("cheap"); use terminal text (hex dump or logs), very dim — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- ID badge must be a monochrome tech card with a real B&W photo — not coloured, not ASCII art, not an illustrated face — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- Command line lives inside the right-hand terminal only; owner prefers to discuss design before building — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- Design principles: recruiter first (everything reachable by clicking; commands are accelerators); left = visuals, right = words; monochrome first; readable text AA (>=4.5:1, >=11px rendered); "real or decorative" (no fake data); at most 6 yellow controls per screen; authentic terminal grammar (prompts, figlet, cat, ls, git log, vim, tmux); everything monospace on a 4px rhythm; "Motion has a purpose... No decorative glow, no neon" — [PORTFOLIO_SPEC.md §1](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Tokens: `--bg #070707`, `--term-bg rgba(9,9,9,.72)` (semi-transparent, no backdrop-filter), text tiers `#f5f5f5/#a8a8a8/#8a8a8a` readable, `#4a4a4a/#272727/#1e1e1e` decorative, texture `#151515/#1d1d1d`, `--yellow-dim #8a7400` link underline — [PORTFOLIO_SPEC.md §3](/home/user/Portfolio/PORTFOLIO_SPEC.md), implemented verbatim in [globals.css](/home/user/Portfolio/src/app/globals.css)
- Animation rules: terminal text never fades/slides/blurs in — it types, streams, or draws like stdout; UI easing `cubic-bezier(0.2,0,0,1)`, no ease-in for entrances; only the badge uses springs; hard tab-change budgets (terminal complete <=830ms first visit, <=360ms return; visual interactive <=650ms); boot must finish <=1.5s and be skippable — [PORTFOLIO_SPEC.md §9](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Every animation needs a `prefers-reduced-motion` path; generic CSS class names (`.pl`, `.cur`, `.c`) collided before — use scoped styles or Tailwind; figlet is pre-generated (no runtime dependency) — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md)
- Layout fixed: visual area `clamp(380px,32vw,520px)` left, terminal with 24px margin/12px radius right, widening on projects/certs; z-order background 0 → visual 10 → terminal 20 → palette 40 → modals 50 — [PORTFOLIO_SPEC.md §3-4](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Performance budget: LCP < 1.5s, JS < 150KB gzipped, CLS ≈ 0; Lighthouse >= 95 — [PORTFOLIO_SPEC.md §13, §15](/home/user/Portfolio/PORTFOLIO_SPEC.md)

### Inferences
- Features borrowed from a reference site must be translated into terminal grammar (e.g., a project gallery becomes `ls ~/projects` + left-panel screenshot/lightbox; smooth section transitions become the `clear` → `type` → `stream` timeline) and must avoid colour, glow, gradient accents, card grids with coloured chrome, or decorative particle/grid backgrounds.
- Any added motion must fit the §9 budgets and reduced-motion/`‖ motion` paths; heavy libraries (e.g., 3D/WebGL) would conflict with the 150KB JS budget.

### Gaps
- None material; constraints are explicit in CLAUDE.md and the spec.

## 4. Pieces likely to feel "not smooth" or "not responsive"; typecheck/lint results

### Takeaway
Code quality checks all pass (typecheck, lint, contrast, production build), so the problems are functional gaps: no phone layout, no text/tab-change animation, placeholder left panels, a navigation-only command line, static status-line fields, and missing badge cursor tilt.

### Cited Findings
- `npm run typecheck` (tsc --noEmit): passed with no errors; `npm run lint` (eslint .): passed with no warnings/errors; `npm run contrast`: all readable tokens ok (lowest `--text-3` on card 5.29:1); `npm run build` (asset check + next build): succeeded, 14 pages prerendered. Run on a scratch copy of HEAD after `npm ci` because the repo has no `node_modules` — [package.json](/home/user/Portfolio/package.json), [scripts/contrast.mjs](/home/user/Portfolio/scripts/contrast.mjs)
- Phone: visuals hidden entirely below 768px; spec §12 phone layout (top bar, mini badge + sheet, 2x4 bottom bar, inline visuals, keyboard-docked command line, static dimmer background) unbuilt — [VisualPanel.tsx](/home/user/Portfolio/src/components/visual/VisualPanel.tsx), [PORTFOLIO_SPEC.md §12](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- No buffer text animation or boot: Buffer renders lines immediately; no `schedule()`, `data-boot`, `skip intro`, riding cursor — [Buffer.tsx](/home/user/Portfolio/src/components/terminal/Buffer.tsx), [layout.tsx](/home/user/Portfolio/src/app/layout.tsx)
- Command line handles only tab names, `cd <tab>` and aliases (work/experience/jobs/education); everything else prints `command not found: X. click a tab below`. No history, autocomplete, palette, `help`, `/` shortcut, echo of commands into the buffer, or easter eggs; the hint reads "click a tab below · type a tab name" instead of the spec's `help · / commands` — [CommandLine.tsx](/home/user/Portfolio/src/components/terminal/CommandLine.tsx)
- Command-line cursor: uses native caret (`caret-shape: block`, yellow); a `.cmd-blink` class is referenced in CSS but no custom blinking block cursor element was found in CommandLine — [globals.css](/home/user/Portfolio/src/app/globals.css), [CommandLine.tsx](/home/user/Portfolio/src/components/terminal/CommandLine.tsx)
- Vim status line shows hard-coded `1:1` and `Top`, not the real scroll position the spec requires ("every field is either real or removed") — [VimStatusLine.tsx](/home/user/Portfolio/src/components/terminal/VimStatusLine.tsx), [PORTFOLIO_SPEC.md §4](/home/user/Portfolio/PORTFOLIO_SPEC.md)
- Left panel for about/projects/skills/certs is a static 4:5 frame with `# photos go here`-style text; no hover linkage between buffer rows and visuals; no lightbox — [VisualPanel.tsx](/home/user/Portfolio/src/components/visual/VisualPanel.tsx)
- Badge photo is a placeholder pattern (`TODO: replace with the real B&W photo`); badge cursor tilt missing — [IdBadge.tsx](/home/user/Portfolio/src/components/visual/IdBadge.tsx)
- No live region for announcements, no contact form/API, no OG images, no tests (Playwright fold test, timeline budgets) — [CLAUDE.md](/home/user/Portfolio/CLAUDE.md), [src/](/home/user/Portfolio/src)
- Tablet: spec keeps the split at 40% visual width; implemented via `--visual-w: 40%` <=1023px, badge shrinks by width/height media queries — [globals.css](/home/user/Portfolio/src/app/globals.css), [VisualPanel.tsx](/home/user/Portfolio/src/components/visual/VisualPanel.tsx)

### Inferences
- The biggest "not smooth" contributor is the abrupt right-side content swap on navigation (no clear/type/stream), paired with a badge that springs in — motion is inconsistent between the two halves.
- The biggest "not responsive" contributor is the phone experience: no badge/visuals, the desktop terminal chrome (tmux bar, status line) squeezed full-width, and no thumb-reachable nav or résumé button.
- Quick wins already specified: real scroll-based `line:col`/`Top/Bot`, the `help` command and palette, the phone bottom bar, and the CSS-only `schedule()` text reveal.

### Gaps
- No runtime/browser profiling (frame rates, CLS, LCP) was done; smoothness claims are inferred from code, not measured.
- The `.cmd-blink` cursor and command-line focus visuals were not checked in a rendered browser.
