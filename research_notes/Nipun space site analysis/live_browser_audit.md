# nipun.space: live browser audit

Observed 23 October 2026 in a real Chromium (Playwright 1.63 build 1243, headless) driving https://www.nipun.space/. This checks the code-only notes in this folder (`structure_and_navigation.md`, `interactions_and_animation.md`, `responsive_and_stack.md`) against what the site actually does. No site code in this repo was changed.

**Method.**
- **Tooling.** The Playwright MCP browser tools were not available in this session; `ToolSearch` for "+playwright browser" returned no match. I used Microsoft's agent CLI, `@playwright/cli` 0.1.22 (`playwright-cli`), installed into the scratchpad.
- **Browser config.** `.playwright/cli.config.json` points `executablePath` at `/opt/pw-browsers/chromium` with `--no-sandbox` (needed because the container runs as root). I did not run `playwright install`.
- **Scripts.** Every check ran through `playwright-cli run-code --filename=<script>.js`. The scripts and the config are saved in `live/scripts/` so the run can be repeated.
- **Widths.** 375×812 and 768×1024 ran with `isMobile` and `hasTouch` on; 1024×768 and 1440×900 ran as desktop. Each width used a fresh browser context, so its cache started cold.
- **Skipping the intro.** Except where the boot or tour itself was under test, a script preset `sessionStorage['nipun.booted']` and `localStorage['nipun.tour.v2']` to skip them.
- **Screenshots.** They are in `live/` as JPEG quality 70 at viewport size. Names follow `<width>-<route>.jpg`, plus named states such as `1440-lucbot-q2-done.jpg`.
- **Forms.** Nothing was submitted. Requests to `api.web3forms.com` were intercepted and aborted, and none fired.

Legend used below: **✔ confirmed**, **✎ corrected**, **＋ new** (not in the code-only notes).

---

## 1. Boot screen and first-visit tour

**Boot** (`1440-boot-600ms.jpg` → `1440-boot-1900ms.jpg`, `375-boot.jpg`)
- ✔ A full-screen black overlay shows "✶ nipun.os v1.0.0 / initializing_", then five `[ ok ]` lines with ms counters that count up: kernel 4ms, mounting /work /about /uni-verse 37ms, neural weights loaded 218ms, uplink established 19ms, interface ready 11ms. A red segmented progress bar with a % readout and "press any key to skip" sit bottom-left.
- ✔ Timeline from navigation start:
  - 0% at about 360 ms;
  - the first line and 42% at about 760 ms;
  - three lines and 100% at about 1.2 s;
  - "nipun.os ready" at about 1.9 s;
  - the overlay gone by about 3.2 s.
- ✔ Any key skips it. Pressing a key at 660 ms brought up the tour at 1.5 s.
- ✔ It runs once per tab session. After a reload, `sessionStorage['nipun.booted']="1"` and the boot does not show again.
- ✎ The **progress bar fills faster than the lines print**. It hits 100% (about 1.2 s) while only 3 of the 5 lines are showing, so the bar and the log disagree.
- ＋ The overlay sits over the fully rendered home page. The page's text is in the DOM under it from the first frame.
- ＋ The background behind the boot is a **dim red, dithered noise or "data" field** on the right half, not plain black (`1440-boot-1200ms.jpg`).

**Tour** (`1440-boot-4500ms.jpg`, `1440-tour-step10.jpg`, `375-tour.jpg`)
- ✔ About 0.5 s after the boot ends, a modal "▸ HOW TO GET AROUND" opens over a blurred, darkened page.
- ✔ The modal holds a mock terminal. A fake cursor moves to its input, "types" `/`, and a 4-row menu (work, about, skills, contact) opens. The highlight then steps down the rows. In the capture, "about" was highlighted about 2 s into the loop.
- ✔ Copy: "This bar at the bottom is your controller. Tap it (or press /) to open the menu and jump to any page, or just ask a question about my work."
- ✔ Dismissal: **Esc**, "skip" or "got it". Any of them stores `localStorage['nipun.tour.v2']="1"`, and the tour never shows again on that browser.
- ＋ On a 375 px phone the same modal fills nearly the whole screen. It **blocks every first visit on every device** until the visitor dismisses it.

## 2. Routes at 375 / 768 / 1024 / 1440

