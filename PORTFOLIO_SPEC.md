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

- **Left = visuals, right = words.** The left area never carries long text; the terminal never carries big images.
- **Monochrome first.** Almost everything is a shade of grey. Hierarchy comes from brightness, not color.
- **Accents are rare and meaningful.**
  - Red `#ff3b30`: status dots only (`● open to work`, `● building`, `● now`).
  - Yellow `#ffd60a`: the cursor, the current line number, links and key hints. Yellow means "you can interact with this".
- **Authentic terminal grammar.** Real prompts (`ankesh@portfolio:~$`), real-looking output (`figlet`, `cat`, `ls`, `stat`, `git log`), vim buffer conventions (line numbers, `~` on empty lines, a `NORMAL` status line), tmux tabs.
- **Everything monospace,** aligned to the character grid.
- **Motion has a purpose.** Animations explain state changes (a command runs, output arrives, the badge swaps out). No decorative glow, no neon.

---

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router, TypeScript) | Real routes per tab (`/about`, `/work` …) for shareable links and SEO |
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
  --term-bg:       rgba(9, 9, 9, 0.60);  /* terminal window, lets the bg texture show through */
  --term-chrome:   rgba(14, 14, 14, 0.90); /* title bar, status lines */
  --card:          linear-gradient(160deg, #151515, #0b0b0b 60%);

  /* lines */
  --line-1:        #191919;  /* window dividers */
  --line-2:        #1e1e1e;  /* window border */
  --line-3:        #2c2c2c;  /* card border */

  /* text tiers (brightest → dimmest) */
  --text-1:        #f5f5f5;  /* headings, commands, lead text */
  --text-2:        #a8a8a8;  /* body */
  --text-3:        #7a7a7a;  /* secondary body */
  --text-4:        #4a4a4a;  /* labels, prompt, chrome */
  --text-5:        #272727;  /* line numbers */
  --text-6:        #1e1e1e;  /* vim ~ tildes */

  /* background texture */
  --tex-1:         #151515;  /* bg text */
  --tex-2:         #1d1d1d;  /* bg text highlight (addresses / timestamps) */

  /* accents */
  --red:           #ff3b30;
  --yellow:        #ffd60a;
  --yellow-line:   #4a3f00;  /* link underline */
}
```

### Type scale (JetBrains Mono everywhere)

| Token | Size / line-height | Use |
|---|---|---|
| `--fs-lead` | 18px / 24px | Tagline / intro lead line |
| `--fs-stat` | 17px | Stat values |
| `--fs-body` | 15px / 24px | Buffer body text |
| `--fs-cmd` | 14px | Commands after the prompt |
| `--fs-prompt` | 13px | `ankesh@portfolio:~$` |
| `--fs-ui` | 12px | Line numbers, title bar, status lines, tmux bar |
| `--fs-label` | 11px, letter-spacing .14em, UPPERCASE | Table headers, card field labels |
| `--fs-micro` | 9–10px, letter-spacing .12–.2em | Card serials, photo labels |
| Figlet first name | 15px, line-height 1 | `ANKESH` (ANSI Shadow) |
| Figlet surname | 9.5px, line-height 1 | `JAISWAL` (ANSI Shadow, grey) |

### Spacing, radii, layers

- Base unit: **4px**. Buffer line height: **24px**.
- Terminal window: margin `22px` (top/right/bottom), radius `10px`.
- ID card: radius `14px`, width `296px`.
- Z-index: background `0` → visual area `10` → terminal `20` → command palette `40` → modals/lightbox `50`.

---

## 4. Layout

### Desktop (≥ 1024px)

```
┌──────────────────────┬──────────────────────────────────────────────────┐
│        ║             │ ●●●      ankesh@portfolio: ~/home — tmux     ⌥ 1 │
│        ║ lanyard     ├──────────────────────────────────────────────────┤
│     ┌──╨──┐          │  1  ankesh@portfolio:~$ figlet ankesh jaiswal    │
│     │ ID  │          │  2  █████╗ ███╗   ██╗ ...                         │
│     │CARD │          │  …  (vim buffer: line numbers, output, ~)        │
│     └─────┘          │                                                  │
│                      ├──────────────────────────────────────────────────┤
│                      │ NORMAL ~/home.md  main ↑3       utf-8 md 17:1 All│
│                      │ : █                    type a command · / · :help │
│ $ open id.png   drag │ [ankesh] 0:home* 1:about 2:work … ● building 14:22│
└──────────────────────┴──────────────────────────────────────────────────┘
   visual area             floating terminal window
