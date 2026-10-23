# nipun.space: responsive layout, performance and tech stack

Observed 23 October 2026 from the live site (https://www.nipun.space/). Methods: `curl -sI`/`curl` for headers, HTML, CSS and JS bundles. Headless Chrome 156 via Playwright 1.63 at 375x812 (isMobile, touch), 768x1024 (isMobile, touch) and 1440x900 (desktop). I loaded `/`, `/work`, `/about`, `/skills` and `/contact` at each width. The Playwright MCP server could not launch Chrome as root without `--no-sandbox`, so I ran a Node script with `chromiumSandbox: false` instead. Screenshots are in `screens/` next to this file:

- `phone-375-home.png`, `tablet-768-home.png`, `desktop-1440-home.png`: home page after dismissing the first-visit tour.
- `*-work.png`, `*-about.png`: those routes at each width.
- `phone-375.png`, `tablet-768.png`, `desktop-1440.png` (and `-full` versions): the first-visit state, with the "How to get around" onboarding modal over a blurred page.

All lab numbers come from one unthrottled run on a cloud container. They show relative weight, not field Core Web Vitals.

## What framework/hosting/stack is it built with?

### Takeaway
nipun.space is **not Next.js**. It is a client-rendered **Vite + React SPA** styled with **Tailwind CSS v3** and animated with **Framer Motion** (GSAP and three.js strings also show up in the bundle). It is deployed as static files on **Vercel**, with one serverless endpoint (`/api/ask`) for the "LucBot" RAG chat. Every route gets the same 5.7 KB HTML shell with an empty `<div id="root">`.

### Cited Findings
- Response headers show `server: Vercel`, `x-vercel-cache: HIT`, `x-vercel-id: iad1::…`, `strict-transport-security: max-age=63072000` and `cache-control: public, max-age=0, must-revalidate`, with `age: 427346` (the CDN copy was about 5 days old) — [nipun.space headers](https://www.nipun.space/)
- The HTML starts with a lowercase `<!doctype html>`. The `<body>` holds only `<div id="root"></div>`. Scripts are Vite-style hashed module entries: `<script type="module" crossorigin src="/assets/index-Cv9N7JWJ.js">`, `modulepreload` for `/assets/react-core-C29F69zp.js` and `/assets/animations-BwHzEo7y.js`, and `/assets/index-D_smUe9e.css`. There is no `__NEXT_DATA__`, no `/_next/` path and no `meta generator` — [nipun.space HTML](https://www.nipun.space/)
- `/work` returns a byte-identical HTML document to `/` (5755 bytes, `cmp` reports no difference), which is SPA fallback routing — [nipun.space/work](https://www.nipun.space/work)
- Manual chunks are named `react-core` (42 KB raw) and `animations` (122 KB raw; it contains "framer" strings) — [animations chunk](https://www.nipun.space/assets/animations-BwHzEo7y.js)
- The CSS contains Tailwind v3 custom properties (`--tw-backdrop-blur`, `--tw-backdrop-brightness`, …) and Tailwind's default breakpoints (`min-width` 640/768/1024/1280/1536px). DOM class names are Tailwind utilities with arbitrary values, such as `h-[100dvh]`, `lg:grid-cols-[1.1fr_0.9fr]` and `max-w-[1480px]` — [index CSS](https://www.nipun.space/assets/index-D_smUe9e.css)
- The main CSS bundles React Flow styles (`.react-flow{…--xy-edge-stroke-default…}`), and the JS contains "React Flow" strings. This is probably the "mind map" on /about — [index CSS](https://www.nipun.space/assets/index-D_smUe9e.css)
- The main JS contains the strings `gsap` and `three` and the endpoint `"/api/ask"`. `curl -I /api/ask` returns HTTP 405 (exists, wrong method), which points to a Vercel serverless function — [main bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Google Analytics 4 (`gtag/js?id=G-JFVMFVEPTQ`) loads as an `async` script in `<head>` — [nipun.space HTML](https://www.nipun.space/)
- Per-route titles and meta are set on the client: `/work` shows the title "Projects — Nipun Sujesh" and `/about` shows "About — Nipun Sujesh", each with its own description and canonical. The bundle contains `document.title=` and `og:title` handling — [Playwright on nipun.space/work](https://www.nipun.space/work)

### Inferences
- "Gsap" and "three" appear only as short string hits. They could be library code or just words in content (for example a skills list). I saw no `<canvas>` on the home page, so three.js is probably not rendering anything there.
- The site loads fast because the bundle is small and Vercel's CDN serves everything, not because of SSR. A Next.js 16 build can beat it on first paint and SEO by server-rendering real HTML per route, which nipun.space does not do.

### Gaps
- I could not see the Vite config, `vercel.json` or the source repository, so the chunking and rewrite settings are inferred from outputs. The structured data lists GitHub `Luc0-0`, but I did not search it for the repo.

## How do nav, grid, typography and images change at 375 / 768 / 1440px?

### Takeaway
Each "page" is a fixed **app-shell that fills the viewport** (`h-[100dvh]`, `overflow-hidden`); content scrolls inside an inner `overflow-y-auto` panel, not on the document. Phone and tablet share **one single-column layout** with the portrait as a dimmed backdrop and a nav row docked at the bottom. Only at **`lg` (1024px)** does home split into a two-column grid with a vertical wheel nav and the portrait in its own column. Fluid `clamp()` handles display type and card widths between those steps.

### Cited Findings
**Shell (all widths)**
- The root section is `relative flex h-[100dvh] w-full flex-col overflow-hidden`. `document.scrollingElement.scrollHeight` equals the viewport height at every width (812 / 1024 / 900), and `scrollWidth` equals the viewport width, so there is no horizontal page scroll. Long pages scroll inside `DIV.h-full overflow-y-auto [&::-webkit-scrollbar]:hidden` (about: 375x703 viewport with 6841px of content on phone, 1440x799 with 4855px on desktop) — [Playwright on nipun.space](https://www.nipun.space/about)
- The fixed chrome is a top status bar ("welcome to nipun.os · portfolio v1", clock, "online") and a bottom command input ("type / for commands · or ask LucBot anything", mic button). The input is the main navigation and chat entry — [screens/desktop-1440-home.png](https://www.nipun.space/)
- The JS reads `matchMedia("(min-width: 1024px)")` and `matchMedia("(max-width: 639px)")`, so some layout and behaviour switches happen in React, not only in CSS — [main bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Home `/`**
- Phone 375: one column (`grid-cols-1`, content padding `56px 16px 64px`). Text order is figlet-style name, tagline, "Currently building Uni-Verse", then a 2x2 stats grid. The portrait is an absolute layer covering the bottom 56% (`absolute inset-x-0 bottom-0 h-[56%]`) behind the stats. A horizontal row of nav buttons (work/about/skills/services/writing/contact, 12px, 26px tall) sits above the input and runs past the screen edge ("contact" sits at x=352, width 70, on a 375px screen), so it scrolls sideways. The header wraps to two lines at 53px tall. The input font is 16px so iOS does not zoom on focus — [screens/phone-375-home.png](https://www.nipun.space/)
- Tablet 768: still one column (`sm:px-8` gives 32px side padding). Stats become one row of 4. The portrait fills the lower half at full width. The bottom nav row gains a `❯ cd ~/` prefix and an "or type / for all" hint. A session timer/status ("~/nipun.os | 0m 05s | ready") appears next to the input. The input font drops to 14px — [screens/tablet-768-home.png](https://www.nipun.space/)
- Desktop 1440: the grid becomes 2 columns, measured at `835px 605px` (class `lg:grid-cols-[…]`). The left column holds the name (an SVG, 475x224), tagline, stats row and a "SYSTEM CPU/MEM/DISK/NET" widget. A centred vertical **wheel nav** (`NAV` with buttons skills/home/services/work/writing/about/contact, current item at 21px, others at 16px fading, "SCROLL · CLICK") replaces the bottom row. The right column (`hidden … lg:flex`) holds the portrait (624x745 rendered) and a FOCUS tag cloud — [screens/desktop-1440-home.png](https://www.nipun.space/)

**Work `/work`**
- On every width the project list is a horizontal **drag/scroll carousel** with the current card centred, plus "drag · scroll · hover" hints on desktop. Card width matches `clamp(232px,22vw,300px)`, found in both CSS and JS: about 232px on phone (neighbouring cards peek at the edges) and 300px on desktop (about 4.5 cards visible). Card titles are 18px JetBrains Mono at every width. On phone the active bottom-nav chip ("work ●") is highlighted — [screens/desktop-1440-work.png, screens/phone-375-work.png](https://www.nipun.space/work)

**About / Skills / Contact**
- These use Tailwind `lg:` asymmetric grids that collapse to one column below 1024px. About uses `mx-auto grid max-w-[1480px] lg:grid-cols-[1.1fr_0.9fr]` (730/598px at 1440, 327px single column at 375) and `grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14`. Skills uses `lg:grid-cols-[1.15fr_0.85fr]` with gap 32 rising to 48px. Contact uses `lg:grid-cols-[1.15fr_0.85fr]`, gap 48 rising to 64px, inside `max-w-[1200px]` — [Playwright on nipun.space/about, /skills, /contact](https://www.nipun.space/about)
- About has a sticky stats strip, `sticky top-0 grid grid-cols-2 sm:grid-cols-3` (2 columns on phone, 3 on tablet; the computed value showed 6 tracks on desktop). Its process table uses `grid-cols-[2.5rem_1fr_4.5rem_2.5rem]` on phone and gains columns at `sm` (5 tracks: 56/264/96/96/128px at 768) — [Playwright on nipun.space/about](https://www.nipun.space/about)

### Inferences
- The site behaves like a full-screen app at every size. It never scrolls the document; inner panels scroll. This keeps the chrome fixed without `position: fixed` hacks and uses `100dvh` to avoid the mobile URL-bar jump. It also means native page scroll, scroll restoration and some accessibility tooling act on an inner element.
- The phone and tablet layouts are largely the same; 768px mostly gets more padding and wider text. The only big structural switch is at 1024px.
- For the Portfolio project (Next.js 16 + Tailwind v4), the patterns to copy are: a `100dvh` app shell with an inner scroll region, one structural breakpoint at `lg` with `minmax`/`fr` asymmetric grids, `clamp()` for display type and card widths, a 16px input font on phones, and a bottom command bar plus a horizontally scrolling chip nav on phones. In this repo, container queries (already used for the TmuxBar) can replace the JS `matchMedia` checks.

### Gaps
- I did not measure 1024px or 1280px exactly, so the precise point where home switches to two columns is inferred from the `lg:` classes and `matchMedia("(min-width: 1024px)")`.
- I did not test landscape phone or very wide (2560px) screens. The `max-w-[1480px]`/`max-w-[1440px]` caps suggest the content is centred and capped there.

## Typography and spacing system

### Takeaway
There are three main families from Google Fonts: **JetBrains Mono** for UI, body and terminal text, **Inter** as the `body` fallback stack, and **Jersey 25**, a pixel display face, for H1s. The stylesheet also requests Libre Caslon Text and Libre Caslon Display, which home did not use. Display type is fluid through `clamp()`; body and UI sizes are fixed small mono sizes (11–16px). Content width caps at 1200–1480px depending on the page, and spacing follows Tailwind's 4px scale.

### Cited Findings
- A single Google Fonts `@import` sits at the top of the main CSS: `family=Inter:wght@300;400;500;600;700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Libre+Caslon+Display&family=JetBrains+Mono:wght@400;500;700;800&family=Jersey+25&display=swap` — [index CSS](https://www.nipun.space/assets/index-D_smUe9e.css)
- The `body` font is `Inter, system-ui, sans-serif` at 16px. Most visible UI text computes to `"JetBrains Mono", Fira Code, monospace`, at 11px (header), 12px (nav chips, H2 section labels), 13–15px (links, menu items) and 18px (card H3s, line-height 28px) — [Playwright on nipun.space](https://www.nipun.space/)
- `document.fonts` registered 69 faces, but only 3–5 loaded on home (Inter 400, plus 500/600 on desktop; JetBrains Mono 400/500). The site downloaded two woff2 files on home (Inter about 49 KB, JetBrains Mono about 32 KB) and also Jersey 25 on inner routes — [Playwright network log](https://www.nipun.space/)
- The fluid sizes found in the JS and CSS are `clamp(2.75rem, 6.5vw, 5.5rem)`, `clamp(2.5rem, 5.5vw, 4.5rem)` (4 uses), `clamp(1.7rem, 4.5vw, 2.6rem)`, `clamp(2rem,3.4vw,3rem)`, `clamp(280px, 33vw, 480px)` and `clamp(232px,22vw,300px)`. The About H1 "ABOUT_" (Jersey 25) measured 44px at 375, 49.92px at 768 and 88px at 1440, which matches `clamp(2.75rem, 6.5vw, 5.5rem)` exactly (6.5vw at 768 = 49.92px; the 5.5rem cap = 88px) — [main bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js); [Playwright on /about](https://www.nipun.space/about)
- The home name "NIPUN SUJESH" is an inline SVG (475x224 at 1440) drawn as dotted pixel blocks, not text — [Playwright on nipun.space](https://www.nipun.space/)
- Max widths in use: `max-w-[1480px]` (about), `1440px` and `720px` (skills), `max-w-[1200px]` (contact), `max-w-[400px]` (onboarding modal), and in the CSS also 1000/1040/1240/1400/1500px and `42rem`/`28rem` — [index CSS](https://www.nipun.space/assets/index-D_smUe9e.css); [Playwright](https://www.nipun.space/about)
- Gutters are 16px on phone and 32px from `sm` (640px) up (`px-4 … sm:px-8`). Grid gaps step up at `lg`: `gap-6`→`lg:gap-8`, `gap-10`→`lg:gap-14`, `gap-12`→`lg:gap-16` — [Playwright on nipun.space](https://www.nipun.space/about)

### Inferences
- Fluid type is used only for display headings. Small mono UI text stays at fixed pixel sizes, which keeps the terminal look crisp at every width, much like the Portfolio's vim/tmux chrome.
- The Google Fonts request loads more families and weights than the pages render (Libre Caslon x3, Inter 300/700, JetBrains Mono 700/800). It costs little only because Google serves per-unicode-range woff2 files on demand.

### Gaps
- I did not inspect line-height and letter-spacing tokens beyond the samples above, and found no CSS custom-property type scale.

## Performance: weight, requests, images, fonts, layout shift

### Takeaway
The JS/CSS is lean (about 300 KB compressed across 3 first-party chunks plus 13 KB CSS, 13 requests on home), and Vercel's edge serves it quickly: FCP about 0.8–1.1s and LCP about 1.1–1.7s unthrottled, CLS of 0.002–0.018. Page weight is about **2 MB, of which about 1.42 MB is two unoptimised PNGs** loaded eagerly on home. The hashed assets are served with `max-age=0, must-revalidate`, so repeat visits revalidate every file. Its speed comes from a small bundle and the CDN, not from image or caching discipline.

### Cited Findings
- **Home requests (all three widths): 13 requests, about 1.99 MB transferred.** document 2.3 KB; CSS 13.2 KB plus Google Fonts CSS 1.7 KB; JS: `index` 225 KB (702 KB uncompressed), `animations` 41 KB (122 KB uncompressed), `react-core` 16 KB (42 KB uncompressed), GA `gtag/js` 184 KB; images: `overlay.png` 797 KB (1536x1024) and `nipun.png` 623 KB (1023x1537); fonts 49 KB + 32 KB woff2; favicon.svg; one GA collect ping — [Playwright network log on nipun.space](https://www.nipun.space/)
- Compression: the HTML is 5755 bytes uncompressed and 1993 bytes with Brotli/gzip negotiated — [curl on nipun.space](https://www.nipun.space/)
- Lab timings (one run each, unthrottled, 375 / 768 / 1440): TTFB 327 / 435 / 412 ms; FCP 776 / 1108 / 1080 ms; DOMContentLoaded 763 / 1082 / 880 ms; load 1072 / 1453 / 1428 ms; LCP 1076 / 1588 / 1696 ms, with the LCP element being the portrait `IMG.h-full w-full object-cover` (or the `overlay` img on desktop); CLS 0.018 / 0.006 / 0.002; DOM about 1,850 nodes; JS heap about 11–12 MB — [Playwright PerformanceObserver on nipun.space](https://www.nipun.space/)
- Images are **PNG only** (no WebP/AVIF, no `srcset`, no `width`/`height` attributes). Home images use `loading=auto`. On `/work`, project images (`uni-verse.png` 900x1125, `Serenity.png`/`Pragati.png`/`Samarth.png` 1122x1402, `Guardia.png`/`godprofile.png` 1003x1568) use `loading="lazy"`; the bundle has 5 `loading:"lazy"` and 2 `decoding:"async"` occurrences and 34 `.png` references. `nipun.png` appears twice in the DOM (one copy with 0x0 size, the other shown), and both mobile and desktop download the same 1023x1537 file — [Playwright on nipun.space/work](https://www.nipun.space/work); [main bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Caching: `/assets/*.js|css` (hashed filenames), `/images/*.png` and `/og.png` all return `cache-control: public, max-age=0, must-revalidate`, with `x-vercel-cache: HIT` at the edge. Browsers will therefore revalidate them (etag/304) on each navigation rather than cache them for a long time — [curl -I on assets](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Font loading: `<link rel="preconnect">` to fonts.googleapis.com and fonts.gstatic.com (crossorigin) plus `dns-prefetch` for GTM and google-analytics in `<head>`, but the font CSS is pulled by a CSS `@import` inside the main stylesheet, chained HTML → CSS → fonts CSS → woff2, with `display=swap`. There are no `<link rel=preload>` hints for fonts — [nipun.space HTML](https://www.nipun.space/); [index CSS](https://www.nipun.space/assets/index-D_smUe9e.css)
- JS loading: one module entry plus 2 `modulepreload` chunks; I saw no route-level lazy chunks, because navigating to `/work`, `/about`, `/skills` and `/contact` requested no additional JS files. The bundle contains `lazy` only once — [Playwright network log](https://www.nipun.space/work)
- `prefers-reduced-motion: reduce` appears in 6 media blocks in the CSS — [index CSS](https://www.nipun.space/assets/index-D_smUe9e.css)
- First visit shows a blocking "How to get around" modal over a blurred page; dismissing it stores `localStorage["nipun.tour.v2"]` — [screens/desktop-1440.png](https://www.nipun.space/)

### Inferences
- As an SPA, nothing paints until about 300 KB of JS has downloaded, parsed and run (FCP ≈ DCL in the numbers above). A server-rendered Next.js 16 page sends real HTML first, so FCP could land close to TTFB.
- The obvious wins nipun.space leaves on the table, and which `next/image` plus Next defaults give for free: AVIF/WebP at responsive sizes (each of the 600–800 KB PNGs would likely be well under 100 KB), `priority` on the LCP portrait only, and `Cache-Control: public, max-age=31536000, immutable` on `/_next/static` (Next sets this automatically).
- `next/font` (self-hosted, preloaded, `size-adjust` fallback) avoids the `@import` chain and the Google request. The Portfolio already self-hosts JetBrains Mono, as CLAUDE.md requires for box-drawing glyphs.
- The low CLS despite missing image dimensions is likely because images sit in fixed-size containers (`h-full w-full object-cover`, absolute layers) inside a viewport-locked shell. The fixed-viewport shell also limits layout shift by design.
- Loading GA4 `gtag.js` (184 KB) is the largest single script after the app bundle. Vercel Analytics, or loading gtag after interaction, would be lighter.

### Gaps
- I did not run real Lighthouse or PageSpeed Insights (no CLI available, and I did not query the PSI API), so there are no throttled mobile scores, TBT or INP. The numbers above come from unthrottled headless Chrome from a US-East (iad1) edge.
- I did not record transfer sizes for each route's full image set on /work (the images are lazy, so the total depends on how far the user scrolls).

## SEO/meta: OG images, titles, favicon, structured data

### Takeaway
The static shell carries thorough SEO: title, description, canonical, robots with `max-image-preview:large`, full OG and Twitter card tags with a 1200x630 `og.png`, and SVG/PNG/apple-touch icons. It also has two JSON-LD blocks (Person and WebSite), a sitemap of 26 URLs, and a robots.txt that explicitly allows AI crawlers. The weak point is that per-route meta exists only after JS runs; the raw HTML of every route carries the home page's meta.

### Cited Findings
- `<title>Nipun Sujesh — AI Engineer · Terminal Portfolio</title>`, a meta description, `author`, `robots: index, follow, max-image-preview:large`, and `canonical https://www.nipun.space/` — [nipun.space HTML](https://www.nipun.space/)
- OG: `og:type website`, `og:url`, `og:title`, `og:description`, `og:image https://www.nipun.space/og.png` (1200x630, with `og:image:alt`), `og:site_name`. Twitter: `summary_large_image` with title, description, image and alt. `og.png` is a 204 KB PNG — [nipun.space HTML](https://www.nipun.space/); [og.png](https://www.nipun.space/og.png)
- Icons: `/favicon.svg` (3.3 KB SVG), `/favicon-32.png`, and `/apple-touch-icon.png` at 180x180. `theme-color #050505`, `mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style black-translucent`, and `apple-mobile-web-app-title nipun.os`. There is no web manifest: `/manifest.json` and `/site.webmanifest` return the SPA HTML — [nipun.space HTML](https://www.nipun.space/)
- JSON-LD: a `Person` (name, alternateName, jobTitle, worksFor, alumniOf, `hasCredential` ×3, `knowsAbout`, `sameAs` LinkedIn/GitHub, email, homeLocation) and a `WebSite` linked by `@id` — [nipun.space HTML](https://www.nipun.space/)
- `robots.txt` allows `*` plus GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended and Bingbot, and points to the sitemap. `sitemap.xml` lists 26 URLs (10 sections, 11 `/work/{slug}`, 5 `/writing/{slug}`) with `lastmod 2026-10-18` and priorities — [robots.txt](https://www.nipun.space/robots.txt); [sitemap.xml](https://www.nipun.space/sitemap.xml)
- Client-side, each route sets its own title, description and canonical (for example `/work` gets "Projects — Nipun Sujesh" with canonical `https://www.nipun.space/work`). But `curl /work` returns the same HTML as `/`, with the home title and canonical `https://www.nipun.space/` — [nipun.space/work](https://www.nipun.space/work)

### Inferences
- Non-JS crawlers and link-preview bots (Slack, LinkedIn, X) will see the home page's title, canonical and OG image for every deep link, such as a `/work/serenity` share. Google renders JS and probably sees the right titles, but the static canonical pointing to `/` on every route is a real risk. Next.js 16's `generateMetadata`, plus per-route `opengraph-image.tsx`, solves both and is already in the Portfolio's Phase 6 plan.
- Things worth copying: the Person/WebSite JSON-LD shape, `max-image-preview:large`, the AI-crawler-friendly robots.txt, the SVG favicon plus 180px apple-touch icon, and a sitemap that includes every project slug (Next's `app/sitemap.ts`/`robots.ts`).

### Gaps
- I did not test how Google actually indexes the site (no Search Console access), or whether the client-side per-route canonicals are honoured.