Every route keeps the document at exactly the viewport size: `scrollingElement` is 375×812, 768×1024, 1024×768 or 1440×900. Anything taller scrolls inside one inner `div.h-full overflow-y-auto` with a hidden scrollbar (✔). The fixed chrome is the same everywhere:
- a top bar with ← back and ⌂ home on inner pages, a red ✶, the `~/path · subtitle` label, a red dot, the live HH:MM:SS clock and "online";
- the bottom command input;
- ＋ a **status ticker** just above the input ("⠋ Cogitating… / Querying Nipun… / Compiling thoughts… / Synthesizing… · press / to run a command"). It cycles through these words about every 2 s on every page.

✎ The code-only notes put the playful words inside LucBot's "thinking" state. Live, they are an **always-on idle ticker**. LucBot's own thinking state shows "retrieving…▌" (see §5).

✎ The ticker is absolutely positioned at `bottom-full` and is **not reserved in the layout**. It overlaps page content on almost every page:
- the Files pane on `/work/serenity`;
- the "SCROLL · SYSTEM TELEMETRY" label on `/about`;
- the portrait and stats on the 375 home;
- body text on phone routes.

See `1440-work_serenity.jpg`, `1440-about.jpg` and `375-home.jpg`.

| Route | Layout and sections (observed) | What scrolls | Entry motion |
|---|---|---|---|
| `/` (`*-home.jpg`) | **≥1024:** three zones. The left holds the pixel-block "NIPUN SUJESH" logo, the role line, "Currently building Uni-Verse", and 4 stats with segmented bars (12+, 8+, CURRENT Uni-Verse, 4+). A **centre vertical wheel nav** shows skills/home/services/work/writing/about/contact with "SCROLL · CLICK". The right holds the stippled portrait with a glowing red laptop, a SYSTEM CPU/MEM/DISK/NET widget and a FOCUS list. **768:** one column; the portrait fills the lower half; stats sit in one row. **375:** one column; the portrait fades in behind a 2×2 stats grid. | nothing | stats and portrait fade in |
| `/work` (`*-work.jpg`) | A legend (● production ● built ● experiment) and "drag · scroll · hover" sit above a full-height horizontal card strip. The CURRENT card (Uni-Verse) is centred and has a **green** border. PRODUCTION cards have solid red borders. EXPERIMENT cards have no image, only the title in large red display type. There are 19 cards. | the strip only (horizontal, 14–18k px wide) | cards fade and rise |
| `/work/serenity` (`*-work_serenity.jpg`) | A header row with "← /projects", the title, a PRODUCTION badge, the year, "live ↗" and "source ↗". **≥1024:** a Files pane (README.md … links.md, "⎇ main", "↑↓ open files") next to a Preview/Raw reader with a word count and a right-edge mini-TOC of dashes. **≤768:** the file list becomes a horizontal tab strip above the reader. | the reader pane (about 5.5–8.7k px) | fade |
| `/writing` (`*-writing.jpg`) | "WRITING_" in a pixel display face, then `> ls ~/writing · 5 posts`. A "[ latest ]" featured card, then a numbered ARCHIVE list (02–05) with date, read time, summary and tags. | inner pane | fade and rise |
| `/writing/four-tier-memory` | "← cd ~/writing", the date, "2 min read", tags and the title. Body headings are rendered as `## heading`. | inner pane | fade |
| `/about` (`1440-about*.jpg`) | The hero is a **huge red ASCII-art "NIPUN"** (a `<pre>`, 878×812, not a canvas) next to "ABOUT_" and a **typewriter intro** ("Hey, I'm Nipun. / AI engineer. Builder. / …") with a "⏩ skip" chip. Below it: SKILLS chips with icons, CURRENTLY, and LET'S CONNECT. Further down: a sticky telemetry strip (UPTIME 1544d…, LOAD AVG, FOCUS, MEMORY, STACK, LOCATION), a RUNNING PROCESSES table, SKILLS v2.0 bars, IDENTITY.SYS and SYSTEM LOG; a "core.exe" mind map (NIPUN at the centre, with AI/ML, FULL-STACK, PROJECTS, LEARNING and BEYOND CODE boxes on dotted wires); and a `~/timeline` running 2021 → 2026. | inner pane (4.6–6.8k px) | typewriter, then scroll reveals |
| `/skills` (`1440-skills*.jpg`) | `> ~/skills_`, then sector buttons. A radar with an animated centre score sits next to a "// breakdown" list of bars, tools and "in: <project>". | inner pane (short at 1440) | radar draws in |
| `/services` (`1440-services*.jpg`) | "SERVICES_", a status line ("taking select projects…") and ALL/WEB/AI APPS/AUTOMATION filters. Each service is a large card with checklist deliverables, tech chips and "start a project →". The Web card includes a **3D rotating carousel of theme mock-ups** ("6 theme directions · hover to pause"). The brief form is at the bottom. | inner pane (2.4–3.9k px) | fade |
| `/achievements` (`1440-achievements*.jpg`) | "UNLOCKED_", a GPA 8.24 / SHIPPED 15+ / RESEARCH 1 strip, a WINS grid of 4 cards with "view certificate ⌄", and a CERTIFICATIONS **accordion** (for example "7 courses ⌄", whose rows have "view cert" links opening PNGs in a new tab). "verify on linkedin ↗" closes the page. | inner pane | fade and rise |
| `/opensource` | "OPEN SOURCE_", `> gh repos --public`, and 2 repo cards. | none at ≥768 | fade |
| `/contact` (`*-contact.jpg`) | `> compose --to nipun_`, then the from / reply-to / body fields and a ":send" button. **≥1024:** a "$ channels --list" side panel (email, github, linkedin, resume) plus "Kerala, India · IST +5:30 · open to: Generative AI Engineer roles · 2026". **375:** one column, with the channels below the fold. | inner pane on phones | fade |
| `/map` (`*-map.jpg`) | **≥768:** an engineering-drawing "blueprint" sheet: a 1–5 / A–D grid frame, a title block (REV 2.0 · 2026.07), module boxes on a red "CMD BUS /", a LUCBOT daemon box and annotations ("sounds: webaudio synth, zero samples", "cursor: aim reticle · css only", "rag: 91 chunks · bm25 + embeddings · rrf", "stack: react 19 · vite · vercel · ollama cloud · gemini embeddings"). **375:** ＋ a **different layout**, a plain list of modules, each with a one-line annotation and ✓. | none at ≥768 | fade |
| unknown path | ✔ Redirects to `/` (client-side) with no 404 page. | | |