```

- **Visual area width:** `clamp(380px, 32vw, 520px)`. It has no frame; it sits directly on the background.
- **Terminal window:** fills the rest (`flex: 1`), with a 22px margin.
- **Visual-heavy tabs** (`work`, `certs`) may animate the visual area to `clamp(420px, 42vw, 640px)` with a spring.
- Right-side text is capped at about **70ch** per line for readability.
- The background texture spans the **entire viewport**, behind both areas, unbroken.

### Terminal window anatomy (top → bottom)

1. **Title bar** (34px): three dim window dots · centered `ankesh@portfolio: ~/<tab> — tmux` · `⌥ <tab index>` on the right.
2. **Buffer** (flex): vim-style gutter (64px, right-aligned line numbers) + content.
3. **Vim status line** (26px): `NORMAL` mode block · file name (`~/home.md`) · git branch (`main ↑3`) · spacer · `utf-8` · filetype · `line:col` · `All/Top/Bot`.
4. **Command line** (30px): `:` + yellow block cursor; hint on the right: `type a command · / search · :help`.
5. **tmux status bar** (28px): `[ankesh]` · tabs `0:home* 1:about 2:work 3:skills 4:certs 5:contact` · spacer · `● building` · live clock `14:22 IST`.

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
- 12px / 17px font, never brighter than `#1d1d1d`. It's texture, not content.
- The terminal window is semi-transparent (`--term-bg`) with `backdrop-filter: blur(1.5px)`, so the texture shows faintly through it.
- Pause the animation when the tab is hidden (`visibilitychange`), and freeze it entirely under `prefers-reduced-motion`.

---

## 6. Components

### 6.1 `<IdBadge />` (independent component, home and contact)

A physical-feeling, monochrome tech badge that hangs from the top edge of the screen.

**Structure**
- **Lanyard:** 22px-wide dark strap (`#111` with faint woven lines), 1px `#262626` side borders, vertical text `ANKESH.DEV · ROOT ACCESS ·` in `#3a3a3a`.
- **Clip:** grey metal clip (`#4a4a4a` border, dark gradient fill).
- **Card (front):**
  - Slot hole at the top center, corner brackets in all four corners.
  - Header row: `ANKESH.DEV` · `ID//0x2006` (10px, letter-spaced, `#6a6a6a`).
  - **Photo:** B&W image at a 4:5 ratio, `grayscale(1) contrast(1.1)`, scanline overlay, labels `IMG_0001.RAW` (top-left) and `B/W · 4:5` (bottom-right).
  - Name `ANKESH JAISWAL` (19px bold, `#f0f0f0`), role `full-stack developer` (12px, `#8a8a8a`).
  - Fields grid: `LOC India · IST` · `SINCE 2022` · `ACCESS root` · `STATUS ● open to work` (the only red on the card).
  - Bottom: barcode + 9×9 QR block (a real QR code linking to GitHub or the resume), serial `SN 4F6B-2006-A1` and `github.com/ankesh-10`.
- **Card (back, shown on flip):** short bio (3 lines), skill tags, socials list, larger real QR code.

