# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Phases 1–2 and Phase 3 (commands) are built; the rest follows spec §15. Placeholder copy lives in `src/content/` and is marked as such.

**Done:** Next.js 16 App Router + TS + Tailwind v4 + Motion, tokens in `src/app/globals.css`, self-hosted full JetBrains Mono, hex-dump background canvas, Shell/TerminalWindow/TitleBar/TmuxBar (CSS container-query tiers)/VimStatusLine (real `line:col` and `All/Top/Bot/NN%` from the buffer scroll), all output blocks, six routes + `/projects/[slug]` + `/certs/[slug]` + not-found + `/work` redirects, ID badge (CR80 1 : 1.586 card, front/back, real QR, spring drop that swings to rest straight, ±1.5° sway, drag swing, flip), `scripts/contrast.mjs`.
**Phase 3:** `lib/commands.ts` is the pure parser/registry (navigation + aliases, `cd`/`ls`/`open`, `help`, `whoami`, `resume`, `email` copy, `github`/`linkedin`, `clear`/Ctrl+L, `history`, `motion`/`shortcuts on|off`, easter eggs, edit-distance "did you mean", Tab completion data, palette items). `CommandLine` owns the one runner: it echoes each command into the buffer via `lib/session.ts` (output lives under the page's own lines, cleared on tab change or `clear`), runs effects, keeps ↑/↓ history in `sessionStorage`, and handles `0`–`5`/`/`/`:` (off with `shortcuts off`). There is no separate palette: the command line suggests as you type (`suggestions()` in `lib/commands.ts`; `/…` fuzzy-searches every command, plain text completes names and arguments, `3` names its tab) and is the ARIA combobox. Clickable command names in the buffer (`RunButton`) send commands through `lib/term-events.ts`. `LiveRegion` announces results; `Matrix` is the `matrix` egg. `theme log` and `mail` print an honest "not built yet" line until Phases 5 and 6.

**Phase 4:** `VisualPanel` composes `ProjectPreview` (window frame, crossfade), `PhotoStack` (polaroids), `SkillGraphs` (block-character bars, GitHub heatmap and language split from `lib/github.ts`, fetched in the layout with daily ISR; no `GITHUB_TOKEN` or any failure shows `# github stats unavailable right now`), `CertDeck` (fanned deck) and `Lightbox` (modal `<dialog>`, scales from the thumbnail, ←/→, focus trapped). Buffer rows carry `data-visual="kind:key"`; `VisualSync` turns hover/focus/tap into `lib/visual-store.ts`, which resets on every route so the open item is the default. The layout passes `existingImages()` so a missing file renders its name instead of requesting a 404 (`Shot`). The badge shows `profile.photo` when it exists and tilts toward the cursor (≤ 4°). All visuals are monochrome (`.mono`).

**Phase 5:** `lib/timeline.ts` is the pure `schedule(specs, visit, start)` (boot, boot-compact, land, first, return, echo) with budget tests in `tests/timeline.test.ts` (`npm test`). `Buffer` emits per-row timing vars for landing (`--l*`) and, on home, the boot (`--b*` full figlet, `--c*` compact); the ≤ 1KB inline script in `layout.tsx` sets `<html data-reveal="boot|land">` before first paint, skips on any key/click and marks `done` at 1.6s. `RevealController` re-times rows from the DOM on each tab change (`data-rv="first|return"` on `.buf-scroll`, set in a layout effect), `SessionLines` times command output (`.rvs`, `data-rv="echo"`), and the reveal itself is CSS in `globals.css` (`rv-show`, `rv-type`, `rv-draw`, riding cursor `.rv-cur`). `lib/visited.ts` classifies visits; the visual area enters at 400/240ms and the badge retracts in 400/240ms to match. Background: `hex` and `log` modes (`theme hex|log`, `lib/theme-store.ts`, default in `lib/config.ts`).

**Not yet:** BadgeSheet (moved to Phase 6 with the phone mini badge); phone boot (phones use the landing timeline); phone layout (until then, phones get the desktop terminal at full viewport height), mail form + `/api/contact`, OG images, browser tests (Phase 6). The badge photo is real (`public/images/me-bw.jpg`; `scripts/bw-photo.py` turns a white-backdrop portrait into it). Screenshots, about photos, certificate images and the copy are still placeholders (spec §14).

## Commands

- `npm run dev` / `npm run build` (checks `public/resume.pdf` exists, then `next build`) / `npm start`
- `npm run lint` (ESLint), `npm run typecheck`, `npm run format` (Prettier), `npm run contrast` (fails if a readable text token drops below 4.5:1 on any surface)

## Source of truth

`PORTFOLIO_SPEC.md` defines the whole site: tokens (§3), layout (§4), background (§5), components (§6), the six tabs (§7), the command system (§8), animation timings (§9), the content model (§10), folder structure (§11) and mobile (§12). Read the relevant section before building a feature, and update the spec when a decision changes. `docs/mockups/home-hex-bg.png` is the approved look of the home screen.

## Architecture in brief

- **Two zones on one unbroken background.** A frameless visual area on the left (`clamp(380px, 32vw, 520px)`, widening to ~42% on `work`/`certs`) and a floating, semi-transparent terminal window on the right. A fixed full-viewport canvas of dim terminal text (hex dump by default, syslog as the alternative, set by `BACKGROUND_MODE`) sits behind both and shows faintly through the terminal.
- **Left = visuals only, right = text only.** Each tab swaps the left visual (`VisualPanel`) and "runs" a command in the right-hand vim-style buffer. The ID badge is an independent component shown on home and contact.
- **The terminal window is the whole UI chrome:** title bar → `Buffer` (line-number gutter, `~` fill) → vim status line → `:` command line (the only text input) → tmux bar (tabs `0:home … 5:contact`, which are the main navigation).
- **Each tab is a real route** (`/`, `/about`, `/work`, `/skills`, `/certs`, `/contact`), server-rendered as semantic HTML. The terminal look is styling, not canvas text.
- **Content is data.** All copy lives in typed files under `src/content/`, and buffer output is built from line types (`prompt`, `lead`, `text`, `figlet`, `table`, `links`, `gitlog`, `tree`, …). Changing content should not require touching components.

## Gotchas

- **Fonts:** the Google Fonts / Fontsource _latin_ subset of JetBrains Mono has no box-drawing glyphs (`┌─┐│█╗`). Self-host the full `JetBrainsMono-*.woff2` from the official release, or the figlet name and box art break.
- **Figlet art** (ANSI Shadow font) is pre-generated into `src/content/figlet.ts`; there is no runtime figlet dependency. Multi-row art counts as one buffer line (one gutter number).
- **CSS class names:** generic names like `.pl`, `.cur` or `.c` collided during mockups and broke layout. Use component-scoped styles or Tailwind.
- Every animation needs a `prefers-reduced-motion` path (spec §9).

## Design preferences (from the owner, keep to these)

- Black background with **very sparing** accents: red `#ff3b30` only for status dots, yellow `#ffd60a` only for the cursor, current line number, links and key hints. Everything else is greyscale. The owner rejected anything "eye-catchy": glows, bright accent bars and solid colored chrome.
- **Rejected backgrounds:** line grids, dot matrices and character "blueprint" grids ("cheap"). Use terminal text (hex dump or logs), kept very dim.
- The ID badge is a **monochrome tech card with a real black-and-white photo**: not a colored card, not ASCII art, and not an illustrated face placeholder.
- The command line lives **inside the right-hand terminal only**.
- The user prefers to discuss design before anything is built. When they say a message is a discussion, don't create files.