✔ Per-route `<title>` is set client-side: "Projects — Nipun Sujesh", "Serenity — project by Nipun Sujesh", "Services — Web, AI Apps & Automation | Nipun Sujesh" and so on.

**Responsive changes**
- ✔ The only structural breakpoint is `lg` (1024).
- ✎ The bottom **quick-nav strip** (work/about/skills/services/writing/contact) exists **only below 1024 px**. At 1024 and 1440 the bottom bar is just the input plus the `~/nipun.os/<path> | ◷ timer | ready` status. Desktop users navigate with the `/` palette, the home wheel, or back/home.
- At 768 the strip gains the `❯ cd ~/` prefix and the "or type / for all" hint (✔), and the active route shows a red ● (✔).
- ＋ At 768 the placeholder "type / for commands · or ask LucBot anything" is **clipped** to "…or ask Luc" because the status cluster takes the room (`768-*.jpg`).
- ✔ Input font size: 16 px at 375 (so iOS does not zoom on focus) and 14 px from 768 up. Placeholder at 375: "ask LucBot · / for commands".

## 3. Navigation

- **`/` hotkey** ✔. It focuses the input and pre-fills `/`. Tapping the input on a phone also pre-fills `/` (`375-palette.jpg`).
- **Palette** ✔/＋ (`1440-palette-arrow.jpg`). It opens as a panel above the input with 12 commands, each with a description:

  | Command | Description |
  |---|---|
  | /home | back to the terminal |
  | /projects | what I've shipped, and the hard parts |
  | /services | web · ai apps · automation — for hire |
  | /about | who I am, fast |
  | /skills | the stack, honestly rated |
  | /writing | notes and posts |
  | /opensource | public code |
  | /achievements | certs and wins |
  | /resume | download the PDF |
  | /contact | email · github · linkedin |
  | /uni-verse | the platform I'm building |
  | /map | the site blueprint |

  - The footer reads "↑↓ move ↵ open · clear / and type to ask about me".
  - The selected row gets a red left bar, a tinted background and a "↵" glyph.
  - ↑/↓ move the selection.
  - Typing filters by substring: `/sk` leaves only /skills.
  - Enter on a partial match opens the top match: `/abo` ↵ goes to `/about`.
  - Esc clears the input to empty.
  - Visited routes show "✓". After visiting only /about and /map, the palette ticked exactly those two.
  - ✎ The "rainbow" `/services` row was not visibly rainbow in the captured frames. It renders like any other row when selected.