**Behavior**
- **Entrance:** drops in from above the viewport (spring: stiffness 120, damping 9), overshoots, then swings and settles at about −3°.
- **Idle:** slow pendulum sway of ±0.6° over about 6s, plus a subtle tilt toward the cursor (max 4°).
- **Drag:** grab and pull it (Motion `drag`, constrained). On release it springs back and swings.
- **Click:** 3D flip (`rotateY` 180°, 600ms) between front and back.
- **Tab change away:** the lanyard retracts upward and pulls the card off-screen (400ms); the new visual fades in. Coming back reverses it.
- Pivot point: `transform-origin: 50% 0` at the top of the lanyard.

### 6.2 `<TerminalWindow />`
Owns the window chrome and composes `<TitleBar />`, `<Buffer />`, `<VimStatusLine />`, `<CommandLine />`, `<TmuxBar />`.

### 6.3 `<Buffer />`
- Renders an array of **lines**. Each line is one of: `prompt`, `text`, `lead`, `figlet`, `table`, `links`, `list`, `gitlog`, `blank`, `cursor`.
- Gutter: right-aligned line numbers in `--text-5`; the active (cursor) line number in yellow.
- Multi-row ASCII art counts as **one** logical line (a single gutter number).
- After the last line, fill the remaining height with `~` rows in `--text-6`.
- Scrolls inside the window when content overflows. The tmux tabs and status lines stay fixed.

### 6.4 `<Prompt />`
`ankesh@portfolio:~$` in `--text-4` (user and path one step brighter), followed by the command in `--text-1`. The path reflects the current tab (`~/work`).

### 6.5 Output blocks
| Block | Look |
|---|---|
| `figlet` | ANSI Shadow ASCII. `█` in the main color, shadow glyphs (`╗╔═║╝╚`) much dimmer for depth |
| `lead` | 18px, `--text-1` |
| `text` | 15px, `--text-3`, inline links in yellow with a dim underline |
| `table` | Uppercase 11px labels on one row, 17px values aligned below |
| `links` | `→ github  → linkedin  → email  → resume.pdf`, arrows dim, names yellow |
| `gitlog` | `a3f9c21  2025-06  Joined X as intern`: hash yellow, date dim, message body |
| `list` | `├─` / `└─` tree characters for nested lists |

### 6.6 `<VimStatusLine />`, `<CommandLine />`, `<TmuxBar />`
- Status line updates file name (`~/work.md`), `line:col` and position as content changes.
- The command line is the **only** text input. Focus it with `/` or `:`, or by clicking it.
- The tmux bar tabs are clickable. The active tab is white with `*`; the others are `--text-4`. The clock updates every minute.

### 6.7 `<VisualPanel />`
Swaps the left visual per tab with `AnimatePresence` (see §7). All visuals stay monochrome to match the badge.

### 6.8 `<CommandPalette />`
Opens on `/`: a small floating list above the command line with fuzzy-matched commands and tabs, navigated with ↑/↓, Enter to run.

### 6.9 `<Lightbox />`
Full-screen view for certificates and project screenshots over a dimmed background. Esc or click to close.

---

## 7. Tabs (pages)

Each tab is a real route. Opening one "runs" its command in the buffer, and the left visual changes to match.

| # | Tab | Route | Command shown | Left visual |
|---|---|---|---|---|
| 0 | home | `/` | `figlet ankesh jaiswal` … | ID badge (front) |
| 1 | about | `/about` | `cat about.md` | B&W photo stack (polaroid-style, monochrome) |
| 2 | work | `/work` | `ls ~/projects` | Screenshot of the selected project in a window frame |
| 3 | skills | `/skills` | `skills --tree` | Graphs: skill bars, GitHub heatmap, language split |
| 4 | certs | `/certs` | `ls ~/certs` | Certificate card deck |
| 5 | contact | `/contact` | `cat contact.txt` | ID badge flipped to the back (QR + socials) |

