# nipun.space: structure, navigation and content model

Method note: the site is a client-rendered single-page app (Vite + React, react-router). Every URL returns the same ~5.7 KB HTML shell with an empty `<div id="root">`, so WebFetch sees almost nothing. Playwright could not start in this environment (Chrome binary missing). All findings below come from (a) `robots.txt`, `sitemap.xml`, `llms.txt` and `/rag/chunks.json` fetched directly, and (b) reading the single production JS bundle `https://www.nipun.space/assets/index-Cv9N7JWJ.js` (702 KB, prettified locally). Observed 2026-10-23. Bundle-derived facts describe what the code does; I did not see it render.

Sources referenced below:
- Bundle: [index-Cv9N7JWJ.js](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Shell HTML: [nipun.space](https://www.nipun.space/)
- [sitemap.xml](https://www.nipun.space/sitemap.xml), [robots.txt](https://www.nipun.space/robots.txt), [llms.txt](https://www.nipun.space/llms.txt), [rag/chunks.json](https://www.nipun.space/rag/chunks.json)

## 1. What pages/routes exist? (every URL found)

### Takeaway
There are 12 top-level routes plus two dynamic detail routes (`/work/:projectId`, `/writing/:slug`). The sitemap lists 26 URLs: 10 sections, 11 project pages and 5 posts. Any unknown path redirects to `/` instead of showing a 404.

### Cited Findings
- The router defines `/`, `/work`, `/work/:projectId`, `/opensource`, `/writing`, `/writing/:slug`, `/about`, `/skills`, `/services`, `/achievements`, `/contact`, `/map`, and `*` → `<Navigate to="/" replace>`. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- The bundle rewrites legacy hash URLs (`#/x`) to clean paths at startup. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Sitemap URLs (all lastmod 2026-10-18):
  - Sections: `/` (1.0), `/work` (0.9), `/services` (0.9), `/about` (0.8), `/skills` (0.8), `/achievements` (0.7), `/writing` (0.7), `/opensource` (0.6), `/contact` (0.7), `/map` (0.5).
  - Projects: `/work/serenity`, `/work/pragati`, `/work/guardia`, `/work/samarth`, `/work/godprofile`, `/work/smart-notes`, `/work/studypath`, `/work/task-manager-pro`, `/work/xlnet-emotion`, `/work/fake-news-classifier`, `/work/uni-verse`.
  - Posts: `/writing/four-tier-memory`, `/writing/why-uni-verse`, `/writing/agents-that-build-their-own-tools`, `/writing/rag-with-a-job`, `/writing/mcp-became-the-plug`.
  - [sitemap.xml](https://www.nipun.space/sitemap.xml)
- `robots.txt` allows everything and explicitly allows AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Bingbot). It points to the sitemap. — [robots.txt](https://www.nipun.space/robots.txt)
- `/llms.txt` exists (8 KB plain text). It holds a "Key facts" summary plus link lists of projects and writing for LLM crawlers. — [llms.txt](https://www.nipun.space/llms.txt)
- Other public files: `/images/Nipun_Sujesh_Resume.pdf` (PDF, ~130 KB), `/og.png` (1200×630 OG image), `/favicon.svg`, `/favicon-32.png`, `/apple-touch-icon.png`, `/rag/chunks.json`, `/rag/embeddings.json`. There is no web manifest: `/manifest.json` and `/site.webmanifest` return the HTML shell. — [Shell HTML](https://www.nipun.space/); fetched directly
- The shell HTML carries SEO metadata: a canonical link, OG and Twitter cards, JSON-LD `Person` (jobTitle, worksFor, alumniOf, hasCredential, knowsAbout, sameAs GitHub/LinkedIn, email, homeLocation) and JSON-LD `WebSite`. It also loads Google Analytics (gtag). — [Shell HTML](https://www.nipun.space/)
- Server behaviour: every path, including a nonexistent one, returns HTTP 200 with the same shell (SPA fallback rewrite). — fetched directly
- Each page has a pseudo-path label shown in its header: `~/projects`, `~/projects/<slug>`, `~/writing`, `~/writing/<slug>`, `~/about`, `~/skills`, `~/services`, `~/contact`, `~/achievements`, `~/opensource`, `~/map`. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- The URL is `/work` but the UI calls it "projects" (`/projects` command, `~/projects` label). A replica could alias both.
- The site has no SSR, so per-page `<title>` and meta tags are probably the same everywhere. I found no per-route head management in the bundle, but did not check it exhaustively.

### Gaps
- The visual rendering of each page was not observed, because the headless browser was unavailable.

## 2. How does navigation work?

### Takeaway
The main navigation is a fixed bottom "terminal" command bar on every page. It has a row of section buttons, a `/` slash-command palette and a free-text box that asks LucBot (the RAG assistant). The home page adds a centred vertical scroll-wheel menu on large screens. There is no top navbar and no hamburger menu.

### Cited Findings
- **Bottom command bar (global, fixed `bottom-0`, z-50).** It has three rows. All details below are from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js).
  1. A quick-nav strip: a `❯ cd ~/` prefix (≥sm only), then buttons for `work`, `about`, `skills`, `services`, `writing` and `contact`, then the hint "or type / for all". The active route is highlighted with a dot. The strip scrolls horizontally on narrow screens.
  2. The input line, labelled `aria-label="terminal command input"`.
     - Placeholder on desktop: "type / for commands · or ask LucBot anything". Below 640px: "ask LucBot · / for commands".
     - Focusing an empty input pre-fills `/`.
     - A mic button for voice input uses the Web Speech API (`SpeechRecognition`, lang `en-IN`) and only shows when the browser supports it.
     - Keystrokes call `navigator.vibrate(5)`.
  3. A status line (≥sm): the current path as `~/nipun.os/<path>`, a session timer `◷ Xm YYs`, and a "ready" indicator with a heartbeat glyph.
- **Global `/` hotkey.** Pressing `/` anywhere outside an input focuses the command bar with `/` typed. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Slash-command palette.** It opens above the input while the text starts with `/`.
  - Filtering is a substring match on the command name.
  - Keys: ↑/↓ to move, Enter to run, Esc to clear. Mouse hover selects.
  - Commands already visited this session show a "✓". Visited routes are stored in `sessionStorage` key `nipun.visited`.
  - The full command list, with what each does:

    | Command | Action |
    |---|---|
    | `/home` | go to `/` |
    | `/projects` | go to `/work` |
    | `/services` | go to `/services`; flagged `special`, rendered with a "rainbow" class |
    | `/about` | go to `/about` |
    | `/skills` | go to `/skills` |
    | `/writing` | go to `/writing` |
    | `/opensource` | go to `/opensource` |
    | `/achievements` | go to `/achievements` |
    | `/resume` | download `Nipun_Sujesh_Resume.pdf` |
    | `/contact` | go to `/contact` |
    | `/uni-verse` | open `https://uni-verse.co.in` in a new tab |
    | `/map` | go to `/map` |

  - [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Free text + Enter** sends the question to LucBot (see section 4). Once an answer is done, Enter on an empty input follows the first suggested page. Esc clears the answer. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Home-only vertical menu** (`<nav aria-label="Site navigation">`). It is fixed in the centre of the viewport and visible only at ≥lg (1024px).
  - Items: skills, home, services, work, writing, about, contact.
  - It works like a rotating wheel: mouse-wheel or ↑/↓ moves the selection (throttled to 240 ms), and a click navigates.
  - The hint below it reads "scroll · click".
  - [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Page shell.** Every non-home page is wrapped in a shell with a top bar holding:
  - a "Go back" button and a "Go home" button (by `aria-label`),
  - a status cluster (`✶`, `◉ … online`),
  - the page's `~/path` and a subtitle such as "for hire", "notes and posts" or "system monitor // a person".
  - [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Scroll progress indicator.** A global component shows a "scroll ▼" cue and a percentage when the page or its main scroll container has more than 48px of overflow. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Page-level keyboard shortcuts.** All from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js).
  - Projects (`/work`): ←/→ scroll the card carousel by 320px. Enter opens the card nearest the centre.
  - Project detail: ↓/`j` and ↑/`k` move between the README "files". A hint shows "↑↓".
  - Onboarding tour: Esc dismisses it.
  - Boot screen: any key or pointer press skips it.
- **First-visit onboarding tour** ("▸ how to get around"), all from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js):
  - It is a blurred modal overlay that animates a fake cursor typing `/` and stepping through `work`, `about`, `skills` and `contact`, with the hint "type / or ask anything".
  - It has "skip" and "got it" buttons.
  - It waits for the boot screen to finish (the `nipun:booted` event).
  - It is shown once, stored in `localStorage` key `nipun.tour.v2`.
- **Boot sequence.** A full-screen black overlay prints `[ ok ]` lines (kernel, mounting …, neural weights loaded, uplink established, interface ready) with ms counters and a progress bar, then the hint "press any key to skip". All from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js).
  - It runs about 2.05 s.
  - It runs once per session (`sessionStorage` key `nipun.booted`).
  - Reduced motion skips it.
- **Footer.** None. The bottom command bar takes the place of a footer. Post pages end with a sign-off line. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **UI sounds.** Small Web Audio oscillator blips (square/triangle waves) play on hover, select, navigate and error, plus a low "boom" effect. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- On mobile, all navigation goes through the bottom bar: the quick-nav strip plus `/` commands. The home wheel menu is hidden below lg.
- I found no mute or toggle control for the UI sounds (no storage key or button found). Sounds play only after a user gesture, since the AudioContext is created lazily.

### Gaps
- I could not confirm the exact visual position of the back/home buttons or how the shell header behaves on scroll (sticky or not), because the page was not rendered.

## 3. What does each section show, and what are the content types and fields?

### Takeaway
All content is hard-coded as typed JS objects in the bundle; there is no CMS and no runtime fetch for page content. The main types are project cards, project READMEs made of typed blocks, posts made of typed blocks, skills with self-rated scores, services, achievements and certifications, timeline entries, open-source repos and contact channels.

### Cited Findings (all from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js) unless noted)

**Home `/`**
- A full-viewport hero.
  - Top status bar: "welcome to nipun.os · portfolio v1", a live IST clock (`Asia/Kolkata`, updates every second) and "online".
  - A large name/logo graphic and a one-line role statement.
  - A "Currently building Uni-Verse" line. The link has a hover card with a BUILDING badge and opens uni-verse.co.in.
  - A stats row with fill bars: PROJECTS SHIPPED 12+, AI APPLICATIONS 8+, CURRENT, YEARS CODING 4+.
  - A portrait image on the right (≥lg), or blended in at the bottom on mobile.
  - A mouse-following red grid "spotlight" over the background (≥sm).
  - A FOCUS panel of pairs (AI × FULL STACK, PRODUCTS × SYSTEMS, LEARNING × SHIPPING) and a DISK gauge.
- [llms.txt](https://www.nipun.space/llms.txt) also describes a "live football scoreboard" on home that uses football-data.org through a serverless proxy. I found no football or scoreboard code in the current bundle. Either it was removed, or llms.txt is stale.

**Projects `/work`** (subtitle "things I've shipped, and the hard parts")
- A horizontal, infinitely looping carousel: the list is tripled and the scroll position wraps.
- It supports drag-to-scroll, wheel-to-horizontal and edge-hover auto-scroll, with the hint "drag · scroll · hover".
- A legend shows the three status types: ● production, ● built, ● experiment.
- 19 cards in total: 1 CURRENT, 4 PRODUCTION, 6 BUILT and 8 EXPERIMENT.
  - CURRENT: Uni-Verse.
  - PRODUCTION: Serenity, Pragati, Guardia, Samarth.
  - BUILT: GodProfile, Smart Notes, StudyPath, Task Manager Pro, XLNet Emotion, Fake News Classifier.
  - EXPERIMENT: BLIP Captioning, AI Audio Analyzer, IBM GPT Voice, BertQA Bot, Azure Image Analysis, smarttimer, NeuroFlow, Cat/Dog CNN.
- Card fields: `title`, `tag` (CURRENT/PRODUCTION/BUILT/EXPERIMENT), `year`, `stack` (a one-line string), `desc`, `tags[]`, and an optional `img` screenshot.
- Each status has its own border style: solid red, dashed or dotted. CURRENT and PRODUCTION get an animated border.
- Every card links to `/work/<slugified title>`.

**Project detail `/work/:projectId`** (11 projects have detail data; the rest are experiments)
- Layout styled like a GitHub repo viewer. The header has "← /projects", "live ↗" and "source ↗".
- A left "Files" pane (with a "⎇ main" label) lists sections as `.md` files. Its width is drag-resizable on desktop.
- A right pane has a "Preview" tab and a "Raw" link to the repo.
- Data model:

  ```
  { title, tag, year, stack, live?, repo?,
    sections: [{ id, label: "README.md" | "architecture.md" | …, title, blocks: [...] }] }
  ```

- Block types: `p`, `h`, `quote`, `links`, `kv` (2-column rows), `list`, `code`, `stack` (grouped tech), and custom diagram blocks `arch`, `chatflow`, `features`, `layer`.
- Section files seen include README.md, features.md, architecture.md, memory.md, crisis.md, chatflow.md, stack.md, api.md, running.md, status.md, links.md, boot-flow.md, how-it-works.md, pipeline.md, results.md and data.md.
- An unknown slug, such as an EXPERIMENT card, shows "No detailed readme wired for this one yet." with a back button.

**Writing `/writing`** and **post `/writing/:slug`**
- The list sorts posts by date, newest first.
- The newest post renders as a featured card. The rest are listed under an "ARCHIVE" heading.
- The header shows a post count.
- Post fields: `slug`, `title`, `date` (ISO), `tags[]`, `summary`, and `body[]` of `{t: "p"|"h"|"list"|"quote", c}`.
- The post page shows:
  - a "← cd ~/writing" back link,
  - the date in en-GB long format,
  - a computed "N min read",
  - tag chips and the title,
  - the body, with `h` blocks rendered as "## heading",
  - a sign-off line "— Nipun · nipun.space".
- There are 5 posts, dated 2026-03-08 to 2026-06-18.
- There is no tag filtering, search or RSS feed. No `/rss.xml` or feed reference was found in the bundle.

**About `/about`** (subtitle "system monitor // a person")
- A hero styled as a system monitor, with:
  - an animated identity graphic,
  - text blocks "SKILLS:", "CURRENTLY:" and "LET'S CONNECT:" (links to GitHub, LinkedIn and email),
  - a "SCROLL · SYSTEM TELEMETRY ▼" button that smooth-scrolls to the next section.
- A telemetry dashboard section:
  - SYSTEM UPTIME, LOCATION, LOAD AVG, MEMORY, STACK and FOCUS.
  - A "RUNNING PROCESSES" table with columns PID, PROCESS, TAG, STATE and CPU, listing current activities as processes, e.g. "Uni-Verse Platform".
  - An "IDENTITY.SYS" card.
  - A "SYSTEM LOG".
  - A self-rated skills block.
  - A "core.exe" node diagram of AI / ML, FULL-STACK, PROJECTS, LEARNING and BEYOND CODE.
- A draggable node graph ("drag the nodes.") whose node types are EDUCATION, SKILL, CERTIFICATION, PROJECT, EXPERIENCE and MILESTONE.
- A vertical timeline "the path so far · 2021 → now", ending in a "● now" marker.
  - Entry fields: `year`, `type` (education/skill/…), `file` (e.g. `10th-grade.edu`, `python.init`), `title`, `desc`.

**Skills `/skills`** (subtitle "calibrated loadout")
- An SVG radar chart grouped by sector (`aria-label` "Skill radar, grouped by sector").
- Sector filter buttons: ALL, AI / ML, LANGUAGES, BACKEND, FRONTEND, DATA, CLOUD / DEVOPS. They can be clicked as buttons or on the radar arcs.
- Hovering a skill shows its value. The centre readout shows the average for the selected sector.
- Skill fields: `n` (name), `v` (0–100 self-rating), `tools[]`, `used[]` (projects or employers where it was used).
- The page also has promo panels linking to service examples ("assistant.live", "pipeline.map").

**Services `/services`** (subtitle "for hire")
- A header with availability notes: a current internship, live production projects, and "taking select projects".
- Filter buttons: ALL, WEB, AI APPS, AUTOMATION.
- Three service cards, each with a "hire" action that scrolls to the brief form and preselects the service.
  - Service fields: `key` (web/ai/auto), icon, `title`, `pitch`, `gets[]` (deliverables), `tech[]`, and `visual` (ring/chat/pipe animation).
- A brief form ("> compose --brief") with fields from:, reply-to:, a service selector and brief:.
  - The message is prefilled with a per-service template.
  - Validation: name required, email regex, message at least 20 characters.

**Achievements `/achievements`** (subtitle "certs and wins")
- A "WINS" list. Fields: `year`, `title`, `desc`, optional `img`. Examples: a Gen AI Academy cohort, a conference paper, a shipped-projects count, an olympiad.
- A "CERTIFICATIONS" list. Fields: `title`, `issuer`, `img`, optional `courses[]` of `{n, img}` for multi-course specialisations.
- Each certification has a "view cert" link that opens the image in a new tab. A "verify on linkedin" link is also shown.

**Open source `/opensource`** (subtitle "public code")
- Repo cards with fields `name`, `kind` (e.g. "mcp server", "learning resource"), `desc`, `tech[]` and `url`. There are 2 entries: GodProfile and learning-nlp-from-scratch.
- Footer links: "project source lives with each project → ~/work" and "everything else on github".

**Contact `/contact`** (subtitle "open a channel")
- A form ("> compose --to nipun") with fields from: (name), reply-to: (email) and body: (textarea, placeholder "a role, a project, an idea, or just a hello…").
- The submit button reads ":send".
- A side panel "$ channels --list" lists:
  - email (mailto),
  - GitHub,
  - LinkedIn,
  - a resume entry ("download the PDF").
- Quick facts are shown as key/value pairs: GPA, SHIPPED, RESEARCH.

**Map `/map`**
- A "site blueprint" drawing styled like a technical sheet ("NIPUN.OS — SITE BLUEPRINT · SHEET 1/1 · DRAWN: NIPUN · CHECKED: LUCBOT", plus a revision and scale block).
- Nodes for HOME, WORK (with sub-nodes linking to `/work/<slug>`), ABOUT, SKILLS, SERVICES, WRITING, ACHIEVEMENTS, OPEN SOURCE and CONTACT, all wired to a "CMD BUS /".
- A LucBot "daemon · answers from every module" node and a NOTES box.
- Nodes are clickable and show a ✓ for pages visited this session.

### Inferences
- The content model is close to "content as typed data", with block-typed rich text for project READMEs and posts. That maps cleanly onto a typed `src/content/` approach.
- The `/map` page acts as a human-readable sitemap and progress tracker, since it shares the visited set with the command palette.

### Gaps
- Exact values in the About telemetry (uptime, load numbers) and whether they are animated were not verified.
- How the `CURRENT` home stat renders was not fully traced.

## 4. Special features (search, theme, filters, assistant, easter eggs, etc.)

### Takeaway
The standout feature is **LucBot**, a RAG assistant built into the command bar. Retrieval is hybrid: BM25 runs in the browser and embeddings go through a serverless `/api/ask` endpoint, which streams the answer. Its answers can include clickable "take me to …" page suggestions. The site has no theme toggle (dark only), no site search beyond LucBot, no comments, guestbook, view counter or Spotify widget.

### Cited Findings
- **LucBot retrieval flow.**
  1. The client fetches `/rag/chunks.json`: 92 chunks with fields `{id, page, title, text, kind?}`, where `kind` is `fact` (14) or `meta` (11).
  2. It computes BM25 in the browser and boosts chunks from the current page.
  3. For broad "best / projects / overview"-type questions it injects meta and fact chunks.
  4. Otherwise it loads `/rag/embeddings.json` and gets a query vector via `POST /api/ask {embed: q}`.
  5. It fuses BM25 and vector rankings with reciprocal-rank fusion and keeps the top 5.
  6. It sends `POST /api/ask {question, chunks}` and streams the response body into the UI.
  - [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js); [chunks.json](https://www.nipun.space/rag/chunks.json)
- **LucBot UI.** All from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js).
  - While thinking, a braille spinner cycles playful status words ("Cogitating", "Reticulating splines", …).
  - Answers stream in with a block cursor. Up to 2 source pages are listed.
  - Navigation suggestions are parsed from `@@NAV{"page":…,"label":…}@@` markers in the model output and rendered as buttons. They are restricted to an allow-list of routes plus `resume`.
  - Errors show inline, including a 403 "firewall wants a fresh handshake" message.
  - Esc clears the answer.
- `POST /api/ask` with an empty chunk list returned a streamed greeting introducing LucBot as the portfolio assistant. — fetched directly, 2026-10-23
- [llms.txt](https://www.nipun.space/llms.txt) says the proxy speaks the HTTP QUERY method with a POST fallback. The current bundle only uses POST: no `QUERY` method string was found.
- **Filters.** Skills has sector filters and the radar. Services has category filters. Projects shows a status legend only, with no filter. Writing has no filter. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Theme.** The site is dark only (`theme-color #050505`). No theme toggle was found in the app code. — [Shell HTML](https://www.nipun.space/); [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Delight and easter-egg details:**
  - the boot sequence,
  - the first-visit tour,
  - "visited" ✓ ticks in the palette and on the map,
  - a rainbow-styled `/services` command,
  - Web Audio UI blips and haptic vibration on typing,
  - a live IST clock and session timer,
  - voice input.
  - [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Analytics.** Google Analytics 4 (`gtag`) is loaded in the shell. — [Shell HTML](https://www.nipun.space/)
- **Reduced motion.** A reduced-motion hook gates the boot screen, counters and spinners: for example, the static `✶` replaces the spinner. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- No hidden text commands (`sudo`, `matrix`, konami and similar) exist. Any non-`/` input goes to LucBot, so LucBot doubles as the "easter egg" surface.
- The football scoreboard in llms.txt is either removed or not deployed in this bundle. A replica should not count on it.

### Gaps
- I could not check whether `/api/ask` applies rate limiting or a bot challenge (the 403 path suggests some firewall or turnstile layer) without abusing the endpoint.
- The contents of `embeddings.json` (dimension, model) were not inspected.

## 5. How is the contact flow done?

### Takeaway
There are two client-side forms (Contact and the Services brief). Both POST JSON straight to **Web3Forms** (`api.web3forms.com/submit`) with a hidden honeypot field. A prefilled `mailto:` link is the fallback when sending fails. Direct channels (email, GitHub, LinkedIn) and a resume download are always visible. There is no Cal.com or Calendly booking link.

### Cited Findings
- **Contact form.** All from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js).
  - Fields: name, email, message.
  - Validation messages appear inline as `[ err ] …`: name required, email regex, message at least 10 characters.
  - A hidden `botcheck` honeypot input silently aborts the send when it is filled.
  - It sends `{access_key, subject: "nipun.space — message from <name>", name, email, message}` to `https://api.web3forms.com/submit`.
  - States: idle → sending ("sending…") → sent ("[ ok ] delivered…", which resets the form) or error.
  - On error it shows "[ err ] channel down —" with a "send by mail instead" `mailto:` link prefilled with subject and body.
- **Services brief form.** Same Web3Forms flow. All from the [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js).
  - Adds a service selector.
  - Subject: "nipun.space — <Service title> inquiry from <name>". The message is prefixed `service: <key>`.
  - The message must be at least 20 characters.
  - Fallback link: "send by mail" (subject "Project inquiry").
- **Channels list:** email (`mailto:`), github.com/Luc0-0, linkedin.com/in/nipun-sujesh and a resume PDF download. The same three links appear on About under "LET'S CONNECT:". — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- **Resume access:** the `/resume` command, the contact side panel, and LucBot "resume" nav suggestions all download `/images/Nipun_Sujesh_Resume.pdf` via a programmatic `<a download>` click. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- No Cal.com, Calendly or scheduling link was found among the bundle's external URLs. — [Bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- The Web3Forms access key sits in client code, which is by design for Web3Forms. A replica could use the same pattern or a server route such as `/api/contact`.

### Gaps
- No live submission was made, so the server-side behaviour and confirmation email were not verified.