- **Home wheel nav** (≥1024 only) ✔/✎.
  - Mouse-wheel moves the highlight one step per notch and plays a 600 Hz square "tick". The active item is 21 px, red and letter-spaced; the others are 16 px and fade with distance.
  - ✎ In my run, **ArrowDown and `j` did not move the wheel** and **Enter did not navigate**. Only a click navigates. The code-only note said ↑/↓ also drive it; I could not reproduce that with the page focused.
- **j/k**: these work **only on project detail pages**, where `j`/↓ and `k`/↑ step through the README files (README → features → architecture → features). They do nothing on home.
- **Back / home buttons** ✔. They are the first two icons in the top bar on every inner page. "Go back" is history back (/writing → /skills); "Go home" goes to `/`.
- **/map visited ticks** ✔. They are shared with the palette (`sessionStorage['nipun.visited']`). In a fresh session that had visited only /about, /map ticked ABOUT only. Hovering a module rewrites the NOTES box (SKILLS → "26 skills across 6 sectors on one radar. click a sector to zoom."), and clicking a module navigates.
- **Route change** ✔. Client-side navigation does not reload the page, and the only requests were the favicon and the portrait PNG. Sampled every 70 ms on /writing → /services:
  - the new page's content mounts at opacity 0 and about 10 px low;
  - it is about 65% visible at 230 ms and fully settled by about 450–600 ms;
  - the h1 header row is already at full opacity.

  There is no exit animation and no blank frame. It feels instant, with a soft settle.

## 4. Interactions

- **Custom cursor**. ✎ The code-only notes said there was "no custom cursor". In fact `body` sets `cursor: url(data:image/svg+xml…)`, a 22×22 **aim-reticle SVG cursor** (pure CSS, as the /map annotation says). Links and buttons fall back to `pointer`.
- **Cursor spotlight** ✔/✎. `--mx`/`--my` are written onto `div.pointer-events-none absolute inset-0 z-20 hidden sm:block`. It reveals a **red line grid** (about 13 px cells, not dots) in a soft circle around the cursor (`1440-home-spotlight.jpg`). The whole site also has a very faint static grid behind everything.
- **Card hover on /work** ✔ (`1440-work-hover.jpg`). The card lifts about 8 px, its description expands, and "↵ open" appears.
  - Enter opens the card **nearest the centre**, not the hovered one. Hovering Serenity and pressing Enter opened `/work/pragati`.
- **Carousel** ✔. Measured `scrollLeft` changes:
  - ArrowRight: +320;
  - a 300 px vertical wheel: +300 horizontal;
  - a 200 px pointer drag: +200, with no accidental click-through;
  - edge-hover at the right 10%: +128 px in 1 s. That is slower than the code's `9*speed px/frame` implies; headless rAF timing may cut it.
  - The strip loops: it started at `scrollLeft≈5534`, the middle copy of the tripled list.
- **Draggable badges / nodes** ✎.
  - I found **no draggable badges on /achievements**: no `cursor-grab`, `[draggable]` or drag handlers. Wins are static cards, and certs are an accordion.
  - The /about "drag the nodes" mind map is custom SVG/DOM, **not React Flow**: `.react-flow__node` count = 0, even though React Flow CSS ships in the bundle.
  - Drag on the mind map was not confirmed.
- **Skills radar filters** ✔/＋.
  - The page opens with **AI / ML preselected**, not ALL. The centre reads 82 and the breakdown lists 6 AI skills.
  - Clicking BACKEND shows centre 76 and the backend skills.
  - Clicking ALL shows centre 75 "ALL SECTORS" and a SECTORS bar list (AI/ML 82, LANGUAGES 79, BACKEND 76, FRONTEND 70, DATA 70, CLOUD/DEVOPS 70).
  - The selected button turns red (`rgb(255,51,36)`).
- **Services filter** ✔. AI APPS leaves only "Custom AI Applications".
  - "start a project →" smooth-scrolls the pane to the brief form at `scrollTop` 1552 and preselects that service. The message is prefilled with a template ("Hi Nipun, I need a website. / What it's for: / Pages / section…").