### 0 · home
```
ankesh@portfolio:~$ figlet ankesh jaiswal
<ANKESH figlet, large, white>  <JAISWAL figlet, small, grey>

ankesh@portfolio:~$ cat intro.txt
Full-stack developer building fast, thoughtful web apps.          ← lead
Currently building project-name — one line on what it does.       ← text
Previously interned at company. Based in India.

ankesh@portfolio:~$ stat --summary
PROJECTS     YEARS CODING     CERTIFICATES     NOW
6+           3+               5                ● project-name

ankesh@portfolio:~$ ls ~/links
→ github   → linkedin   → email   → resume.pdf

ankesh@portfolio:~$ █
```

### 1 · about
- `cat about.md` → 2–3 short paragraphs (who you are, what you care about, what you're looking for).
- `git log --oneline --graph` → experience and education timeline as a git graph:
  ```
  * a3f9c21  2025-06  Software Engineer Intern @ Company
  * 7be41d0  2024-08  Started B.Tech CSE @ University
  * c19e5a8  2022-01  First line of code
  ```
- `cat now.txt` → what you're currently learning or building.
- **Left:** a stack of 3–4 B&W photos (you, workspace, events). Hovering a timeline entry brings its matching photo to the front.

### 2 · work
- `ls ~/projects` → project list, one row each: `name  stack  year  status`.
- Selecting a project (click, ↑/↓, or `open <name>`) expands it inline:
  ```
  ── project-name ───────────────────────────────
  One-paragraph description: the problem, what you built, the outcome.
  stack   next.js · postgres · tailwind
  role    solo / team of 3
  links   → live   → github
  ```
- **Left:** a screenshot of the hovered or selected project in a minimal window frame, crossfading on change. Click opens the lightbox. The visual area widens to about 42%.

### 3 · skills
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
  - GitHub contribution heatmap (last 26–40 weeks) in grey levels. Only the current week is red.
  - Language split as a stacked bar from GitHub data.
- Hovering a skill in the tree highlights its bar on the left.

### 4 · certs
- `ls ~/certs` → `git log`-style list: `a3f9c21  2025-03  AWS Cloud Practitioner — Amazon`.
- `open <cert>` or clicking a row shows its details (issuer, date, credential ID, verify link).
- **Left:** a fanned deck of certificate cards (monochrome rendering of the real certificate image). The selected certificate slides to the top. Click opens the lightbox. The visual area widens to about 42%.

### 5 · contact
- `cat contact.txt` →
  ```
  email     ankesh@…            → copy
  github    github.com/ankesh-10
  linkedin  linkedin.com/in/…
  resume    resume.pdf          → download
  ```
- `mail` → opens a minimal in-terminal form (name → email → message, one prompt at a time) that posts to a serverless route (Resend or Formspree).
- **Left:** the ID badge returns and auto-flips to its back (big QR code + socials).

---

## 8. Command system

### Navigation
| Input | Action |
|---|---|
| `home` `about` `work` `skills` `certs` `contact` | Open the tab (also `cd ~/work`, `/work`) |
| `0`–`5` or `1`–`6` keys (when the command line is not focused) | Jump to the tab |
| Click a tmux tab | Jump to the tab |
| `/` | Open the command palette |
| `:` | Focus the command line |
| `Esc` | Close the palette or lightbox, blur the command line |

### Commands
| Command | Output |
|---|---|
| `help` / `:help` | List of commands |
| `whoami` | `ankesh — full-stack developer` |
| `ls` | Lists tabs as directories |
| `open <project\|cert>` | Expands that item and updates the left visual |
| `resume` | Downloads `resume.pdf` |
| `github` / `linkedin` / `email` | Opens the link (email copies to clipboard and confirms `copied ✓`) |
| `clear` / `Ctrl+L` | Clears the buffer back to the current tab's base output |
| `theme log` / `theme hex` | Switches the background mode |
| `history` | Shows previous commands |

### Easter eggs
| Command | Response |
|---|---|
| `sudo hire-me` | `[sudo] password for recruiter: ****` → `access granted. opening contact…` |
| `rm -rf /` | `nice try.` |
| `vim` | `you're already in it.` |
| `exit` / `:q` | `there is no escape. (try :help)` |
| `neofetch` | ASCII logo + system-style info about you |
| `matrix` | 3s monochrome character rain over the background, then fades |

### Input behavior
- **Tab** autocompletes commands and arguments; **↑/↓** walk the history (kept in `sessionStorage`).
- Unknown command → `command not found: xyz. try 'help'`, with a "did you mean" suggestion based on edit distance.
- Every command is echoed into the buffer as a new prompt line before its output.

---

## 9. Animation spec

| Moment | Animation | Timing |
|---|---|---|
| **First load (boot)** | Background fades in → title bar appears → the first command types out → figlet draws row by row → remaining blocks stream in → badge drops | ~1.6s total, skippable with any key or click; shown once per session |
| **Typing a command** | Characters appear one by one | 18–28ms per char, slight random jitter |
| **Output streaming** | Lines appear top to bottom | 20–35ms per line, whole tab ≤ 350ms |
| **Figlet name** | Rows reveal top to bottom with a 1-frame block flicker | 40ms per row |
| **Tab change** | Old output fades (120ms) → new prompt types → output streams. Left visual swaps out, then in | ≤ 600ms |
| **Visual area resize** | Width springs between 32% and 42% | stiffness 200, damping 26 |
| **Badge** | See §6.1 (drop, swing, sway, drag, flip, retract) | |
| **Cursor** | Block cursor blinks | 1.06s steps, solid while typing |
| **Status line** | `line:col` and file name tick to new values | instant, numbers count up |
| **Links / hover** | Underline grows left → right, item brightens one tier | 150ms |
| **Background** | Hex: slow upward scroll. Log: occasional new line | continuous, paused when hidden |

**Reduced motion** (`prefers-reduced-motion: reduce`): no boot sequence, no typing (output appears instantly), the badge hangs still (flip becomes a crossfade) and the background is static.

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
  since: number;                // 2022
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
  featured?: boolean;
};

