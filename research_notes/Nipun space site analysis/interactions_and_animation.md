# nipun.space: interactions, animation and "smoothness" techniques

Method note: Playwright could not start in this environment (no Chromium installed), so nothing was observed in a running browser. Everything below comes from static analysis of the production HTML and bundles downloaded on 2026-10-23:

- HTML: https://www.nipun.space/
- App bundle (about 700 KB, minified): https://www.nipun.space/assets/index-Cv9N7JWJ.js
- Animation vendor chunk (about 120 KB): https://www.nipun.space/assets/animations-BwHzEo7y.js
- React and router chunk: https://www.nipun.space/assets/react-core-C29F69zp.js
- CSS (Tailwind v3 output plus custom keyframes): https://www.nipun.space/assets/index-D_smUe9e.css

The values quoted (durations, easings, timers) are literal constants from those files. Minified variable names (for example `Y`, `V`, `I`) are given so you can find them again in the bundle.

## 1. Stack: libraries, smooth scrolling and route transitions

### Takeaway
The site is a Vite + React 19 single-page app using react-router-dom and **Framer Motion 11.18.2**. Nothing else animates it: no GSAP, no Lenis JS, no Locomotive and no View Transitions API. Routes swap instantly, and each page plays its own staggered entrance on mount. The "smooth" feel comes from using one easing curve everywhere and from short (0.3–0.55 s) fade-and-slide entrances, not from smooth scrolling or a route-transition system.