- **About ASCII "glitch"** ✔/✎. It is a `<pre>`, not a canvas.
  - Moving the pointer across it smears and RGB-splits the letters (`1440-about-glitch.jpg`).
  - It starts the drone: two sine oscillators at **160 Hz and 240 Hz** (instrumented).
- **About typewriter** ＋. The intro types out over about 2.5–3 s with a red block caret. It is already complete under reduced motion.
- **Sounds**. Instrumented by wrapping `AudioContext.createOscillator`:
  - wheel step → `square@600`;
  - about pointer → `sine@160, sine@240`;
  - typing in the command bar → no sound;
  - hovering a wheel item → no blip captured (the throttled hover blip may need the context already running).
  - **No mute control exists** (✔). No button or `aria-label` mentions sound, mute or audio.
- **Haptics** ✔. `navigator.vibrate(5)` fires once per keystroke in the command input (3 keys → `[5,5,5]`).
- **Home "Uni-Verse" hover card**. Not captured; my selector found no "BUILDING" popover. Unverified.
- **Mic button** ✔. It is present in Chromium, which exposes `webkitSpeechRecognition`.

## 5. LucBot

Screenshots: `1440-lucbot-q{1,2,3}-{thinking,streaming,done}.jpg`.

- **UI.** The answer opens as a panel above the input, made of:
  - the question echoed in red (`> question`);
  - `retrieving…▌` while it fetches, then the streamed text with a block caret;
  - source chips (`from /about`, `from /achievements`);
  - a footer "esc to clear · answers from site data only";
  - an ✕ close button.

  Esc closes the panel and returns to the idle ticker (✔).
- **Network** ✔. The first question loads `/rag/chunks.json` and `/rag/embeddings.json`. A question then sends `POST /api/ask {embed: q}` followed by `POST /api/ask {question, chunks}`.
  - The broad question ("which project should I look at first?") **skipped the embed call** (✔ "meta/fact injection" path).
  - First streamed text arrived about 0.5–2.2 s after Enter, and answers completed in 2–5 s.
- **Q1** "what is LucBot and how does it work?" → about 60 words: hybrid BM25 + embeddings, a serverless proxy "that speaks the new HTTP QUERY method (RFC 10008) with POST fallback". ✎ The client itself only sent POST.
- **Q2** "which project should I look at first?" → "Start with Serenity…", plus a red **"↵ see Serenity"** button.
  - ✎ The suggestion button is labelled "see <page>", not "take me to …".
  - ✔ Enter on the empty input then navigated to `/work/serenity`.
- **Q3** "how can I hire Nipun?" → ＋ **a bug**. The model emitted raw HTML instead of the `@@NAV{…}@@` marker, and the UI printed it literally: `<button onclick="suggest_page({label:'Hire Nipun',page:'/services'})">Hire Nipun</button>`.
  - No nav button was rendered.
  - The source chip appeared twice ("from /work/serenity" ×2), because the current page is boosted.

## 6. Forms (validation only; nothing was sent)

**Contact** (`1440-contact-empty-submit.jpg`, `1440-contact-invalid.jpg`)
- ✔ A hidden `botcheck` honeypot, the fields "your name", "you@domain.com" and a textarea, and the `:send` button. The form is `noValidate`, so browser bubbles are off.
- Empty submit shows red messages under each field:
  - `[ err ] who's calling?`
  - `[ err ] needs a valid address`
  - `[ err ] say a bit more (10+ chars)`
- An invalid email ("not-an-email") with a long body shows only `[ err ] needs a valid address`.
- ＋ Errors clear as soon as the field is edited, with no need to resubmit.

**Services brief** (`1440-services-brief*.jpg`)
- The same fields; the button is `:send brief`.
- Empty submit shows `who's calling?`, `needs a valid address` and ＋ `[ err ] fill the brief a little`.
- ✎ The code-only notes said "message ≥20 characters"; I did not probe the exact threshold.

## 7. Reduced motion (`reducedMotion: 'reduce'`)

