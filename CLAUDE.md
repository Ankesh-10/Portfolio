# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Phase 1 (foundation) and the static half of Phase 2 (terminal chrome, output blocks, all routes) are built; the rest follows spec §15. Placeholder copy lives in `src/content/` and is marked as such.

**Done:** Next.js 16 App Router + TS + Tailwind v4 + Motion, tokens in `src/app/globals.css`, self-hosted full JetBrains Mono, hex-dump background canvas, Shell/TerminalWindow/TitleBar/TmuxBar (CSS container-query tiers)/VimStatusLine/the full Phase 3 command system (`src/lib/commands.ts` is the pure registry/parser/autocomplete/palette search; `TerminalProvider` runs the effects, owns history, output lines, shortcuts and the live region; palette, easter eggs, `theme hex|log`, `matrix`, focus-on-route-change rules), all output blocks, six routes + `/projects/[slug]` + `/certs/[slug]` + not-found + `/work` redirects, ID badge (front/back, real QR, spring drop, sway, drag, flip), `scripts/contrast.mjs`.

**Phase 4 (visual area) done:** `PhotoStack`, `ProjectPreview`, `CertDeck` (both `PhotoStack` and `CertDeck` use the shared `Fan`), `SkillGraphs` (bars, 26-week heatmap, language split; data from `src/lib/github.ts`, needs `GITHUB_TOKEN`, otherwise shows "# github stats unavailable right now"), `Lightbox` (native `<dialog>`), cross-panel hover/focus links via `VisualContext` + `HotTarget`, badge cursor tilt. Placeholder images live in `public/images|projects|certs`.

**Phase 5 (motion) done:** `src/lib/timeline.ts` `schedule()` (pure; boot, first/return visit, landing and command-echo schedules, clamped to the 1.5s hard end), CSS-driven reveals in `globals.css` ("Terminal text appearance": stream, type with a riding cursor, type-fast, draw), per-row timings emitted as CSS variables by `Buffer`/`Row`, the <1KB inline script in `layout.tsx` that sets `data-boot` / `data-landing` and handles skip, `Reveal` for client tab changes, `skip intro`, aria-busy while output prints, background fade-in, motion-off and reduced-motion paths. The text is always in the HTML; hidden lines use only opacity/width.

**Phase 6 done (except deploy):** phone and tablet layouts (top bar, fixed 2×4 bottom bar, docked command line, mini-badge header + `BadgeSheet` with device tilt, inline visuals), mail form + `/api/contact`, OG images (root + per-slug), Playwright e2e + axe suite.

**Measured (Lighthouse 12, production build, local):** desktop performance 99 / accessibility 100 / best-practices 100 / SEO 100, LCP 0.9s. Mobile: accessibility/best-practices/SEO 100, performance ~93, observed LCP ~130ms but Lighthouse's throttled simulation reports ~3.1s (it charges the LCP for every byte fetched before it).

**Open decisions / known gaps**
- **JS budget (spec §13: < 150KB gz first load) is not met:** ~227KB transferred (framework ≈ 125KB: react-dom 70 + Next client 42 + 8; Motion ≈ 60KB; app ≈ 40KB). Already done: LazyMotion + per-tab dynamic imports, palette/mail/matrix/badge-sheet split out. Reaching 150KB needs dropping Motion for CSS/WAAPI (the badge's spring/drag/presence would be rewritten) or relaxing the budget.
- **Mobile LCP target (< 1.5s) holds in real measurements but not in Lighthouse's simulated throttling.** Fonts (Regular + Bold, ~180KB) and the JS above are the cost. Dropped the Medium weight (spec §2 only lists Regular/Bold); tab labels therefore render at weight 400.
- **Spec conflict:** §4 prescribes `aria-label="About"` on the visible tab `[1:about]`; axe flags this as `label-content-name-mismatch` (WCAG 2.5.3). Kept per spec; the rule is disabled only in the axe test, with a comment. Voice control ("click about") still works.
- **Mail delivery needs env vars:** `RESEND_API_KEY`, `CONTACT_TO` (and optionally `CONTACT_FROM`); without them `/api/contact` answers 503 and the form says so. The rate limit is in-memory, per server instance (best-effort on serverless).
- `GITHUB_TOKEN` is needed for the skills heatmap/language bar; without it the skills visual shows the "unavailable" note.
- Phone: boot does not type prompts (they stream), and inline visuals sit after the whole terminal rather than right after their text block. Not yet done: tmux overflow is container-query based rather than measured; riding cursor only on typed prompts + lead; lightbox scales from the centre; badge drop/retract durations don't differ first vs return visit.
- Not done (needs you): Vercel deploy and domain, real photo/screenshots/certificates/copy/links (spec §14), NVDA/VoiceOver walk-through.

## Commands

- `npm run dev` / `npm run build` (checks `public/resume.pdf` exists, then `next build`) / `npm start`
- `npm run lint` (ESLint), `npm run typecheck`, `npm run format` (Prettier), `npm run contrast` (fails if a readable text token drops below 4.5:1 on any surface), `npm run check:timeline` (checks `schedule()` against the spec §9 budgets), `npm run test:e2e` (Playwright: layout/fold, motion/boot/no-JS, commands, mail form + API, axe + structure; builds and serves the production build on :3111)

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