export type SkillGroup = { group: string; items: { name: string; level?: number }[] };

export type Certificate = {
  slug: string; name: string; issuer: string;
  date: string;                 // "2025-03"
  credentialId?: string; verifyUrl?: string;
  image: string;
};

export type TimelineEntry = { hash: string; date: string; title: string; org?: string; photo?: string };
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
    work/page.tsx
    skills/page.tsx
    certs/page.tsx
    contact/page.tsx
    api/contact/route.ts    # contact form handler
    opengraph-image.tsx     # OG image in the same style
    globals.css             # tokens
  components/
    shell/        Shell.tsx  Background.tsx
    terminal/     TerminalWindow.tsx  TitleBar.tsx  Buffer.tsx  Line.tsx
                  Prompt.tsx  VimStatusLine.tsx  CommandLine.tsx  TmuxBar.tsx
                  CommandPalette.tsx
    blocks/       Figlet.tsx  Lead.tsx  Text.tsx  Table.tsx  Links.tsx
                  GitLog.tsx  Tree.tsx
    visual/       VisualPanel.tsx  IdBadge.tsx  PhotoStack.tsx
                  ProjectPreview.tsx  SkillGraphs.tsx  CertDeck.tsx  Lightbox.tsx
  content/        (see §10)
  lib/
    commands.ts             # parser, registry, autocomplete, history
    typing.ts               # typewriter / stream helpers
    github.ts               # GraphQL fetchers
    useReducedMotion.ts