- ✔ The boot overlay is effectively skipped. Its node is briefly in the DOM with progress stuck at 0%, but by about 1.7 s the tour is already showing (`1440-reduced-boot.jpg`).
- ✔ The tour **still appears and still blocks**, but statically, in its final state: the menu is open, "work" is highlighted and the input shows `/▌` (`1440-reduced-tour.jpg`).
- ✔ The spotlight is off: no `--mx` is set on mouse move.
- ✔ The ticker spinner is replaced by a static `✶`.
- ✔ No running CSS animations were found.
- ＋ The about typewriter renders the full text immediately (`1440-reduced-about.jpg`).

## 8. Smoothness and performance

Each width's first load was cold, and LCP/CLS came from a buffered `PerformanceObserver`. Later routes were full `goto` loads with a warm cache. The run was unthrottled.

| Width | Home LCP (cold) | Other routes LCP | Max CLS (route) | Typical CLS |
|---|---|---|---|---|
| 375 | 1292 ms | 236–1128 ms | 0.023 (/about) | 0.0008 |
| 768 | 1308 ms | 268–912 ms | 0.022 (/about) | 0.0002 |
| 1024 | 2020 ms | 296–840 ms | **0.090 (/about)**, 0.045 (/work/serenity) | 0.0002 |
| 1440 | 2248 ms | 368–884 ms | 0.068 (/about) | 0.0001 |

- ✔ CLS is near zero everywhere, because the viewport is locked.
- ✎ The exception is **/about**, which shifts as the typewriter and hero settle (up to 0.09 at 1024). The code-only notes reported 0.002–0.018 because they only measured home.
- ✎ Desktop home LCP (2.0–2.2 s) is slower than mobile (1.3 s). The large portrait and overlay PNGs are the LCP candidates on the two-column layout.
- I saw no jank in route changes: no reload, a ≤600 ms settle, and steady fixed chrome. Scrolling is native, inside the inner pane, and its scrollbar is hidden. A thin right-edge rail with a red dot and a % readout shows scroll progress on long pages (＋ visible on /about, /skills, /services and /achievements). "SCROLL ▼" hints appear at the bottom centre.

---

## Summary of corrections and additions to the code-only notes

**Corrected**
1. **There is a custom cursor**: an aim-reticle SVG on `body`, done in CSS only.
2. The spotlight reveals a **red line grid**, not a dot grid.
3. The **quick-nav strip appears only below 1024 px**. Desktop has no visible section links except on home (the wheel).
4. The playful status words are an **always-on idle ticker**, not LucBot's thinking state. LucBot shows "retrieving…".
5. LucBot's navigation buttons read **"↵ see <page>"**, not "take me to".
6. **No draggable achievement badges** were found, and the /about mind map is **not React Flow**.
7. The home wheel nav responded to the mouse wheel and to clicks only. Arrow keys, j/k and Enter did not drive it in my run.
8. /about has measurable **layout shift** (0.068–0.09 on desktop).
9. Skills opens with **AI / ML preselected**, not ALL.

**New**
1. The status ticker **overlaps page content** on most routes and widths.
2. The input placeholder is **clipped at 768 px**.
3. **/map has a separate phone layout** (a plain list).
4. /about has a **typewriter intro** with a skip chip and a giant ASCII `<pre>`.
5. **Services has a 3D carousel** of theme mock-ups.
6. **Certifications are an accordion**.
7. The **boot progress bar reaches 100% before the log finishes**.
8. The **tour blocks first visits on phones** too, and still appears under reduced motion.
9. LucBot **printed raw HTML** for a "hire" question.
10. **Enter on /work opens the centred card, not the hovered one.**
11. **Form errors clear on edit**.

**Confirmed**
- Routes, titles and the redirect for unknown paths.
- Boot text, timings, skip behaviour and once-per-session storage.
- The tour's content, its Esc/skip/got-it dismissal and `nipun.tour.v2`.
- The `/` hotkey and pre-fill; the palette's 12 commands with ↑↓/Enter/Esc, substring filtering and visited ✓.
- /map ticks shared with the palette.
- Carousel looping, wheel, drag and arrow keys.
- j/k on project READMEs.
- The radar filters.
- The services filters and the brief prefill.
- The `[ err ]` validation copy and the honeypot.
- The two-step `/api/ask` flow and the meta shortcut.
- `vibrate(5)` per keystroke.
- WebAudio square and sine sounds, with no mute.
- The reduced-motion paths for the boot, tour, spotlight and spinner.
- The viewport-locked shell with an inner scroll pane.
- 16 px phone input.
