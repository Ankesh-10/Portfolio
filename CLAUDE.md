# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

The repo contains **no application code yet**: only the build spec (`PORTFOLIO_SPEC.md`) and reference mockups (`docs/mockups/`). There are no build, lint or test commands until the project is scaffolded (spec §15, Phase 1: Next.js App Router + TypeScript + Tailwind v4 + Motion). Once it is, add the real commands here.

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
