# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Phase 1 (foundation) and the static half of Phase 2 (terminal chrome, output blocks, all routes) are built; the rest follows spec §15. Placeholder copy lives in `src/content/` and is marked as such.

**Done:** Next.js 16 App Router + TS + Tailwind v4 + Motion, tokens in `src/app/globals.css`, self-hosted full JetBrains Mono, hex-dump background canvas, Shell/TerminalWindow/TitleBar/TmuxBar (CSS container-query tiers)/VimStatusLine/the full Phase 3 command system (`src/lib/commands.ts` is the pure registry/parser/autocomplete/palette search; `TerminalProvider` runs the effects, owns history, output lines, shortcuts and the live region; palette, easter eggs, `theme hex|log`, `matrix`, focus-on-route-change rules), all output blocks, six routes + `/projects/[slug]` + `/certs/[slug]` + not-found + `/work` redirects, ID badge (front/back, real QR, spring drop, sway, drag, flip), `scripts/contrast.mjs`.

**Phase 4 (visual area) done:** `PhotoStack`, `ProjectPreview`, `CertDeck` (both `PhotoStack` and `CertDeck` use the shared `Fan`), `SkillGraphs` (bars, 26-week heatmap, language split; data from `src/lib/github.ts`, needs `GITHUB_TOKEN`, otherwise shows "# github stats unavailable right now"), `Lightbox` (native `<dialog>`), cross-panel hover/focus links via `VisualContext` + `HotTarget`, badge cursor tilt. Placeholder images live in `public/images|projects|certs`.

**Phase 5 (motion) done:** `src/lib/timeline.ts` `schedule()` (pure; boot, first/return visit, landing and command-echo schedules, clamped to the 1.5s hard end), CSS-driven reveals in `globals.css` ("Terminal text appearance": stream, type with a riding cursor, type-fast, draw), per-row timings emitted as CSS variables by `Buffer`/`Row`, the <1KB inline script in `layout.tsx` that sets `data-boot` / `data-landing` and handles skip, `Reveal` for client tab changes, `skip intro`, aria-busy while output prints, background fade-in, motion-off and reduced-motion paths. The text is always in the HTML; hidden lines use only opacity/width.

**Not yet:** `BadgeSheet` and the phone layout (Phase 6; the aside is hidden below 768px, and the phone boot differs from desktop, see spec §12); the `mail` form (the command currently points to `email`); tablet badge sizing, mail form + `/api/contact`, OG images, Playwright tests checked into the repo, Lighthouse, deploy (Phase 6). Known gaps: the riding cursor only rides on typed prompts and the lead (not between streamed lines); retract/drop durations of the badge don't yet differ between first and return visits; lightbox scales from the centre, not the thumbnail. Real photo, screenshots, certificate images and content are still placeholders (spec §14).

## Commands

- `npm run dev` / `npm run build` (checks `public/resume.pdf` exists, then `next build`) / `npm start`
- `npm run lint` (ESLint), `npm run typecheck`, `npm run format` (Prettier), `npm run contrast` (fails if a readable text token drops below 4.5:1 on any surface), `npm run check:timeline` (checks `schedule()` against the spec §9 budgets)

## Source of truth

`PORTFOLIO_SPEC.md` defines the whole site: tokens (§3), layout (§4), background (§5), components (§6), the six tabs (§7), the command system (§8), animation timings (§9), the content model (§10), folder structure (§11) and mobile (§12). Read the relevant section before building a feature, and update the spec when a decision changes. `docs/mockups/home-hex-bg.png` is the approved look of the home screen.

## Architecture in brief

- **Two zones on one unbroken background.** A frameless visual area on the left (`clamp(380px, 32vw, 520px)`, widening to ~42% on `work`/`certs`) and a floating, semi-transparent terminal window on the right. A fixed full-viewport canvas of dim terminal text (hex dump by default, syslog as the alternative, set by `BACKGROUND_MODE`) sits behind both and shows faintly through the terminal.
- **Left = visuals only, right = text only.** Each tab swaps the left visual (`VisualPanel`) and "runs" a command in the right-hand vim-style buffer. The ID badge is an independent component shown on home and contact.
- **The terminal window is the whole UI chrome:** title bar → `Buffer` (line-number gutter, `~` fill) → vim status line → `:` command line (the only text input) → tmux bar (tabs `0:home … 5:contact`, which are the main navigation).
- **Each tab is a real route** (`/`, `/about`, `/work`, `/skills`, `/certs`, `/contact`), server-rendered as semantic HTML. The terminal look is styling, not canvas text.
- **Content is data.** All copy lives in typed files under `src/content/`, and buffer output is built from line types (`prompt`, `lead`, `text`, `figlet`, `table`, `links`, `gitlog`, `tree`, …). Changing content should not require touching components.

## Gotchas

- **Fonts:** the Google Fonts / Fontsource *latin* subset of JetBrains Mono has no box-drawing glyphs (`┌─┐│█╗`). Self-host the full `JetBrainsMono-*.woff2` from the official release, or the figlet name and box art break.
- **Figlet art** (ANSI Shadow font) is pre-generated into `src/content/figlet.ts`; there is no runtime figlet dependency. Multi-row art counts as one buffer line (one gutter number).
- **CSS class names:** generic names like `.pl`, `.cur` or `.c` collided during mockups and broke layout. Use component-scoped styles or Tailwind.
- Every animation needs a `prefers-reduced-motion` path (spec §9).

## Design preferences (from the owner, keep to these)

- Black background with **very sparing** accents: red `#ff3b30` only for status dots, yellow `#ffd60a` only for the cursor, current line number, links and key hints. Everything else is greyscale. The owner rejected anything "eye-catchy": glows, bright accent bars and solid colored chrome.
- **Rejected backgrounds:** line grids, dot matrices and character "blueprint" grids ("cheap"). Use terminal text (hex dump or logs), kept very dim.
- The ID badge is a **monochrome tech card with a real black-and-white photo**: not a colored card, not ASCII art, and not an illustrated face placeholder.
- The command line lives **inside the right-hand terminal only**.
- The user prefers to discuss design before anything is built. When they say a message is a discussion, don't create files.
