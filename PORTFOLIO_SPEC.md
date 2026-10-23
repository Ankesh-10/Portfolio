# ankesh.dev — Portfolio Build Spec

A terminal-themed, highly animated personal portfolio. The screen is split into a **visual area** on the left (a dangling ID badge, photos, graphs, certificates) and a **floating terminal window** on the right (all text, a vim-style buffer, the command line and tmux tabs). Everything sits on a dim, live terminal-text background.

> Reference mockups: [`docs/mockups/home-hex-bg.png`](docs/mockups/home-hex-bg.png) (default) and [`docs/mockups/home-log-bg.png`](docs/mockups/home-log-bg.png) (alternative background).

---

## Table of contents

1. [Design principles](#1-design-principles)
2. [Tech stack](#2-tech-stack)
3. [Design tokens](#3-design-tokens)
4. [Layout](#4-layout)
5. [Background](#5-background)
6. [Components](#6-components)
7. [Tabs (pages)](#7-tabs-pages)
8. [Command system](#8-command-system)
9. [Animation spec](#9-animation-spec)
10. [Content model](#10-content-model)
11. [Project structure](#11-project-structure)
12. [Mobile & tablet](#12-mobile--tablet)
13. [Accessibility, SEO & performance](#13-accessibility-seo--performance)
14. [Assets needed](#14-assets-needed)
15. [Build phases](#15-build-phases)

---

## 1. Design principles

- **Recruiter first.** A visitor who has never used a terminal must be able to get everything by clicking. Commands, shortcuts and easter eggs are accelerators and delight, never the only path.
- **Left = visuals, right = words.** The left area never carries long text; the terminal never carries big images. The one exception is the badge back (§6.1), capped at a 3-line bio.
- **Monochrome first.** Almost everything is a shade of grey. Hierarchy comes from brightness, not color.
- **Readable means AA.** Any text a visitor needs to read is `--text-3` or brighter (≥ 4.5:1 on every surface it sits on) and at least 11px **as rendered** (after any scaling). Tiers `--text-4` and dimmer are decoration only and are `aria-hidden`.
- **Real or decorative.** Every value that looks like data (SHA, deploy time, counts, years) is either real, computed at build time, or rendered as decoration (`--text-4`, `aria-hidden`). Nothing fake is presented as information.
- **Accents are rare and meaningful.**
  - Red `#ff3b30`: the availability status dot only (`● open to work` on the badge and in the tmux bar), always next to its word. Nothing else is red.
  - Yellow `#ffd60a`: means "you can interact with this", without exception, in **two tiers** so it stays rare:
    - **Yellow at rest (primary):** `↓ resume.pdf`, `↻ flip`, `skip intro`, `[ send ⏎ ]`, `✕ close`, the index digits of the inactive tabs (counted together as **one** navigation control), the cursor of a focused text field, and the focus ring. At most 6 yellow controls on any screen (home at rest: tab digits, résumé, flip, and the focused command-line cursor = 4; 5 during the boot with `skip intro`).
    - **Yellow on hover/focus only (secondary):** every other link, row and button. At rest they are `--text-1` with a 1px `--yellow-dim` underline (links) or a `→` marker in `--text-4` (rows); on hover/focus the text, underline and marker turn yellow.
    - Anything that is not interactive is never yellow, including hint text: in the command-line hint only the clickable words (`help`, `/ commands`) get secondary-link styling.
- **Authentic terminal grammar.** Real prompts (`ankesh@portfolio:~$`), real-looking output (`figlet`, `cat`, `ls`, `stat`, `git log`), vim buffer conventions (line numbers, `~` on empty lines, a `NORMAL` status line), tmux tabs.
- **Everything monospace,** aligned to the character grid and a 4px vertical rhythm.
- **Motion has a purpose.** Animations explain state changes (a command runs, output arrives, the badge swaps out). The badge is the one sanctioned ambient element: its idle sway and cursor tilt are deliberate character, and they stop with the `‖ motion` toggle. No decorative glow, no neon.

---

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router, TypeScript) | Real routes per tab (`/about`, `/projects` …) for shareable links and SEO |
| Styling | **Tailwind CSS v4** + CSS variables for tokens | Tokens defined once in `globals.css` |
| Animation | **Motion** (`motion/react`, formerly Framer Motion) | Springs for the badge, layout and presence animations for tab swaps |
| Font | **JetBrains Mono**, full glyph set | ⚠️ The Google Fonts / Fontsource *latin* subset has **no box-drawing glyphs** (`┌─┐│█╗`). Self-host the full `JetBrainsMono-Regular/Bold.woff2` from the official release, otherwise the ASCII art breaks |
| ASCII art | Pre-generated `figlet` output (font: **ANSI Shadow**) stored as strings | No runtime figlet dependency |
| GitHub data | GitHub GraphQL API (contributions, languages), fetched at build time with ISR (revalidate daily) | Token in `GITHUB_TOKEN` env var, server-only |
| Hosting | **Vercel** | |
| Linting | ESLint + Prettier | |

---

## 3. Design tokens

### Colors

```css
:root {
  /* surfaces */
  --bg:            #070707;  /* page background */
  --term-bg:       rgba(9, 9, 9, 0.72);  /* terminal window, lets the bg texture show through faintly */
  --term-chrome:   rgba(14, 14, 14, 0.92); /* title bar, status lines */
  --card:          linear-gradient(160deg, #151515, #0b0b0b 60%);

  /* lines */
  --line-1:        #191919;  /* window dividers */
  --line-2:        #1e1e1e;  /* window border */
  --line-3:        #2c2c2c;  /* card border */

  /* text tiers (brightest → dimmest)
     readable tiers: 1–3, checked against --bg, the terminal over texture, the chrome and the card (#151515) */
  --text-1:        #f5f5f5;  /* headings, lead text, project names, stat values, active tab  16.7–18.5:1 */
  --text-2:        #a8a8a8;  /* body text, commands, inactive tab labels          7.7–8.5:1 */
  --text-3:        #8a8a8a;  /* secondary text, labels, prompt, status fields,
                                dates, current line number        5.29–5.84:1 (≥ 5.2:1 everywhere) */
  /* decorative tiers: never carry information, always aria-hidden */
  --text-4:        #4a4a4a;  /* window dots, separators (·, │), arrows, prompt `$` glyph, commit hashes */
  --text-5:        #272727;  /* line numbers */
  --text-6:        #1e1e1e;  /* vim ~ tildes */

  /* background texture (decorative, aria-hidden) */
  --tex-1:         #151515;  /* bg text */
  --tex-2:         #1d1d1d;  /* bg text highlight (addresses / timestamps) */

  /* accents */
  --red:           #ff3b30;  /* availability dot only */
  --yellow:        #ffd60a;  /* interactive only */
  --yellow-dim:    #8a7400;  /* link underline at rest */
  --focus:         #ffd60a;  /* 2px outline + 2px offset on every focusable element */
}
```

**Contrast rules (enforced in CI, see §15):**
- Text a visitor needs to read uses `--text-1` to `--text-3` only. `#8a8a8a` is the floor everywhere, including on the ID card (5.29:1 there).
- `--text-4` to `--text-6` and `--tex-*` are never used for words or numbers that carry meaning, and those nodes are `aria-hidden`.
- Secondary links are `--text-1` with a `--yellow-dim` underline (4.39:1 on `--bg`, 3.98:1 on the card; it is a non-text cue, so the 3:1 bar applies) that turns `--yellow` on hover/focus. A link inside `--text-3` text (e.g. the status-line SHA) stays `--text-3` with the same underline.
- Non-text UI that signals state (focus ring, active-tab marker, selected row bar) is ≥ 3:1.
- **Heatmap levels** carry data, so every non-empty level is ≥ 3:1 against `--bg`: level 1 `#5e5e5e` (3.1:1), 2 `#808080` (5.1:1), 3 `#a8a8a8` (8.5:1), 4 `#f5f5f5` (18.5:1). Zero-contribution days are a 1px `--line-3` outline (no data). The heatmap always sits on a solid `--bg` plate (8px padding, no texture or terminal tint behind it), so these ratios hold on every surface. The heatmap has an `sr-only` summary ("312 contributions in the last 26 weeks, busiest week: …").

### Type scale (JetBrains Mono everywhere)

Four readable steps on a 4px rhythm: lead → body ×1.33, body → ui ×1.25. Label is a step by case and tracking (uppercase, .14em), not by size (×1.09). Weight and brightness do the rest of the hierarchy: bold `--text-1` is reserved for **content** (name, lead, project names, stat values), never for terminal syntax. **One size per line**: everything on a buffer line shares that line's size, so glyphs stay on one character grid.

| Token | Desktop | Tablet | Phone | Use |
|---|---|---|---|---|
| `--fs-lead` | 20px / 28px | 18px / 28px | 18px / 24px | Lead line on home, badge name, phone name (h1, bold, 20px / 28px on phone) |
| `--fs-body` | 15px / 24px | 14px / 24px | 14px / 24px | Every buffer line except the lead and tables' label row: prompt + command on one line (prompt and command both **regular**; prompt `--text-3`, command `--text-2`), body text `--text-2`, stat values and project names bold `--text-1`, list rows |
| `--fs-ui` | 12px / 16px | 12px / 16px | 12px / 16px | Chrome: title bar, status line, command line, tmux tabs (medium weight), gutter numbers, badge role and field values, phone bar labels |
| `--fs-label` | 11px / 16px, letter-spacing .14em, UPPERCASE | 11px / 16px | 11px / 16px | Table headers, stat labels, card field labels. **Smallest size for readable text, measured as rendered** |
| `--fs-micro` | 10px, letter-spacing .12–.2em | 10px | 10px | Decorative only (`aria-hidden`): card serial, `IMG_0001.RAW`, `B/W · 4:5`, lanyard text. Never carries information that isn't repeated elsewhere |

**Exceptions and alignment**
- **Figlet block:** a fixed 156px block (12 rows × 13px, line-height 1 *inside* the block). It is the one place a line height is not a multiple of 4px; the block as a whole is 39 × 4px, so the rhythm resumes after it. `ANKESH` sits over `JAISWAL`, both ANSI Shadow at the same size. `█` is `--text-1` and the shadow glyphs are `--text-3`. It is ~60 columns ≈ 470px wide. It is shown only when the buffer is ≥ 640px tall and ≥ 560px wide; otherwise the compact name (§7.0) is used, which covers every tablet.
- **Mixed-height logical lines:** every logical line has a height that is a multiple of 4px (24, 28, 40 for a label row over a value row, 156 for the figlet). Its gutter number (12px) sits on the baseline of the line's first text row.

### Spacing, radii, layers

- Base unit: **4px**. Every line height and block gap is a multiple of 4px; body lines are 24px.
- Terminal window: margin `24px` (top/right/bottom), radius `12px`. Every spacing value is on the 4px grid.
- ID card: radius `14px`, width `296px`, CR80 proportions (1 : 1.586).
- Z-index: background `0` → visual area `10` → terminal `20` → command palette `40` → modals/lightbox/badge sheet `50`.

---

## 4. Layout

### Desktop (≥ 1024px)

```
┌──────────────────────┬──────────────────────────────────────────────────┐
│        ║             │ ●●●  ankesh@portfolio: ~/home — tmux ↓ resume.pdf│
│        ║ lanyard     ├──────────────────────────────────────────────────┤
│     ┌──╨──┐          │  1  ankesh@portfolio:~$ figlet ankesh jaiswal    │
│     │ ID  │          │  2  █████╗ ███╗   ██╗ ...                        │
│     │CARD │          │  …  (vim buffer: line numbers, output, ~)        │
│     └─↻───┘          │                                                  │
│                      ├──────────────────────────────────────────────────┤
│                      │ NORMAL ~/home.md   main@a3f9c21 · 2h ago 17:1 All│
│                      │ : █         click a tab below · help · / commands│
│ # drag me · ↻ flip   │ [0:home*] [1:about] [2:projects] … ● open ‖ 14:22│
└──────────────────────┴──────────────────────────────────────────────────┘
   visual area             floating terminal window
```

- **Visual area width:** `clamp(380px, 32vw, 520px)`. It has no frame; it sits directly on the background.
- **Terminal window:** fills the rest (`flex: 1`), with a 24px margin.
- **Visual-heavy tabs** (`projects`, `certs`) widen the visual area with a 180ms tween, timed inside the tab-change gap so terminal text never reflows on screen (see §9): to `clamp(420px, 42vw, 640px)` at ≥ 1280px, and only to `420px` between 1024 and 1279px so the terminal keeps room for the tmux bar.
- Right-side text is capped at about **70ch** per line for readability.
- The background texture spans the **entire viewport**, behind both areas, unbroken.

### Terminal window anatomy (top → bottom)

1. **Title bar** (36px): three dim window dots (decorative) · centered `ankesh@portfolio: ~/<tab> — tmux` in `--text-3` · on the right a persistent **`↓ resume.pdf`** action (yellow, always visible on every tab, one click to download, feedback in §8 `resume`).
2. **Buffer** (flex): vim-style gutter (48px, right-aligned line numbers, `aria-hidden`) + content.
3. **Vim status line** (28px): `NORMAL` mode block · file name (`~/home.md`) · spacer · real build info shown as `main@a3f9c21 · 2h ago`. The commit SHA and deploy time are injected at build from Vercel env vars, and the SHA links to the commit on GitHub. The time is a `<time datetime="…">`: the server renders the absolute date (`2025-10-23`), and the client converts it to relative time and refreshes it every minute, so it never goes stale; `title` gives the full timestamp. Then `line:col` (the buffer's top visible line, i.e. the real scroll position) · `All/Top/Bot` (also from scroll position). Every field is either real or removed.
4. **Command line** (32px): `:` + yellow block cursor; hint on the right in `--text-3`: `click a tab below · help · / commands`, where `help` (runs `help`) and `/ commands` (types `/` into the command line, listing every command) are secondary-link buttons.
5. **tmux status bar** (32px, tabs are 32px-tall hit targets): tabs (left-anchored) · spacer · `● open to work` · `‖ motion` pause toggle · live clock `14:22 IST`. There is no `[ankesh]` session label; the title bar already names the session.

**Tabs read as navigation at rest, not only on hover.**
- Each tab renders as a bracketed item: `[1:about]`. At rest the brackets are `--text-4` (decorative), the index digit is **yellow** (it is the keyboard shortcut and marks the item as clickable) and the label is `--text-2`.
- Hover and keyboard focus: the whole tab turns yellow, a 1px yellow underline grows left → right (150ms), pointer cursor.
- Active tab: `[0:home*]` with the digit and label in `--text-1` bold and a 2px `--text-1` bar on top. It is not yellow (you are already there).
- They are real `<a>` elements in a `<nav aria-label="Sections">` with `aria-current="page"` on the active one. Each has a clean accessible name and its shortcut: `aria-label="About"` and `aria-keyshortcuts="1"`. The brackets, digit and `*` are `aria-hidden`, so a screen reader says "About, link, current page", not "1 colon about star".
- Each tab has a `title` tooltip with the palette's description, e.g. `about — experience & background`.

**tmux bar overflow (measured, not breakpoint-based).** The bar renders the richest tier whose **measured content width** fits the bar. Each tier is measured offscreen; the check re-runs on resize and font load.
- On a tab change, the tier is chosen from the terminal's **target** width before the width tween starts, and `ResizeObserver` updates are ignored during the tween, so the bar never flickers between tiers.
- Tabs are left-anchored and every tier only removes items to their right, so changing tier never moves a tab under the pointer.
- Tabs never truncate, and a status **word** is always visible next to the dot.

| Tier | tmux bar shows | Approx. width at 12px (7.2px/char) |
|---|---|---|
| T1 | tabs · `● open to work` · `‖ motion` · clock | ~ 740px |
| T2 | tabs · `● open to work` · `‖ motion` | ~ 660px |
| T3 | tabs · `● open` — `‖` moves to the title bar, left of `↓ resume.pdf` | ~ 530px |
| T4 | tabs without brackets (`0:home* 1:about 2:projects …`) · `● open` | ~ 440px |
| T5 | two-row bar (56px = 2 × 28px): row 1 the tab labels only (`home* about projects skills certs contact`, ~300px; digits stay available through `aria-keyshortcuts` and the palette); row 2 `● open to work` | ≥ 300px (always true, since phones use the phone layout) |

Status words per state: `open to work` / short `open`; `building` / `building`; `busy` / `busy`. The `‖` control is always reachable: in the bar (T1–T2) or in the title bar (T3–T5).

**First-visit nudge.** On the first visit of a session, a comment line sits directly under the home intro in `--text-2`: `# new here? click a tab below — or type help`. It prints as part of the intro (≈ 875ms into the boot with the full figlet, ≈ 650ms with the compact name, or immediately when the boot is skipped or motion is reduced), never after the rest of home, and disappears after the first tab click or command.

---

## 5. Background

A full-viewport layer of dim terminal text, rendered once to a `<canvas>` (cheap to repaint and scroll) and positioned `fixed` behind everything.

Two modes behind one config flag, `BACKGROUND_MODE` (default `"hex"`):

### `hex` (default)
- Real `xxd` layout: `00000a30: 616e 6b65 7368 206a  ankesh jaiswal :: f`
- The bytes **encode your actual intro text** (`ankesh jaiswal :: full-stack developer :: …`), an easter egg for anyone who decodes it.
- Columns repeat across the width with wide gaps. Addresses use `--tex-2`, bytes `--tex-1`, the ASCII column is dimmer still.
- Motion: scrolls upward very slowly (about 1 line per 2s).

### `log` (alternative)
- Syslog lines: `Oct 23 09:19:45 ankesh-pc git[2210]: pushed 3 commits to origin/main`
- Timestamps in `--tex-2`, messages in `--tex-1`.
- Motion: a new line is appended every 3–6s, and the whole layer shifts up by one line.
- Messages can reflect real events (latest commit message, deploy time) when GitHub data is available.

### Rules for both modes
- 12px / 16px font, never brighter than `#1d1d1d`. It's texture, not content.
- The terminal window is semi-transparent (`--term-bg`, 72%) so the texture shows faintly through it. No `backdrop-filter`: at this texture contrast a blur is invisible and costs GPU time on low-end laptops.
- Pause the animation when the tab is hidden (`visibilitychange`), when `‖ motion` is off, and freeze it entirely under `prefers-reduced-motion`.
- The canvas is `aria-hidden="true"` and `pointer-events: none`.

---

## 6. Components

### 6.1 `<IdBadge />` (independent component, home and contact)

A physical-feeling, monochrome tech badge that hangs from the top edge of the screen.

**Structure**
- **Lanyard:** 24px-wide dark strap (`#111` with faint woven lines), 1px `#262626` side borders, vertical text `ANKESH.DEV · ROOT ACCESS ·` in `#3a3a3a` (decorative, `aria-hidden`).
- **Clip:** grey metal clip (`#4a4a4a` border, dark gradient fill).
- **Card (front):**
  - Slot hole at the top center, corner brackets in all four corners.
  - Header row: `ANKESH.DEV` (11px, letter-spaced, `--text-3`) · `ID//0x2006` (`--fs-micro`, `--text-4`, decorative).
  - **Photo:** B&W image at a 4:5 ratio, `grayscale(1) contrast(1.1)`, scanline overlay, labels `IMG_0001.RAW` (top-left) and `B/W · 4:5` (bottom-right, both `--fs-micro`, decorative). `alt="Ankesh Jaiswal"`.
  - Name `ANKESH JAISWAL` (`--fs-lead` bold, `--text-1`), role `full-stack developer` (`--fs-ui`, `--text-3`).
  - Fields grid (real data only): `LOC India · IST` · `SINCE 2022` (read from `profile.since`) · `STATUS ● open to work` (the only red on the card). Labels `--fs-label` `--text-3`, values `--fs-ui` `--text-2`.
  - Flavour row (decorative, `--fs-micro`, `--text-4`, `aria-hidden`): `ACCESS root`.
  - Status dot by state: `open to work` = filled red `●`; `building` = filled `--text-2` `●`; `busy` = hollow `--text-3` `○`. The word is always shown next to the dot; meaning never relies on color alone.
  - Bottom: barcode and a small QR-like 9×9 block pattern (both decorative, `aria-hidden`), serial `SN 4F6B-2006-A1` (`--fs-micro`, decorative) and `github.com/ankesh-10` (a real link).
  - **`↻ flip` control:** bottom-right corner of the card, yellow, 32×32px hit area.
- **Card (back, shown on flip):** short bio (3 lines), skill tags, socials list (real links), a **real, scannable QR code** (version 2 or higher, ≥ 25×25 modules, 120px with a 4-module quiet zone, linking to the résumé or GitHub, `alt` text naming the destination), and the same `↻ flip` control.

**Semantics**
- The card is a `<section role="group" aria-label="ID badge">` whose text is readable content (name, role, fields, status), not a button.
- `↻ flip` is the only flip button: `<button aria-label="Show back of badge">` (label switches to "Show front of badge"). After flipping, the live region announces "showing back of badge".
- Links (`github.com/ankesh-10`, socials) are ordinary `<a>` elements, never inside a button. The hidden face is `inert`.

**Behavior**
- **Entrance:** drops in from above the viewport (spring: stiffness 120, damping 9) tilted 14°, and swings back and forth on a looser spring (stiffness 45, damping 3.2) until it hangs straight at 0°.
- **Idle:** pendulum sway of ±1.5° over about 5s, plus a tilt toward the cursor (max 4°) on a lightly damped spring, so it overshoots and settles like a badge on a lanyard. Both stop when `‖ motion` is off.
- **Drag:** grab and pull it (Motion `drag`, elastic 0.4). Pulling sideways swings the card (up to 16°); on release it springs back and keeps swinging until it settles.
- **Hint:** on desktop home, a comment line `# drag me · ↻ flip` in `--text-3` sits at the bottom-left of the visual area (readable, not yellow: it is an instruction, not a control). It disappears after the first drag or flip and doesn't return in the session.
- **Click:** 3D flip (`rotateY` 180°, 600ms) between front and back, via `↻ flip`, Enter/Space on it, or a pointer click anywhere on the card surface that isn't a link. A pointer gesture that moved more than 4px between `pointerdown` and `pointerup` is a drag, never a flip.
- **Tab change away:** the lanyard retracts upward and pulls the card off-screen (400ms on a first-visit tab change, 240ms on a return-visit change, see §9); the new visual fades in. Coming back, the badge drops in again with the same spring (§9 lists every entrance and exit). Between home and contact the badge stays and flips in place instead.
- Pivot point: `transform-origin: 50% 0` at the top of the lanyard.

**Geometry**
- **Rest position:** the lanyard hangs from the top edge of the viewport. The card's top edge rests at `clamp(96px, 14vh, 160px)`.
- **Drop:** starts with the whole badge above the viewport (translateY = −(rest offset + card height + 24px)). The vertical spring stays at stiffness 120, damping 9, mass 1: ζ ≈ 0.41, about 24% overshoot peaking at ~310ms, settling to 2% in ~0.87s. The swing (rotation) settles in about 1.8s and is decorative, exempt from budgets.
- **Proportions:** a standard ID card (CR80, 54 × 85.6 mm) held upright, 1 : 1.586, on both faces (296 × 469px at the default width). The photo stays 4:5 and takes whatever height the text leaves. On the back the QR sits beside the links so the back fits the same card.
- **Vertical fit:** the card plus its rest offset must fit within the viewport minus 64px. Below that (short laptop screens), the card switches to its **compact layout**: width 252px (≈ 400px tall), the same 11px+ text sizes, never a transform scale. The overshoot may briefly pass the bottom edge.
- **Clipping:** the visual area is `overflow: clip`, so the overshoot never draws over the terminal.
- **Drag hint:** the `# drag me · ↻ flip` hint sits 16px below the card's rest position and moves with the layout, never under the card.

### 6.2 `<TerminalWindow />`
Owns the window chrome and composes, in DOM order, `<TitleBar />` (`<header>`), `<TmuxBar />` (`<nav>`, placed at the bottom with CSS grid), `<Buffer />` (`<main>`), then `<VimStatusLine />` and `<CommandLine />` (`<footer>`). See §13 for why the nav comes before the buffer.

### 6.3 `<Buffer />`
- Renders an array of **lines**. Each line is one of: `prompt`, `text`, `lead`, `figlet`, `table`, `links`, `featured`, `dirs`, `list`, `gitlog`, `comment`, `blank`. Each line has an appearance mode (§9) and keeps its full height while hidden, so revealing it never shifts layout.
- Gutter: right-aligned line numbers in `--text-5`; the line that holds the latest output's prompt is in `--text-3` (brighter, not yellow: it isn't interactive).
- Multi-row ASCII art counts as **one** logical line (a single gutter number).
- After the last line, fill the remaining height with `~` rows in `--text-6`.
- **One cursor at a time.** While output is printing, a `--text-1` block cursor rides at the buffer's write position (§9 "Terminal text appearance"). When printing finishes it returns to the command line. Whichever text field has focus (command line, a mail-form field) shows the cursor in yellow; no other cursor is visible.
- Scrolls inside the window when content overflows. The tmux tabs and status lines stay fixed.

### 6.4 `<Prompt />`
`ankesh@portfolio:~$` in `--fs-body` regular `--text-3` (user and path one step brighter, `--text-2`; the `$` glyph in `--text-4`), followed by the command in the same `--fs-body` size, **regular `--text-2`**. Prompt and command share one size and one character grid, and stay quieter than the content they produce: the page is about the output, not the syntax. The path reflects the current tab (`~/projects`). The whole prompt string is `aria-hidden`; each command block is preceded by a visually hidden `<h2>` that names the section (e.g. "Projects") for screen readers.

### 6.5 Output blocks
| Block | Look |
|---|---|
| `figlet` | ANSI Shadow ASCII. `█` in `--text-1`, shadow glyphs (`╗╔═║╝╚`) in `--text-3` for depth. The ASCII is `aria-hidden`; the name is a real `<h1>` in `sr-only` |
| `lead` | `--fs-lead` (20px / 28px), `--text-1`, max 60ch |
| `text` | `--fs-body`, `--text-2`, inline links as secondary links (`--text-1` + `--yellow-dim` underline) |
| `table` | `--fs-label` uppercase labels in `--text-3` on one row, `--fs-body` bold values in `--text-1` aligned below. A value that is a link is a secondary link with `↗` |
| `links` | `→ github  → linkedin  → email  → resume.pdf`, arrows `--text-4` (aria-hidden), names as secondary links |
| `featured` | `→ name   summary   year` rows: name as a secondary link to `/projects/<slug>`, summary `--text-2`, year `--text-3` |
| `dirs` | `ls ~` output: the tabs as `about/  projects/  skills/  certs/  contact/`, each a secondary link to its route, the `/` in `--text-4` |
| `gitlog` | `* a3f9c21  2025-06  Software Engineer Intern @ Company`: graph `*` and hash in `--text-4` (`aria-hidden`, decorative), date in `--text-3`, title in `--text-1`, org in `--text-2` (a secondary link when it has a URL). A screen reader hears "2025-06, Software Engineer Intern at Company" |
| `list` | `├─` / `└─` tree characters in `--text-4` (aria-hidden) for nested lists; rendered as a real `<ul>` |
| `comment` | `# …` in `--text-2` for hints and empty/error notes |

**Wrapping and overflow (per block, decided with container queries on the buffer's content width in `ch`, no JS):**
| Block | Wide | Narrow |
|---|---|---|
| `lead`, `text`, `comment` | Wraps at the 70ch measure | Wraps to the column; continuation rows align under the first character (no hanging punctuation) |
| `table` (stats) | 4 columns in one label row + one value row (≥ 64ch) | < 64ch: a 2 × 2 grid of label/value pairs. < 36ch (phone): stacked pairs, label above value, 2 per row |
| `featured`, project rows | `→ name   summary   year` on one row (≥ 60ch) | < 60ch: the year is dropped. < 44ch: the name on row 1, the summary on row 2 (indented 2ch). The summary is never truncated mid-word; it wraps |
| `links`, `dirs` | One row with 3ch gaps | Flow-wraps with the same gaps; items never break internally |
| `gitlog` | `* hash  date  title @ org` | < 56ch: the hash is dropped (it is decorative). The title wraps with continuation rows aligned under the title column |
| `list` (tree) | Branch label and items on one row | Items wrap under the items column; tree glyphs never repeat on continuation rows |
| `figlet` | Full ANSI Shadow block (see §7.0 for the gate) | Compact name; never scaled or clipped |

### 6.6 `<VimStatusLine />`, `<CommandLine />`, `<TmuxBar />`
- Status line updates file name (`~/projects.md`), `line:col` and position as content changes. Build info is static per deploy.
- The command line is the main text input; the others are the mail form's real fields (§7.5). Its suggestion list (§6.8) is the palette. Focus it with `:` or by clicking it. Cursor rules are in §6.3.
- The tmux bar tabs are links (see §4 "Tabs read as navigation"). The clock updates every minute and is `aria-hidden` (decorative).
- `‖ motion` toggles all continuous motion (background scroll, cursor blink, badge idle sway, cursor tilt and device tilt) off/on; state persists in `localStorage`. It is a real `<button aria-pressed>`.

### 6.7 `<VisualPanel />`
Swaps the left visual per tab with `AnimatePresence` (see §7 and the timeline in §9). All visuals stay monochrome to match the badge.

### 6.8 Command suggestions (the command line is its own palette)
As the visitor types in the command line, matching commands appear in a small list directly above it. There is no separate palette field.
- `/` (the key when no text field is focused, or the `/ commands` hint) puts `/` in the command line and lists every command: the 6 tabs, `resume`, `help`, then projects, certs and the rest. Typing after the slash filters fuzzily (`/pro` → `/projects`, `/open project-name`, …). Each row has a one-line plain-English description.
- Without a slash, typing completes command names and their arguments (`wh` → `whoami`, `cd ` → `cd about`, `cd projects` …). A tab index names its tab (`3` → `go to skills`). Hidden commands are never suggested.
- ↑/↓ move the highlight, Tab completes it into the line, Enter runs. A real command runs as typed (`cd about`, `sudo hire-me`); a `/…` line or a partial word runs the highlighted suggestion. Esc hides the list (a second Esc leaves the line). With the list hidden, ↑/↓ walk the history.
- ARIA combobox on the command line itself (`role="combobox"` + `role="listbox"`, `aria-activedescendant`). The highlighted row has a yellow left bar and `--text-1` text.

### 6.9 `<Lightbox />`
Full-screen view for certificates, project screenshots and about photos over a dimmed background. Images stay monochrome, like the rest of the visual area. Esc, a visible `✕ close` button (top-right, yellow) or clicking the backdrop closes it. It is a modal `<dialog>`: focus moves to the close button on open, is trapped inside, and returns to the thumbnail that opened it on close. The image has the project or certificate name as `alt`; `←/→` step through siblings.

---

## 7. Tabs (pages)

Each tab is a real route. Opening one "runs" its command in the buffer, and the left visual changes to match.

| # | Tab | Route | Command shown | Left visual |
|---|---|---|---|---|
| 0 | home | `/` | `figlet ankesh jaiswal` … | ID badge (front) |
| 1 | about | `/about` | `cat about.md`, `git log` (experience) | B&W photo stack (polaroid-style, monochrome) |
| 2 | projects | `/projects`, `/projects/<slug>` | `ls ~/projects` (`open <slug>` on a deep link) | Screenshot of the selected project in a window frame |
| 3 | skills | `/skills` | `skills --tree` | Graphs: skill bars, GitHub heatmap, language split |
| 4 | certs | `/certs`, `/certs/<slug>` | `ls ~/certs` (`open <slug>` on a deep link) | Certificate card deck |
| 5 | contact | `/contact` | `cat contact.txt` | ID badge flipped to the back (QR + socials) |

Expanding a project or certificate updates the URL to its `/<tab>/<slug>` route (shallow, no reload), so a hiring manager can share a link to one project. Each slug route has its own metadata and OG image.

**Cross-panel links work for everyone.** Every hover linkage (timeline entry → photo, skill → bar, project row → screenshot, cert row → card) also fires on keyboard focus, and on touch the tapped/selected item drives the visual.

**Empty lists.** If a tab's list is empty, `ls` prints `total 0` and `# nothing here yet — check back soon`, and the left visual keeps its frame (same size) with the same comment centered in `--text-3`, so there is no void.

### 7.0 · home

The home buffer is designed to fit **481px** (the buffer height on a 1366×768 laptop: 657px viewport − 48px window margin − 128px chrome) with the compact name, so the work and the onramp are above the fold on the most common recruiter screen. This is verified by a Playwright screenshot test at 1366×657 and 1280×720 inner sizes: the last stats row must be fully visible without scrolling.

```
ankesh@portfolio:~$ figlet ankesh jaiswal                             24
<name: full figlet or compact, see below>                       48 / 156

ankesh@portfolio:~$ cat intro.txt                                     24
Full-stack developer building fast, thoughtful web apps.  ← lead      28
Currently building project-name — one line on what it does.           24
Previously interned at company. Based in India.                       24
# new here? click a tab below — or type help                          24

ankesh@portfolio:~$ ls ~/projects --featured                          24
→ project-name     one-line summary of what it does    2025           24
→ project-two      one-line summary of what it does    2024           24

ankesh@portfolio:~$ ls ~                                              24
about/   projects/   skills/   certs/   contact/                      24

ankesh@portfolio:~$ ls ~/links                                        24
→ github   → linkedin   → email   → resume.pdf                        24

ankesh@portfolio:~$ stat --summary                                    24
PROJECTS     YEARS CODING     CERTIFICATES     NOW                    16
6            4                5                project-name ↗         24
```
Row heights (right column, px) plus five 8px block gaps total **468px** with the compact name and **576px** with the full figlet. Blank lines between blocks are 8px gaps, not 24px vim blank lines.

- **Name, two designed forms.** Both are figlet output; neither is a fallback.
  - **Full figlet:** ANSI Shadow, 12 rows, 156px. Used when the buffer is ≥ 640px tall **and** ≥ 560px wide (470px of art + 48px gutter + padding), typically on 1080p+ monitors.
  - **Compact figlet (the hero most recruiters see):** `ANKESH JAISWAL` in a 3-row half-block font (`▄ ▀ █` glyphs, pre-generated like the full figlet, e.g. figlet `smblock`). It is 13px glyphs on 16px rows = **48px** tall and ~56 columns ≈ 440px wide. `█▀▄` are `--text-1`; there are no shadow glyphs. It uses the same `draw` reveal with its one-frame `█` flash, so the signature moment survives on every laptop. Below ~500px of buffer width it stacks `ANKESH` over `JAISWAL` (96px).
  - The choice is made in CSS with a size container query on the buffer (`container-type: size`). It changes only when the window is resized, never while reading. Both forms are `aria-hidden`; the name is the route's `sr-only` `<h1>`.
- **Featured projects** (`featured: true`, max 2, then the newest) link to `/projects/<slug>`. This is the first proof a recruiter sees.
- **The nudge** sits directly under the intro, so it is always above the fold on first visit; it disappears after the first tab click or command.
- **Wrapping:** if the lead wraps (narrow windows), the fold test above still has to pass. When it doesn't, the first thing dropped from home is `stat --summary`, never the featured projects or the nudge.
- **Stats** are computed at build: `PROJECTS` = `projects.length`, `YEARS CODING` = current year − `profile.since`, `CERTIFICATES` = `certificates.length`. No `+` hedging. `NOW` is a link when `profile.now.href` is set, otherwise `--text-1`.
- The `ls ~` row repeats the navigation where the eye already is (`dirs` block).

### 7.1 · about
- `cat about.md` → 2–3 short paragraphs (who you are, what you care about, what you're looking for).
- `git log --oneline --graph` → experience and education timeline as a git graph (hashes decorative, see `gitlog` in §6.5):
  ```
  * a3f9c21  2025-06  Software Engineer Intern @ Company
  * 7be41d0  2024-08  Started B.Tech CSE @ University
  * c19e5a8  2022-01  First line of code
  ```
  The "First line of code" entry is generated from `profile.since`, not hand-written, so the badge, the stat and the timeline can't disagree.
- `cat now.txt` → what you're currently learning or building.
- **Left:** a stack of 3–4 B&W photos (you, workspace, events). Hovering or focusing a timeline entry brings its matching photo to the front.
- **Experience is findable without knowing the tab name.** The palette, `help` and the tab's tooltip describe this tab as `about — experience & background`. The commands `experience`, `jobs` and `education` open about and scroll to the `git log` block, and its hidden heading is "Experience".

### 7.2 · projects
- `ls ~/projects` → project list, one row each: `name  stack  year  status`. Featured projects (`featured: true`) are listed first.
- Selecting a project (click, ↑/↓, or `open <name>`) expands it inline:
  ```
  ── project-name ───────────────────────────────
  One-paragraph description: the problem, what you built, the outcome.
  stack   next.js · postgres · tailwind
  role    solo / team of 3
  result  one line with the measurable outcome (users, speed, grade, prize)
  links   → live   → github
  ```
- **Left:** a screenshot of the hovered, focused or selected project in a minimal window frame, crossfading on change. Click opens the lightbox. The visual area widens (§4).

### 7.3 · skills
- `skills --tree` →
  ```
  skills
  ├─ languages    typescript · python · javascript · sql
  ├─ frontend     react · next.js · tailwind
  ├─ backend      node.js · express · postgres · supabase
  └─ tools        git · docker · vercel · figma
  ```
- `cat philosophy.txt` → 2 lines on how you work.
- **Left (monochrome graphs):**
  - Skill bars (self-rated), drawn with block characters: `typescript ████████▌  88`
  - GitHub contribution heatmap (last 26–40 weeks on desktop, last 12 weeks on phone) in the grey levels from §3. The current week is marked with a 1px `--text-1` outline (red stays reserved for availability).
  - Language split as a stacked bar from GitHub data.
- Hovering or focusing a skill in the tree highlights its bar on the left. The skill names in the tree are plain text, not focusable controls; the bar list on the left carries the same names and levels as real text, so keyboard and screen-reader users get the data without extra tab stops.
- The language split shows the top 4 languages by bytes plus `other`, in the heatmap greys, each with its name and percentage as text (colour is never the only cue).

### 7.4 · certs
- `ls ~/certs` → `git log`-style list: `a3f9c21  2025-03  AWS Cloud Practitioner — Amazon` (hash decorative).
- `open <cert>` or clicking a row shows its details (issuer, date, credential ID, verify link).
- **Left:** a fanned deck of certificate cards (monochrome rendering of the real certificate image). The selected certificate slides to the top. Click opens the lightbox. The visual area widens (§4).

### 7.5 · contact
- `cat contact.txt` →
  ```
  email     ankesh@…            → copy
  github    github.com/ankesh-10
  linkedin  linkedin.com/in/…
  resume    resume.pdf          → download
  ```
  Addresses are secondary links; `→ copy` and `→ download` are `<button>`s styled as secondary links.
- `mail` (also a visible `→ send a message` link in the output) → opens a minimal in-terminal form that posts to a serverless route (Resend or Formspree):
  ```
  name:    █
  email:   
  message: 
           [ send ⏎ ]  [ cancel esc ]      (⌘/Ctrl+Enter sends from message)
  ```
  - Built from **real form fields** styled as prompts: `<input autocomplete="name">`, `<input type="email" autocomplete="email">`, `<textarea>`, each with a `<label>`. All three fields and both buttons are always in the DOM and reachable with Tab/Shift+Tab, in that order.
  - **Desktop emphasis:** the focused field's label is `--text-1` and shows the block cursor. The fields not yet reached have `--text-3` labels; they are visible and focusable, not hidden.
  - **Keys:** Enter in `name` or `email` moves to the next field. In `message`, Enter adds a new line and Ctrl/⌘+Enter sends. `[ send ⏎ ]` sends from anywhere.
  - On phone the three fields stack as a normal form. Mobile gets the email keyboard and autofill.
  - **Validation:** on advancing or sending, an inline line appears under the field in `--text-1`, prefixed with `!` (no red; red is reserved for availability): `! email needs an @ — e.g. you@company.com`. The field keeps its value and focus returns to it. Errors are linked with `aria-describedby`.
  - **States:** `sending…` (spinner made of `⠋⠙⠹⠸` braille frames, 80ms, static `…` under reduced motion or with motion paused) → `sent ✓ — I'll reply within 2 days` or `failed: couldn't reach the mail server. your message is still here — retry ⏎ or email ankesh@… directly`. The draft is kept in `sessionStorage` until sent.
  - **Cancel:** Esc or the `cancel` control closes the form, keeps the draft in `sessionStorage` and prints `mail cancelled — draft saved. type mail to continue, or mail --discard.` Reopening restores the draft with focus in the first empty field. Anything typed into a field (including `:q` or a tab name) is just text; it never navigates or cancels.
  - **Spam:** hidden honeypot field + server-side rate limit (3 per IP per hour) returning a polite `too many messages — try email instead`.
- **Left:** the ID badge showing its back (big QR code + socials). It drops in already flipped, or flips in place when coming from home (§9).

---

## 8. Command system

### Navigation
| Input | Action |
|---|---|
| Click a tmux tab or an `ls ~` entry | Jump to the tab (primary path) |
| `home` `about` `projects` `skills` `certs` `contact` | Open the tab (also `cd ~/projects`). Aliases: `work` → projects; `experience`, `jobs`, `education` → about (scrolled to the timeline); `cv` → `resume` |
| `0`–`5` keys | Jump to the tab matching its tmux index |
| `/` | Focus the command line with `/` typed, listing every command (§6.8) |
| `:` | Focus the command line |
| `Esc` | Hide the command suggestions, or close the lightbox, badge sheet or mail form; otherwise blur the command line |

**Single-key shortcuts** (`0`–`5`, `/`, `:`) only fire when no text field is focused, so `cd ~/projects` types normally in the command line. They can be turned off with `shortcuts off` (WCAG 2.1.4; persisted in `localStorage`).

Every item with a shortcut also has a visible click target. The `help` output has four groups, each **≤ 4 rows**, every row with a one-line plain-English description and clickable command names:
```
navigate      home · about · projects · skills · certs · contact   open a section
              open <name>                                          show one project or cert
get in touch  resume · email · mail                                download, copy, write to me
              github · linkedin                                    open profiles
settings      motion on|off · shortcuts on|off                     calmer page, fewer hotkeys
              theme hex|log · clear · history                      background, tidy up, recall
fun           there are a few classic commands hidden here         (no list: discovery is the fun)
```

### Commands
| Command | Output |
|---|---|
| `help` / `:help` | List of commands |
| `whoami` | `ankesh — full-stack developer` |
| `ls` | Lists tabs as directories (`dirs` block) |
| `open <project\|cert>` | Expands that item and updates the left visual |
| `resume` (also the `↓ resume.pdf` title-bar action) | Downloads `resume.pdf` and prints `downloading resume.pdf (84 KB) ✓` in the buffer; the live region announces "résumé downloaded". The title-bar action shows `✓` for 2s |
| `github` / `linkedin` / `email` | Opens the link. `email` copies to the clipboard and prints `copied ✓ ankesh@…`, always showing the address; if clipboard access is denied it prints `couldn't copy — here it is: ankesh@…` with the address selected |
| `clear` / `Ctrl+L` | Clears the buffer back to the current tab's base output |
| `theme log` / `theme hex` | Switches the background mode |
| `history` | Shows previous commands |
| `shortcuts on\|off` | Turns single-key shortcuts on or off |
| `motion on\|off` | Same as the `‖ motion` toggle |
| `mail` / `mail --discard` | Opens the mail form (restoring a saved draft) / deletes the saved draft |

### Easter eggs
| Command | Response |
|---|---|
| `sudo hire-me` | `[sudo] password for recruiter: ****` → `access granted. opening contact…` |
| `rm -rf /` | `nice try.` |
| `vim` | `you're already in it.` |
| `exit` / `:q` (in the command line) | `there is no escape. (try :help)` |
| `neofetch` | ASCII logo + system-style info about you |
| `matrix` | 3s monochrome character rain over the background, then fades |

### Input behavior
- **Tab** autocompletes commands and arguments, only while the line has text: on an empty line Tab moves focus as usual, so keyboard users are never trapped. One match completes; several extend to their shared prefix, and a second Tab lists them in the buffer. **↑/↓** walk the history (kept in `sessionStorage`).
- Unknown command → `command not found: xyz. did you mean 'projects'? — type help, or / to see every command`, with the suggestion based on edit distance (both clickable).
- `/about`, `/resume`, `/theme log` … is the slash form of any command, and a tab index alone (`3`) opens that tab.
- Every command is echoed into the buffer as a new prompt line before its output.
- A navigation command typed in the command line keeps focus in the command line (see §13 Focus).

---

## 9. Animation spec

### Terminal text appearance

All buffer text arrives the way a real terminal prints it: commands are typed, output is flushed line by line, and a block cursor rides at the write position. Text never fades, slides or blurs in. A line is either not there yet or fully there, like stdout.

A **line** here is one logical line: one DOM element (a prompt line, a paragraph, a list row, a table row pair, the figlet block). If it wraps onto several visual rows, those rows appear together, like one flushed line of stdout.

| Mode | Used for | Behavior | Timing |
|---|---|---|---|
| **type** | Commands after the prompt (always one visual row) | Characters appear one by one; the riding cursor sits right after the last character, then drops to the start of the next line | 25ms per char (in the 18–28ms range; the boot table's four 100ms prompts assume it); capped at **150ms per command**, and **100ms per command during the boot**, so long commands type faster |
| **type-fast** | The home lead line during the desktop boot, only when it fits on one row (checked with a container query against its known length in `ch`; otherwise it uses `stream`) | Same as `type`, much faster, so the one sentence that matters prints in front of the visitor | 6ms per char, capped at **300ms** |
| **stream** | All other output: text, tables, lists, links, git log, comments | Lines appear one at a time, top to bottom; the cursor waits at the start of the next empty line | 25ms per line, capped at **200ms per block** (blocks with more than 8 lines go faster; there is no minimum) |
| **draw** | The figlet name and the compact name | Rows appear top to bottom; each row first shows as solid `█` blocks for one frame, then resolves into the letters | 25ms per row (full figlet 12 rows = 300ms; compact name 3 rows = 75ms) |
| **clear** | Leaving a tab | The old output disappears at once, like `clear`; the buffer shows only `~` rows and the cursor on line 1 | 60ms hold |
| **echo** | Commands the visitor types themselves | Already typed by them, so the prompt line commits instantly; its output then uses `stream` | instant + stream |
| **instant** | Reduced motion, `‖ motion` paused, `skip intro`, prompt lines on return visits, the phone lead line | Everything appears complete in one frame | 0ms |

**The riding cursor** is a `--text-1` block (not yellow: the buffer isn't an input). Yellow is reserved for the cursor of a focused text field (§1).

**Implementation: CSS-driven, with a failsafe**
- **The text is always in the HTML.** The server renders the complete text (SEO, no-JS, screen readers). Animation only controls *when* each already-rendered line becomes visible.
- **One schedule function.** `lib/timeline.ts` exports a pure `schedule(route, visit)` that gives every line a start time `--t` (ms), a duration `--d` and, for typed lines, a character count `--n`. The server emits these as inline CSS custom properties on each line for the boot. The client uses the same function for tab changes.
- **CSS does the reveal.**
  - `stream`: a zero-length `animation` with `animation-delay: var(--t)` and `fill-mode: both` flips opacity from 0 to 1.
  - `type` / `type-fast`: `clip-path: inset(0 100% 0 0)` → `inset(0)` with `steps(var(--n))` over `var(--d)`.
  - `draw`: a per-row clip, plus a one-frame `█` overlay.
  - The riding cursor is a `::after` on whichever line is printing, timed with the same variables.
  - None of this needs JavaScript or hydration.
- **t0 is the document's first paint.** CSS animations start when the line first renders, so the boot clock starts at first paint, never at hydration.
- **Boot gating.** A ≤ 1KB inline script in `<head>` sets `data-boot` on `<html>` before first paint, only on a first visit to `/` with motion allowed. All boot animations are scoped under `[data-boot]`.
  - Without JS there is no `data-boot`, so nothing is hidden and nothing animates.
  - If the main bundle is slow or fails, the CSS still finishes on its own.
- **Hard end state.** `schedule()` clamps every line so that `--t + --d ≤ 1500ms`. Even if every script after the inline one fails, all home text is visible by 1.5s after first paint.
- **Skip works before hydration.** The same inline script listens for the first `keydown` or `pointerdown` and for the `skip intro` button. It sets `data-boot="skip"`, which sets `animation: none` and shows everything at once.
- **Assistive tech.** Hidden lines use only `opacity` and `clip-path`, never `display` or `visibility`, so screen readers can read the full text from first paint. There is no `aria-busy` during the boot. For output from commands the visitor runs, the buffer is `aria-busy` while it prints, then the live region announces it once (§13).
- **Layout.** Hidden lines keep their full height, so revealing them never shifts layout. Gutter line numbers appear with their line. `~` rows fill below the last visible line.
- **Interrupts.** Any key, click or `skip intro` completes every pending line at once. Running a new command mid-animation completes the current output instantly first.
- **Tests.** `npm test` checks `schedule()` against every budget in this section (boot moments, hard end state, first/return visits with and without a resize, deep-link landing, command output).

### Tab-change timelines (budgets are hard limits)

A budget measures **terminal content complete and every control interactive**. The badge's settle, swing and idle sway after it enters are decorative continuation and are exempt. The card is clickable from the moment it enters.

**Blocks after the first.** A tab's first command types and streams as below. Every later block in the same tab has its prompt line appear `instant`, and all later blocks together stream at 12ms per line, **capped at 240ms combined**.

**First visit to a tab in this session**
| t (ms) | Terminal | Visual area |
|---|---|---|
| 0–60 | `clear`: old output disappears | Old visual exits (badge retract 400ms runs from 0) |
| 60–240 | Gap: width tween runs here, only if the tab changes width; otherwise skipped | |
| 240–390 | First prompt `type`s (≤ 150ms) | New visual enters from 400ms |
| 390–590 | First block `stream`s (≤ 200ms) | Visual interactive by 650ms |
| 590–830 | Later blocks, if any (≤ 240ms combined) | |

| Tab | Blocks | Terminal complete (first visit) |
|---|---|---|
| home (outside the boot) | 6 | ≤ 830ms |
| about | 3 | ≤ 830ms |
| projects | 1 | ≤ 590ms |
| skills | 2 | ≤ 830ms |
| certs | 1 | ≤ 590ms |
| contact | 1 | ≤ 590ms |
Subtract 180ms when the width doesn't change. **Visual interactive ≤ 650ms on every tab.**

**Return visit to a tab**
| t (ms) | Terminal | Visual area |
|---|---|---|
| 0–60 | `clear` | Old visual exits (badge retract 240ms runs from 0) |
| 60–240 | Gap: width tween, only if the width changes; otherwise skipped | |
| 240–360 (or 60–180) | All prompt lines appear `instant`; all output `stream`s at 12ms per line, ≤ 120ms in total | A non-badge visual crossfades in from 240ms; the badge drops in from 240ms. Interactive by 420ms |
**Terminal complete ≤ 360ms (≤ 180ms without a resize) on every tab. Visual interactive ≤ 420ms.**

**Badge-specific cases (the motion stays as in §6.1).** These are the only badge entrances and exits:
- **Entering** (from a tab without the badge, or on a deep link to home or contact): the badge always **drops** with its spring, from 400ms on first visits and 240ms on return visits. It never crossfades.
- **Leaving** (to a tab without the badge): the badge always **retracts** (400ms on first visits, 240ms on return visits).
- **Home ↔ contact:** both show the badge, so it doesn't retract. It flips in place (600ms from t=0) while the terminal runs its timeline.
- **Arriving on contact** from anywhere else: the badge drops in already showing its back. There is no drop-then-flip sequence.
- **Interruptions:** a tab change during a drop, retract or flip starts the next motion from the badge's current position and velocity (Motion does this natively). Motions never queue.

### Moments

| Moment | Animation | Timing |
|---|---|---|
| **First load (boot), desktop and tablet** | Only on `/`, first visit of a session. The chrome, tabs and title bar are visible from first paint, and the background fades in (0–200ms). The buffer prints (full figlet / compact name):<br>• `figlet ankesh jaiswal` types: 0–100<br>• the name `draw`s: 100–400 / 100–175<br>• `cat intro.txt` types: 400–500 / 175–275<br>• the lead line `type-fast`s: 500–800 / 275–575<br>• two intro lines and the nudge `stream`: to 875 / 650<br>• four more blocks, each prompt typed (100ms) then streamed: +525ms<br>The badge starts dropping at 100ms, in parallel | Buffer complete at **≈ 1.40s** (full figlet) or **≈ 1.18s** (compact). The nudge is visible at ≈ 875ms / 650ms. Within the 1.5s hard end state. Skippable with any key, click or the visible `skip intro ⏎` control (top-right of the buffer, yellow), which completes everything at once |
| **First load, phone** | See §12. The lead line is `instant` (it is the LCP), prompts type at the boot cap and the rest streams | Complete in ≈ 0.6s |
| **Deep-link landing** | A visitor arriving directly on any route other than `/`, or on `/` again in the same session: chrome is painted at once. The route's prompt lines appear `instant` and its output `stream`s (≤ 200ms). A non-badge visual fades in; the badge drops in | Terminal ≤ 200ms, visual 200ms fade |
| **Visual area resize** | Width tweens between the narrow and wide widths **only inside the 180ms gap** after `clear` and before new output appears, so text never reflows while visible. After a click or key it doesn't count toward CLS. On back/forward (no input), the width snaps in the same frame as the route swap, while the buffer is cleared; budgeted as < 0.01 CLS | 180ms tween, `cubic-bezier(0.2, 0, 0, 1)` (deterministic, testable) |
| **Badge** | See §6.1 and the cases above | Settle exempt from budgets |
| **Command output** | Anything the visitor runs (`help`, `whoami`, errors, `copied ✓`, mail states) | `echo` + `stream` |
| **Cursor** | Command-line block cursor (yellow when the field is focused) blinks | 1.06s steps, solid while typing. Stops blinking (stays solid) after 10s of no input |
| **Status line** | File name and `line:col` change to the new values | Instant, no count-up |
| **Links / tabs hover & focus** | Yellow underline grows left → right, item brightens to yellow | 150ms, ease-out |
| **Palette** | Opens: 8px rise + fade. Closes: fade | 140ms in, 100ms out |
| **Lightbox / badge sheet** | Image or badge scales from its thumbnail position to full; backdrop fades to 85% black | 220ms, ease-out; close reverses in 160ms |
| **Copy / download confirmation** | `copied ✓` / `downloading … ✓` line streams in after the command | one line, no toast |
| **Background** | Hex: slow upward scroll. Log: occasional new line | continuous, paused when the tab is hidden |

**Easing:** UI transitions use `cubic-bezier(0.2, 0, 0, 1)` (ease-out); nothing uses ease-in for entering elements. Only the badge uses springs; the visual-area width is a tween.

**LCP** (measured from navigation start, in Lighthouse CI on both the desktop and the throttled mobile profile; target < 1.5s on both):
- **Desktop/tablet boot:** the lead line starts printing at first paint + 500ms (275ms compact) and completes at + 800ms (575ms). The badge photo is `next/image` with `priority`, preloaded. With server-rendered HTML and preloaded fonts, first paint is ≈ 0.4–0.6s, so LCP ≈ 1.0–1.4s.
- **Phone:** the lead line is `instant` at first paint, so LCP = first paint.
- **Every other route:** no boot, so the text is visible at first paint.

**Pause control** (`‖ motion` in the tmux bar or title bar on desktop/tablet per §4 tiers, in the top bar and the palette on phone; WCAG 2.2.2): stops the background scroll, cursor blink, badge idle sway, cursor tilt and device tilt for anyone, regardless of OS settings. While paused, text uses `instant` mode instead of typing and streaming (the inline boot script reads the same `localStorage` key, so a paused visitor never gets the boot). Tab changes and flips still run. Persisted in `localStorage`.

**Reduced motion** (`prefers-reduced-motion: reduce`):
- No boot sequence, and all text `instant` (no typing or streaming; the cursor doesn't blink).
- The badge hangs still: flips become a crossfade, and on tab changes it appears and disappears with a 150ms crossfade instead of dropping and retracting.
- The visual area changes width instantly, and the background is static.
- `matrix` shows a static frame for 1s.

---

## 10. Content model

All content lives in typed files under `src/content/`, so updating the site never means touching components.

```ts
// src/content/types.ts
export type Profile = {
  firstName: string;            // "Ankesh"
  lastName: string;             // "Jaiswal"
  role: string;                 // "full-stack developer"
  tagline: string;              // lead line on home
  intro: string[];              // secondary lines on home
  location: string;             // "India · IST"
  since: number;                // 2022 — "YEARS CODING" is computed from this
  status: "open to work" | "building" | "busy";
  now: { label: string; href?: string };
  photo: string;                // "/images/me-bw.jpg"
  badgeId: string;              // "0x2006"
  serial: string;               // "4F6B-2006-A1"
};

export type Link = { label: string; href: string; kind: "github" | "linkedin" | "email" | "resume" | "other" };

export type Project = {
  slug: string; name: string; year: number;
  status: "live" | "wip" | "archived";
  summary: string;              // one line for the list
  description: string;          // paragraph for the expanded view
  stack: string[]; role: string;
  links: { live?: string; github?: string };
  image: string;                // screenshot for the left panel
  result?: string;              // one-line measurable outcome, shown as the `result` row
  featured?: boolean;           // listed first in ls ~/projects
};

export type SkillGroup = { group: string; items: { name: string; level?: number }[] };

export type Certificate = {
  slug: string; name: string; issuer: string;
  date: string;                 // "2025-03"
  credentialId?: string; verifyUrl?: string;
  image: string;
};

// hash is generated at build (first 7 hex chars of sha1(date + title)) and rendered as decoration
export type TimelineEntry = { date: string; title: string; org?: string; photo?: string };
```

Files: `profile.ts`, `links.ts`, `projects.ts`, `skills.ts`, `certificates.ts`, `timeline.ts`, `commands.ts` (command → output mapping), `figlet.ts` (pre-generated ASCII art).

---

## 11. Project structure

```
src/
  app/
    layout.tsx              # fonts, background, shell
    page.tsx                # home
    about/page.tsx
    projects/page.tsx
    projects/[slug]/page.tsx  # deep link to one project
    skills/page.tsx
    certs/page.tsx
    certs/[slug]/page.tsx   # deep link to one certificate
    contact/page.tsx
    not-found.tsx           # `cd: no such file or directory` in the shell
    api/contact/route.ts    # contact form handler (validation, honeypot, rate limit)
    opengraph-image.tsx     # OG image in the same style
    globals.css             # tokens
  components/
    shell/        Shell.tsx  Background.tsx
    terminal/     TerminalWindow.tsx  TitleBar.tsx  Buffer.tsx  Line.tsx
                  Prompt.tsx  VimStatusLine.tsx  CommandLine.tsx  TmuxBar.tsx
                  LiveRegion.tsx  MailForm.tsx  MotionToggle.tsx
    blocks/       Figlet.tsx  Lead.tsx  Text.tsx  Table.tsx  Links.tsx  Dirs.tsx
                  GitLog.tsx  Tree.tsx  Comment.tsx
    visual/       VisualPanel.tsx  IdBadge.tsx  BadgeSheet.tsx  PhotoStack.tsx
                  ProjectPreview.tsx  SkillGraphs.tsx  CertDeck.tsx  Lightbox.tsx
  content/        (see §10)
  lib/
    commands.ts             # parser, registry, autocomplete, history
    typing.ts               # text appearance modes (type, type-fast, stream, draw, clear, echo, instant) and the riding cursor
    timeline.ts             # tab-change timelines and budgets from §9
    github.ts               # GraphQL fetchers
    useReducedMotion.ts     # combines prefers-reduced-motion and the ‖ motion toggle
    visited.ts              # per-session record of visited tabs (first vs return visit)
public/
  fonts/JetBrainsMono-Regular.woff2  JetBrainsMono-Bold.woff2
  images/me-bw.jpg  projects/*  certs/*
  resume.pdf
```

`next.config` adds a permanent redirect from `/work` and `/work/:slug` to `/projects` and `/projects/:slug`.

---

## 12. Mobile & tablet

One site, one URL, separate layouts. No separate mobile site.

### Tablet (768–1023px)
- Keep the split; visual area `40%`.
- Terminal sizes follow the tablet column of the §3 type scale (lead 18/28, body 14/24; ui and label unchanged). The home name uses the compact form.
- The badge is rendered at a **smaller layout size** (card width 252px, photo shrinks), not scaled with a transform, so its labels stay 11px as rendered.
- The tmux bar follows the measured overflow tiers in §4 (usually T4 or T5).

### Phone (< 768px)
```
┌──────────────────────┐
│ ankesh.dev         ‖ │  top bar, hides on scroll down
│  ║   ANKESH JAISWAL  │  mini badge (decorative thumbnail) at the
│┌─╨─┐ full-stack dev  │  left; name (h1), role and status beside it
││ID │ ● open to work  │  as real text, all above the fold
│└───┘                 │
├──────────────────────┤
│ ~/home.md            │  terminal becomes full-width, no window margin
│ Full-stack developer │
│ ...                  │  visuals appear inline between text blocks
├──────────────────────┤
│home about projects  ❯│  fixed bottom bar: 2 rows × 4 cells:
│skills certs contact ↓│  6 tabs + ❯ type + ↓ resume
└──────────────────────┘
```
- **Navigation model:** each tab is still its own route (same as desktop). Within a route the page scrolls vertically like a normal page. Tapping a tab in the bottom bar navigates to that route and scrolls to its top. There is no horizontal swiping between tabs.
- **Bottom bar:** fixed, 2 rows × 4 equal cells (each ≥ 44px tall, `--fs-ui` labels): the 6 tabs, `❯ type` (opens the command line) and `↓ resume` (yellow, primary; same download and confirmation as desktop). Active tab in `--text-1` bold with a 2px top bar; inactive labels `--text-2`. Respects `env(safe-area-inset-bottom)`. The résumé therefore never scrolls away. The page sets `scroll-padding-bottom: calc(88px + env(safe-area-inset-bottom))` (and `scroll-padding-top: 44px`), so a focused element is never hidden under the fixed bars (WCAG 2.4.11).
- **Top bar:** `ankesh.dev` and the `‖` motion toggle (44×44px). It hides on scroll down and returns on scroll up; `‖` is also listed in the palette (`motion off`).
- **Chrome budget:** while scrolling, only the bottom bar shows: 88px + safe area ≈ 13% of a 667px screen. At the top of a page, the top bar adds 44px (≈ 20%).
- **Command line:** tapping `❯ type` docks a single-line command input above the keyboard (positioned with `visualViewport`); the bottom bar hides while the keyboard is open and returns on blur, Done or Esc.
- **Above the fold:** the mini badge (~0.5 size) is a thumbnail wrapped in `<button aria-label="Open ID badge">`. Only the art inside the button is `aria-hidden`; its tiny text is not counted as readable. The name (the page's visible `<h1>`, 20px / 28px bold), role and status beside it are real text. A 375×667 viewport shows name, role, status and the start of the intro without scrolling. The buffer on home starts at `cat intro.txt` (no figlet, no second copy of the name).
- **Badge tap (one behavior):** tapping the mini badge opens the full-size badge in a sheet (`<dialog>`, focus-trapped, `✕ close`). In the sheet it can be flipped with `↻ flip` or a tap on the card, and dragged.
- **Device tilt:** inside the sheet only, the badge can sway with device tilt (`DeviceOrientationEvent`; on iOS the permission is requested only when the visitor taps a `tilt to swing` link in the sheet). Idle sway is the fallback. Both stop with `‖`.
- Left-panel visuals (photos, graphs, certificates) render **inline** right after their text block. The heatmap shows the last 12 weeks with 14px cells.
- Background: static (no scroll animation), slightly dimmer.
- Line-number gutter shrinks to 32px; vim status line shows the file name only.
- **Phone boot** (first visit to `/`; until the phone layout lands, phones get the deep-link landing timeline instead): the name, role and status beside the mini badge are visible from first paint, and the mini badge drops in. The `cat intro.txt` prompt and the lead line are `instant` at first paint (the lead line is the phone's LCP). The remaining intro lines and nudge `stream` at 15ms per line. The four later blocks each type their prompt (≤ 100ms) and stream their output, about 125ms each. The buffer is complete in **≈ 0.6s**, and skippable like desktop.

---

## 13. Accessibility, SEO & performance

**Accessibility (WCAG 2.2 AA)**
- **Semantics.** Every tab's content exists as real semantic HTML: one `<h1>` per route (the name on home, `sr-only` on desktop where the figlet shows it visually; the section name elsewhere), an `sr-only` `<h2>` per command block (e.g. "Projects", "Experience"), lists as `<ul>`/`<ol>`, tables as `<table>`. The terminal look is styling, not canvas text.
- **Hidden from assistive tech:** the background canvas, figlet ASCII, prompt strings, line-number gutter, `~` rows, tree glyphs (`├─ └─`), commit hashes and graph `*`, arrows, window dots, brackets around tabs, the clock, the art inside the phone mini-badge button, the decorative badge fields (`ID//…`, `ACCESS root`, barcode, front QR pattern) and all `--fs-micro` labels.
- **DOM structure (one source of truth).** `<Shell>` renders, in this DOM order:
  1. skip links: "Skip to content", "Skip to sections", "Skip to visual";
  2. `<TerminalWindow>`, which renders `<header>` (title bar) → `<nav aria-label="Sections">` (tmux tabs + `‖` when it lives there) → `<main tabindex="-1">` (buffer) → `<footer>` (status line, then command line, matching their visual order);
  3. `<aside aria-label="Visual">` (`<VisualPanel>`).
  CSS grid places the aside on the left and the tmux nav at the bottom of the window. Those are the only two places where visual order differs from DOM order, and both are deliberate: the content comes before decoration, and navigation comes before content. The three skip links make each region one keystroke away.
- **Focus order (follows the DOM):** skip links → `‖ motion` (when in the title bar) → `↓ resume.pdf` → tabs → `‖ motion` (when in the tmux bar) → `skip intro` (during boot only; it is the first element of `<main>` and sits visually at the top-right of the buffer, so DOM and visual order agree) → buffer content (links, rows, mail form) → status-line SHA link → command line → command-line hint buttons (`help`, `/ commands`) → visual area (`↻ flip`, badge links, thumbnails). The first Tab press during the boot also completes it (any key does).
- **Focus on route change:**
  - Navigated by clicking or pressing Enter on a tab → focus stays on that tab; the live region announces "Projects, 5 items".
  - Navigated from the command line → focus stays in the command line; same announcement.
  - Navigated from a link inside the content (`ls ~`, 404 page, palette) → focus moves to `<main>`, which shows a visible focus ring along the buffer's left edge and is labelled by the route's `<h1>`. No live-region announcement in this case (no double announce).
- **Visible focus** on everything focusable: 2px `--focus` outline, 2px offset. A tab that turns yellow on focus also gets the 2px ring, so focus never relies on the text colour alone.
- **Announcements.** A single polite `aria-live` region announces each command's result once output finishes (e.g. "Projects, 5 items", "copied email address", "résumé downloaded", "mail sent", "showing back of badge"). Typing and streaming are never announced character by character. Command errors (unknown command, offline) use the same region. **Form errors do not**: they are announced once, through `aria-describedby` and `aria-invalid` when focus returns to the field (no double announcement). Nothing is announced during the boot; its text is readable from first paint.
- **Keyboard.** All actions reachable without a pointer. Single-key shortcuts follow §8 (inactive in text fields, can be turned off). Palette is an ARIA combobox (§6.8); lightbox and badge sheet are focus-trapping `<dialog>`s (§6.9, §12); badge flip is the `↻ flip` button (§6.1).
- **Motion.** `‖ motion` pause control for all continuous motion (2.2.2) plus the `prefers-reduced-motion` path (§9). A visible `skip intro` control during boot.
- **Contrast.** Readable text is `--text-1` to `--text-3` (≥ 5.2:1 on every surface; the lowest is `--text-3` on the card at 5.29:1); see §3 contrast rules. Never use `--text-4` or dimmer for anything a visitor needs to read.
- **Size.** Readable text is ≥ 11px as rendered; no transform may scale readable text below that (§12 tablet badge).
- **Targets.** Clickable tabs, links, rows and controls have ≥ 24×24px hit areas on desktop and ≥ 44×44px on touch.
- **Zoom.** Layout holds at 200% zoom: below 1024px effective width it switches to the tablet/phone layout rather than clipping.

**States & errors**

Every failure keeps the terminal voice, says what happened in plain words, and offers a way forward.

| Situation | What the visitor sees |
|---|---|
| Unknown command | `command not found: xyz. did you mean 'projects'? — type help, or / to see every command` |
| 404 route | Renders inside the shell: `cd: no such file or directory: ~/xyz` followed by `ls ~` output (the six tabs as links). Real 404 status |
| GitHub API failure / stale data | Build keeps the last good snapshot (ISR). If none exists, the heatmap and language bar are hidden and the skills visual shows only the skill bars plus `# github stats unavailable right now` in `--text-3`. Never an empty frame |
| Empty project or cert list | See §7 "Empty lists" (frame kept, comment shown) |
| Image fails to load | Window frame / cert card shows the item name centered in `--text-3` on `--card` at the same aspect ratio (no layout shift) |
| `resume.pdf` missing | Build fails (checked at build time) so it can never ship broken |
| Résumé download | See §8 `resume` |
| Clipboard denied | See §8 `email` |
| Mail form errors | See §7.5 |
| JS disabled / fails | All content and tabs still work as server-rendered pages with normal links; the command line shows `# commands need JavaScript — use the tabs below` |
| Offline after load | Commands that need the network print `offline — try again when you're connected` |

**SEO**
- Per-route `metadata` (title, description), an OG image in the same visual style, `sitemap.xml`, `robots.txt`.
- Content is server-rendered, so crawlers see full text.

**Performance budget**
- LCP < 1.5s from navigation start on Lighthouse's desktop and mobile profiles (see §9 "LCP": on desktop the lead line finishes printing at first paint + 800ms, or + 575ms compact; on phone it is instant at first paint; the badge photo is preloaded), JS < 150KB gzipped on first load, CLS ≈ 0 (text reveals never move layout: hidden lines keep their space).
- Self-hosted fonts with `font-display: swap` and preload.
- Images via `next/image`; the B&W photo is pre-converted (don't rely only on a CSS filter for file size).
- Background canvas redraws only on scroll ticks (~0.5fps for hex), never per frame.

---

## 14. Assets needed

Fill these in before or during the build. Placeholders are used until then.

- [ ] **Photo:** black-and-white, head-and-shoulders, 4:5 crop, plain background, high contrast (min 800×1000px)
- [ ] **2–4 extra photos** for the About stack (workspace, events), B&W or convertible
- [ ] **Tagline** (one line) + intro (2 lines)
- [ ] **About** text (2–3 short paragraphs) + "now" line
- [ ] **Timeline:** education, internships and jobs with dates
- [ ] **Projects (3–6):** name, year, status, one-line summary, paragraph, stack, role, live and GitHub links, screenshot (16:10); mark 1–2 as `featured`
- [ ] **Skills** grouped by category (optional self-rating 0–100)
- [ ] **Certificates:** name, issuer, date, credential ID, verify URL, image
- [ ] **Links:** GitHub, LinkedIn, email, resume PDF
- [ ] Badge details: location, "since" year, status, badge ID and serial (avoid encoding a birth year if you'd rather not show your age)
- [ ] Domain name (e.g. `ankesh.dev`)

---

## 15. Build phases

### Phase 1: Foundation
- [ ] Next.js + TypeScript + Tailwind v4 scaffold, ESLint/Prettier
- [ ] Tokens in `globals.css`, self-hosted full JetBrains Mono (verify box-drawing glyphs render), and a contrast check script that fails CI if a readable token drops below 4.5:1 on `--bg`, terminal, chrome or card
- [ ] `Shell` layout: background layer + visual area + terminal window, responsive breakpoints
- [ ] Content types + placeholder content

### Phase 2: Terminal
- [ ] `TerminalWindow`, `TitleBar`, `Buffer` with gutter and `~` fill, `VimStatusLine`, `TmuxBar` with live clock and the overflow rules
- [ ] All output blocks (figlet, lead, text, table, links, dirs, gitlog, tree, comment)
- [ ] Routes for all 6 tabs rendering their static output, plus `/projects/[slug]`, `/certs/[slug]`, `not-found` and the `/work` redirects
- [ ] Landmarks, skip links, hidden headings, `aria-hidden` decoration, focus rules on route change, live region

### Phase 3: Commands
- [ ] Command parser and registry, navigation commands, `help`, unknown-command handling
- [ ] Autocomplete, history, keyboard shortcuts (with `shortcuts off`), command palette
- [ ] Easter eggs

### Phase 4: Visual area
- [ ] `IdBadge`: front/back, `↻ flip`, drag threshold, entrance, sway, cursor tilt, drag, flip, retract
- [ ] `PhotoStack`, `ProjectPreview`, `SkillGraphs` (with GitHub data), `CertDeck`, `Lightbox` (`BadgeSheet` moves to Phase 6: it opens from the phone's mini badge)
- [ ] `VisualPanel` transitions and the narrow ↔ wide resize

### Phase 5: Motion & background
- [ ] Background canvas (hex default, log alternative, `theme` command)
- [ ] Terminal text appearance modes (`type`, `type-fast`, `stream`, `draw`, `clear`, `echo`, `instant`) with the riding cursor
- [ ] CSS-driven reveal from `schedule()` (custom properties per line, 1.5s hard end state), the ≤ 1KB inline `data-boot` / skip script, and a no-JS test (bundle blocked → home fully visible by 1.5s)
- [ ] Boot sequence (home only, first visit), deep-link landing, first-visit and return-visit timelines from §9 with their budgets checked in tests
- [ ] `‖ motion` toggle and reduced-motion paths

### Phase 6: Mobile, polish, ship
- [ ] Phone and tablet layouts, inline visuals, 2×4 bottom bar, keyboard-docked command line, mini badge + sheet
- [ ] Accessibility pass (screen reader walk-through with NVDA and VoiceOver, keyboard-only run, 200% zoom), SEO metadata, OG images incl. per-slug
- [ ] Contact form route and every row of the §13 states & errors table
- [ ] Lighthouse ≥ 95 across the board, deploy to Vercel, connect the domain