public/
  fonts/JetBrainsMono-Regular.woff2  JetBrainsMono-Bold.woff2
  images/me-bw.jpg  projects/*  certs/*
  resume.pdf
```

---

## 12. Mobile & tablet

One site, one URL, separate layouts. No separate mobile site.

### Tablet (768–1023px)
- Keep the split; visual area `40%`, terminal font sizes −1px, badge scaled to 0.85.

### Phone (< 768px)
```
┌──────────────────────┐
│ ankesh.dev     14:22 │
│        ║             │
│     ┌──╨──┐          │  badge, scaled ~0.7, hangs top-center
│     │ ID  │          │
│     └─────┘          │
├──────────────────────┤
│ ~/home.md            │  terminal becomes full-width, no window margin
│ $ figlet ankesh      │  figlet scales to fit the width
│ ...                  │  visuals appear inline between text blocks
├──────────────────────┤
│[home][about][work]…  │  tmux tabs become a scrollable chip row
│ ❯ tap to type        │  command line stays, opens the keyboard on tap
└──────────────────────┘
```
- Normal vertical scrolling, no page swapping.
- Left-panel visuals (photos, graphs, certificates) render **inline** right after their text block.
- Badge: tap to flip. It can sway with device tilt (`DeviceOrientationEvent`, opt-in on iOS), with idle sway as the fallback.
- Background: static (no scroll animation), slightly dimmer.
- Line-number gutter shrinks to 32px; vim status line shows the file name only.

---

## 13. Accessibility, SEO & performance

**Accessibility**
- Every tab's content exists as real semantic HTML (headings, lists, links). The terminal look is styling, not canvas text.
- The background canvas and decorative ASCII get `aria-hidden="true"`; the figlet name has an `sr-only` text equivalent.
- Fully keyboard operable; visible focus ring (1px yellow outline).
- Text contrast: body `--text-2` and `--text-3` on `--bg` pass WCAG AA at 15px. Never use `--text-4` or dimmer for essential info.
- A "skip intro" control is available during the boot sequence.

**SEO**
- Per-route `metadata` (title, description), an OG image in the same visual style, `sitemap.xml`, `robots.txt`.
- Content is server-rendered, so crawlers see full text.

**Performance budget**
- LCP < 1.5s, JS < 150KB gzipped on first load, CLS ≈ 0.
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
- [ ] **Projects (3–6):** name, year, status, one-line summary, paragraph, stack, role, live and GitHub links, screenshot (16:10)
- [ ] **Skills** grouped by category (optional self-rating 0–100)
- [ ] **Certificates:** name, issuer, date, credential ID, verify URL, image
- [ ] **Links:** GitHub, LinkedIn, email, resume PDF
- [ ] Badge details: location, "since" year, status
- [ ] Domain name (e.g. `ankesh.dev`)

---

## 15. Build phases

### Phase 1: Foundation
- [ ] Next.js + TypeScript + Tailwind v4 scaffold, ESLint/Prettier
- [ ] Tokens in `globals.css`, self-hosted full JetBrains Mono (verify box-drawing glyphs render)
- [ ] `Shell` layout: background layer + visual area + terminal window, responsive breakpoints
- [ ] Content types + placeholder content

### Phase 2: Terminal
- [ ] `TerminalWindow`, `TitleBar`, `Buffer` with gutter and `~` fill, `VimStatusLine`, `TmuxBar` with live clock
- [ ] All output blocks (figlet, lead, text, table, links, gitlog, tree)
- [ ] Routes for all 6 tabs rendering their static output

### Phase 3: Commands
- [ ] Command parser and registry, navigation commands, `help`, unknown-command handling
- [ ] Autocomplete, history, keyboard shortcuts, command palette
- [ ] Easter eggs

### Phase 4: Visual area
- [ ] `IdBadge`: front/back, entrance, sway, cursor tilt, drag, flip, retract
- [ ] `PhotoStack`, `ProjectPreview`, `SkillGraphs` (with GitHub data), `CertDeck`, `Lightbox`
- [ ] `VisualPanel` transitions and the 32% ↔ 42% resize

### Phase 5: Motion & background
- [ ] Background canvas (hex default, log alternative, `theme` command)
- [ ] Boot sequence, typing and streaming, tab transitions
- [ ] Reduced-motion paths

### Phase 6: Mobile, polish, ship
- [ ] Phone and tablet layouts, inline visuals, chip-row tabs
- [ ] Accessibility pass, SEO metadata, OG image
- [ ] Contact form route
- [ ] Lighthouse ≥ 95 across the board, deploy to Vercel, connect the domain