### Cited Findings
- The HTML is an empty `<div id="root">` with a module script `index-*.js` and modulepreloads for `react-core-*.js` and `animations-*.js`, which is Vite's chunk-naming pattern. The page is client-rendered with no SSR markup. — [HTML](https://www.nipun.space/)
- The animation chunk contains the version string `"11.18.2"` and the Framer Motion API names `layoutId`, `whileHover`, `whileTap`, `whileInView`, `staggerChildren`, `stiffness`/`damping` and `useAnimation`. Framer Motion 11.18.2 is the vendor chunk. — [animations chunk](https://www.nipun.space/assets/animations-BwHzEo7y.js)
- "gsap" appears in the app bundle only as a skill-list label and a Simple Icons SVG (`["gsap","GSAP"]`, `gsap:function(e){return fa({attr:{role:"img"...`). GSAP is not loaded as a library. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- The CSS contains Lenis's stock stylesheet (`html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}… [data-lenis-prevent]`). No JS bundle contains `lenis-smooth`, `data-lenis`, `smoothWheel`, `wheelMultiplier` or `lerp:`. — [CSS](https://www.nipun.space/assets/index-D_smUe9e.css), [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- `startViewTransition` does not appear in any bundle. The router chunk has react-router-dom's `useViewTransitionState`, which ships with the library, but the site never calls it. — [react-core chunk](https://www.nipun.space/assets/react-core-C29F69zp.js)
- The root render is `<StrictMode><BrowserRouter><Routes>…</Routes><Qe/><pt/><Ge/><st/></…>`, with routes `/`, `/work`, `/work/:projectId`, `/opensource`, `/writing`, `/writing/:slug`, `/about`, `/skills`, `/services`, `/achievements`, `/contact`, `/map` and a `*` that redirects to `/`. `<Routes>` is not wrapped in `AnimatePresence`, and the bundle has no `mode:"wait"` or `mode:"popLayout"`. Pages therefore get no exit animation, only mount animations. Before rendering, the app rewrites legacy `#/` hash URLs with `history.replaceState`. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Every page uses the same "reduce" pattern: `initial: !reduce && {opacity:0, y:14}`, `animate: {opacity:1, y:0}`, `transition: {duration:.55, delay:d, ease:[.23,1,.32,1]}`, delivered through a helper (`l=e=>({initial:…,animate:…,transition:{duration:.55,delay:e,ease:oe}})`) and spread as `{...l(.04)}`. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- The bundle has no global scroll-to-top-on-navigate. The only resets are local, such as `o.current.scrollTop=0` in a tabbed project viewer. Pages are full-height `h-[100dvh] overflow-hidden` sections with their own inner scroll containers (`overflow-y-auto [&::-webkit-scrollbar]:hidden`). — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- In-page jumps use native `scrollIntoView({behavior:"smooth",block:"start"})` (table-of-contents jumps in `/writing/:slug`, the "SCROLL · SYSTEM TELEMETRY" jump on `/about`, and service-card to contact-form). — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- The Lenis CSS is most likely left over from an earlier version or an unused dependency. Lenis does not appear to run, so the site uses native scrolling (plus native smooth `scrollIntoView`).
- Since every page is a fixed-height `100dvh` app-like screen rather than a long document, the lack of smooth scrolling and page-exit transitions is not noticeable. The mount stagger does the work of a page transition.
- To reproduce this in Next.js 16 with Motion, a `template.tsx`, or a client wrapper keyed on `usePathname()`, can replay the mount animation on each route. No `AnimatePresence` exit is needed to match the site.

### Gaps
- I could not confirm at runtime that `html.lenis` is never applied (no browser available).
- No public GitHub repository was checked, because of the tool budget.

## 2. Inventory of animations (with timings)

### Takeaway
There is one easing curve, `cubic-bezier(0.23, 1, 0.32, 1)` (a strong ease-out, close to "easeOutQuint"), used in about 18 places. Mount fades use 0.3–0.55 s with y-offsets of 4–14 px. Scroll reveals use `whileInView` with `once:true`, a negative viewport margin of 30–70 px, and per-item delays of 0.03–0.15 s. Ambient loops (caret blink, scanline, rotating border, marquee) are pure CSS keyframes.

### Cited Findings

**Global easing**
- About 18 module-level constants are all `[.23,1,.32,1]` (`Y`, `oe`, `ym`, `nt`, `Vm`, `_h`, `Vf`, …), plus the string `at="cubic-bezier(0.23,1,0.32,1)"` for inline CSS transitions. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)
- Tailwind utility transitions use the default `cubic-bezier(.4,0,.2,1)` at `.15s` (9 occurrences), plus single uses of `.2s`, `.3s` and `.7s`. — [CSS](https://www.nipun.space/assets/index-D_smUe9e.css)

**Boot / intro overlay (`re()`)**
- The overlay shows once per browser session: `sessionStorage "nipun.booted"`.
- It prints 5 lines (`[ ok ] kernel 4ms`, `mounting /work /about /uni-verse 37ms`, `neural weights loaded 218ms`, `uplink established 19ms`, `interface ready 11ms`), revealing one line every **230 ms** (`setInterval(…,230)`). Each line enters with `{opacity:0,y:4}→{1,0}` over 0.3 s.
- Each line's "ms" figure counts up from 0 in a `requestAnimationFrame` tween lasting `260 + 0.7*target` ms.
- A progress value goes up by 6 every **48 ms**. When it reaches 100, a "nipun.os ready" line fades in over 0.4 s.
- The overlay auto-dismisses after **2050 ms**. Any `keydown` or `pointerdown` skips it.
- Exit: `exit:{opacity:0, filter:"blur(8px)"}`, `duration:.55`, `ease:[.23,1,.32,1]`, through `AnimatePresence`. The overlay is a `fixed inset-0 z-[100]` black layer with a blinking `_` caret.
- On dismiss it sets `window.__nipunBooted=true` and dispatches a `"nipun:booted"` window event, so later effects (the guided tour) wait for the boot to finish.
- With reduced motion the overlay is dismissed at once.
- Source for all of the above: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**First-visit guided tour (`st()`)**
- Gated by `localStorage "nipun.tour.v2"`. It starts **500 ms after** `nipun:booted`.
- A backdrop (`rgba(0,0,0,.6)` + `backdrop-filter: blur(7px)`) fades in over 0.4 s.
- The card animates `{opacity:0, scale:.94, y:10}→{1,1,0}` over 0.45 s and exits to `{opacity:0, scale:.96}`.
- Inside the card, a scripted fake cursor demo runs on `setTimeout` keyframes: 360, 1150, 1340, 1580, 2180, 2780 and 3380 ms. A pointer moves to an input, "types" `/`, then steps through 4 menu rows. The loop repeats every 4600 ms.
- Escape or a click dismisses it. With reduced motion it renders the final state statically.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Page entrances**
- Home hero items: `{opacity:0,y:14}` → visible, 0.55 s, delays via `l(delay)`.
- Page headers: `{opacity:0,y:-10}`, 0.5 s.
- Article body: `{opacity:0,y:12}`, 0.5 s.
- Featured project button: `{y:14}`, 0.55 s, delay 0.05.
- Skill rows: `{opacity:0,x:8}`, 0.35 s, delay `0.05*i`.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Scroll reveals (`whileInView`)**
- Project list rows: `{opacity:0,x:-10}`, 0.45 s, delay `0.06*i`, `viewport:{once:true, margin:"-40px"}`.
- Process-table rows: `{x:-8}`, 0.4 s, delay `0.03*i`.
- Cards: `{opacity:0,y:12}`, 0.5 s, delay `0.07*i` or `0.08*i`, `margin:"-50px"`.
- Timeline items: `{x:-12}`, 0.5 s, `margin:"-70px"`.
- Log lines: opacity only, 0.4 s, delay `0.15*i`.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Bars and paths drawing in**
- Progress and CPU bars animate `scaleX` from 0 to the value with `transformOrigin:"left"`, over 0.7–0.9 s, with staggered delays `0.1+0.03*i` or `0.05*i`.
- SVG radar/skill paths animate `pathLength:0→1` together with opacity over 1.1 s.
- Radar nodes fade in with delay `0.5+0.02*i`.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Layout animation**
- Only one `layout:true` exists: on service panels in `/services`, combined with `exit:{opacity:0}`.
- Framer `layoutId` is not used anywhere in app code. The 18 hits are all inside the library chunk.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Looping animations: Framer Motion**
- A scroll-hint arrow uses `animate:{y:[0,5,0]}`, `duration:1.7`, `repeat:Infinity`, `ease:"easeInOut"`. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Looping animations: CSS keyframes**
- `term-blink`: caret, 1.05 s `steps(1)`.
- `term-pulse`: status dot, opacity 1 → .4, 1.8 s ease-in-out.
- `term-scan`: a scanline translating Y from -140px to 100vh over 8 s linear.
- `spin-bd` + `.mborder:after`: a rotating border. It animates a registered `@property --bd` angle inside a `conic-gradient`, masked to a 1.5 px ring with `mask-composite: exclude`, over 3.2 s linear.
- `ring-spin`: a 3D `rotateY` carousel, 28 s, paused on hover.
- `marquee-scroll`: `translate(0 → -50%)`, 32 s linear, paused on hover. The track holds duplicated content.
- `cmd-pop`: a 0.95 s box-shadow pulse that highlights the command input.
- `scroll-bob`: 4 px, 1.5 s.
- `shimmer`: background-position sweep.
- `rainbow-slide`: animated gradient text, used for an easter-egg command.
- `kick-l`/`kick-r`/`net-pulse`: a small easter-egg animation.
- Source: [CSS](https://www.nipun.space/assets/index-D_smUe9e.css)

### Inferences
- Using one strong ease-out curve everywhere (fast start, long soft settle) does more for the "polished" feel than any single effect. Motion accepts the same array directly: `ease: [0.23, 1, 0.32, 1]`.
- Small offsets (4–14 px) and short durations keep motion subtle. This fits the repo owner's "nothing eye-catchy" preference.
- Springs (`stiffness`/`damping`) appear only in the library chunk. The app code uses tween + cubic-bezier throughout, so a spring-free setup is enough to reproduce it.

### Gaps
- No runtime timing traces or screenshots (no browser). Hover durations come from class names, not measurement.
- I did not trace every page component, so a few minor per-page animations may be missing from this list.

## 3. Cursor, pointer and hover effects

### Takeaway
There is no custom cursor and there are no magnetic buttons. Pointer interaction has five parts:
- a cursor-following "spotlight" that reveals a fine dot grid, done with CSS mask and custom properties
- a drag-to-scroll, edge-auto-scroll, infinitely looping project carousel
- draggable badges
- a canvas glyph effect that reacts to pointer velocity with sound
- Tailwind `group-hover` reveals on cards

### Cited Findings
**Spotlight (home and other full-screen pages)**
- The section's `onMouseMove` writes `--mx`/`--my` (clientX/clientY in px) directly on a ref'd element with `style.setProperty`, so React does not re-render on mouse move. It is skipped when reduce is set.
- A grid layer uses `mask-image: radial-gradient(170px circle at var(--mx,-200px) var(--my,-200px), #000 0%, rgba(0,0,0,.5) 45%, transparent 68%)`, so a 13 px dot grid shows only around the cursor.
- With reduced motion, one of the background gradient layers is removed.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Project carousel (`oa()`)**
- The item list is tripled (`[...aa,...aa,...aa]`). On mount it scrolls to centre the middle copy of a featured item.
- On scroll it wraps: `scrollLeft<=0 → +=scrollWidth/3` and `>=2*scrollWidth/3 → -=scrollWidth/3`. Scrolling looks endless.
- Vertical wheel input maps to horizontal scroll.
- Pointer-drag scrolling has a 5 px threshold to tell a drag from a click.
- Hovering in the outer 10% of either edge sets a speed from -1 to 1, and a permanent `requestAnimationFrame` loop adds `9*speed` px per frame.
- ArrowLeft/ArrowRight call `scrollBy({left:±320, behavior:"smooth"})`. Enter opens the item.
- `cursor-grab active:cursor-grabbing`; the scrollbar is hidden.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Card hovers**
- Descriptions reveal with `max-h-0 opacity-0 transition-all duration-300 group-hover:max-h-32 group-hover:opacity-100`.
- An "↵ open" hint fades in with `opacity-0 group-hover:opacity-100 duration-300`.
- Borders and colours change with `transition-colors duration-200`.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Draggable badges (achievements)**
- Framer `drag`, `dragMomentum:false`, `whileDrag:{cursor:"grabbing", zIndex:30}`, and a short square-wave blip on drag start. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Interactive canvas (`/about`, `bh()`)**
- `onPointerMove` sets a target position and fade. A rAF loop eases toward the target, and the glyph is transformed with `translate(...) scale(1+.015*energy)`. Above a threshold it gets an RGB-split `text-shadow` glitch.
- Pointer speed (`hypot(movementX,movementY)/28`) drives a WebAudio drone: two detuned sine oscillators at 160 and 240 Hz through a 700 Hz lowpass filter. Pitch is set with `setTargetAtTime`, and the drone is released 170 ms after movement stops.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Home navigation (`Qe()`)**
- On `/`, a vertical nav list cycles its active item on mouse wheel (`wheel` listener with `passive:false`, ignores `|deltaY|<6`, 240 ms debounce) and on ArrowUp/ArrowDown, with a tick sound.
- The active label grows from 16 to 21 px, turns accent-coloured and gains a soft `text-shadow` glow.
- A "scroll · click" hint fades in with `opacity 0.3s cubic-bezier(0.23,1,0.32,1)`.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- Writing pointer coordinates to CSS variables through a ref, instead of React state, is the key performance technique: the mask effect updates without re-rendering. In Next.js, do this in a small client component. `useMotionValue` + `useMotionTemplate` is an equivalent.
- The repo owner rejected dot and line grids as a background, so the spotlight technique is worth borrowing only to reveal their hex-dump text more brightly near the cursor, not the grid itself.

### Gaps
- No observed frame-rate or jank measurements.

## 4. Micro-interactions: sound, haptics, input feedback, copy, toasts

### Takeaway
The distinctive micro-interaction is **synthesised UI sound**: a tiny WebAudio square/triangle blip on hover, click, navigation and drag, rate-limited to one hover blip per 60 ms. The command input adds a 5 ms `navigator.vibrate` per keystroke and a quick scale "pop" on its prompt glyph. The bundle has no clipboard writes and no toast library.

### Cited Findings
**Sound engine**
- A lazily created shared `AudioContext`, resumed if suspended.
- `P(freq, dur, gain, type, delay)` builds an oscillator and a gain node with an exponential attack (5 ms) and decay.
- Presets:
  - `I()` hover tick: 900 Hz triangle, 28 ms, gain .02, throttled to ≥60 ms between calls. It is passed as `onMouseEnter` on cards and rows.
  - `V()` select/nav: 600 Hz square, 50 ms.
  - `z()` and `T()`: two-note confirm and cancel chirps (540→820 Hz and 620→360 Hz).
  - `_()`: a 700 Hz click.
  - `H()`: a low 68 Hz sine thump plus a sawtooth sweep (a bigger event or easter egg).
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Command input**
- On every change: `navigator.vibrate(5)`, and the `❯` prompt glyph is set to `scale(1.3)` with `transition: transform .08s ease-out`, then reset on a timeout.
- The placeholder copy changes by breakpoint (`matchMedia("(max-width: 639px)")`).
- The LucBot chat shows a blinking `▌` caret while the status is "thinking" or "streaming".
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**State persistence**
- Visited routes are tracked in `sessionStorage "nipun.visited"`, so the `/map` view can mark pages already seen. — [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**Negative findings**
- `navigator.clipboard.writeText` appears 0 times. The 4 "clipboard" hits are React's internal `clipboardData` event plumbing.
- No `toast` string appears in any bundle.
- Source: [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

### Inferences
- Audio is the biggest contributor to a "tactile" feel that is not visual. It is cheap (no audio files) and, because of the throttling, does not get annoying.
- Browsers keep an `AudioContext` suspended until a user gesture, so the boot overlay's "press any key" skip also unlocks audio.
- The bundle shows no mute toggle and no gating of sound behind reduced motion. Anyone copying the sound engine should add a mute control.

### Gaps
- I could not confirm whether a mute/sound toggle exists in the UI, because I could not render it.

## 5. prefers-reduced-motion handling

### Takeaway
Reduced motion is handled in two layers. In JS, Framer Motion's `useReducedMotion()` drives a `reduce` flag: `initial` becomes `false` (content renders in its final state), counters jump to their final value, the boot and tour overlays skip to their end state, and pointer effects are disabled. In CSS, a global catch-all sets every animation and transition duration to 0.01 ms, and individual `@media (prefers-reduced-motion: reduce)` blocks turn off each keyframe loop.

### Cited Findings
**JS layer**
- The only `prefers-reduced-motion` string in JS is inside the Framer Motion chunk (the `useReducedMotion` implementation). The app uses its return value as `reduce`/`r`/`n` and passes it as a prop.
- The pattern is `initial: !reduce && {...}`, which yields `initial={false}`.
- When reduce is set:
  - the count-up returns the target immediately
  - the boot overlay calls `m()` (dismiss) at once
  - the tour jumps to its final step
  - the spotlight `onMouseMove` returns early
  - the pointer drone does not run
- Source: [animations chunk](https://www.nipun.space/assets/animations-BwHzEo7y.js), [app bundle](https://www.nipun.space/assets/index-Cv9N7JWJ.js)

**CSS layer**
- Global rule: `@media (prefers-reduced-motion: reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}`.
- Per-effect rules set `animation:none` on `.term-caret`, `.term-pulse`, `.term-scan`, `.mborder:after`, `.kick-l`, `.kick-r`, `.net-pulse`, `.cmd-pop` and `.scroll-bob`.
- Source: [CSS](https://www.nipun.space/assets/index-D_smUe9e.css)
- Focus styles: `button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--color-accent) … }`. — [CSS](https://www.nipun.space/assets/index-D_smUe9e.css)

### Inferences
- In Motion (the successor library), the same approach is `useReducedMotion()` from `motion/react`, or `<MotionConfig reducedMotion="user">` at the root. The `MotionConfig` route covers transforms automatically, but it does not stop custom rAF loops, timers or audio, which still need a manual guard.
- The global CSS catch-all is a cheap safety net. It does not stop JS `requestAnimationFrame` loops (the carousel edge auto-scroll loop has no reduce guard in the code I extracted).

### Gaps
- I could not verify the reduced-motion behaviour by emulating the media query, because no browser was available.
