# nipun.space: measured animation timings and sound map

Measured on 23 October 2026 in Chromium at 1440×900 (headless, with `@playwright/cli`). Script: `live/scripts/anim.js` and `snd.js`. Raw data: `live/data/anim.json`.

**Method.** I triggered each page by a client-side route change from another page, using the `/` palette (or `history.pushState` for detail pages). Then, for 1.6 s, I recorded two things:
- **Browser animations.** I polled `document.getAnimations()` every 100 ms. This catches CSS animations, CSS transitions and Web Animations API (WAAPI) animations, with their duration, delay, easing and animated properties.
- **Script-driven tweens.** A `MutationObserver` recorded every inline `style` change (opacity and transform), with start and end times relative to the route change.

Times are from the moment the route changed, ±16 ms.

## How the motion is built (observed, not inferred)

- **Two drivers per element.** Framer Motion runs each entrance as:
  - a **WAAPI opacity animation** with `cubic-bezier(0.23, 1, 0.32, 1)`;
  - a **frame-by-frame JavaScript transform tween** that writes `style.transform` from `translateY(±6–14px)` (or `translateX(±5–9px)`) to `none`.

  The opacity runs on the compositor. The transform is written about 20–40 times per entrance.
- **One curve.** Every entrance used `cubic-bezier(0.23, 1, 0.32, 1)`. There were no exceptions except a 0.5 s `ease-out` on the /map title block. This confirms the bundle reading.
- **No exit animations.** The old page is gone on the next frame and the new one starts at opacity 0 (confirmed).
- **The page header always drops in from above.** It goes from `translateY(-7…-10px)` with opacity 0 to rest in **500 ms**, starting 60–200 ms after the route change. Body content rises from below (`+6…+14px`).

## Per-route entrance choreography

| Route | Element(s) | Duration | Delays (stagger) | Movement |
|---|---|---|---|---|
| `/` home | header bar / logo SVG / right column / role line / divider / stats grid | 550 ms | 40 / 140 / 300 / 400 / 480 / 520 ms | y +7…+14 px → 0. ＋ The wheel nav items use CSS transitions (opacity 350 ms, transform 450 ms, same curve) on a **3D drum**: each `<li>` sits at `translateZ(-96…-144px) rotateX(±40–60°)` |
| `/work` | header | 500 ms | 0 | y −8 px. The CURRENT card's `spin-bd` rotating border (3.2 s loop) starts at once |
| `/about` | header; SKILLS / CURRENTLY / LET'S CONNECT blocks | 500 ms | 0 / 50 / 150 / 250 ms | opacity. ＋ The ASCII `<pre>` is transformed every frame (`translate(-2.8px,-0.6px) scale(1.014)`, an idle "breathing" drift). The connector paths run `mapdash` (stroke-dashoffset, 4.5 s loop) |
| `/skills` | header; 6 breakdown rows; bars | 500 ms; rows 350 ms | rows 0, 50, 100 … 250 ms | rows x +5…+7 px. Bars go `scaleX` 0.06 → value over about 700 ms, starting 200–240 ms |
| `/services` | header; 3 service panels | 500 ms | panels together at about 115 ms | y +13 px. The 3D theme carousel `ring-spin` runs a 28 s loop |
| `/achievements` | header; stats strip; 4 win cards | 500 ms | cards 70 / 140 / 210 ms (+ start) | y +6…+12 px |
| `/writing` | header; featured post; archive rows | 500 / 550 / 450 ms | featured 50 ms; rows 0, 60 ms … | featured y +12 px; rows x −9 px (from the left) |
| `/writing/<slug>` | header; article | 500 ms | 0 | article y +12 px. The input plays `cmd-pop` (a 950 ms box-shadow pulse) |
| `/work/<slug>` | header; React Flow diagram | 500 ms | 0 | the diagram edges run `dashdraw` (500 ms loop) |
| `/contact` | header; heading; form; channels aside | 500 ms | 0 / 0 / 80 / 160 ms | y ±8…9 px |
| `/opensource` | header; 2 repo cards | 500 ms | 0 / 80 ms | y +10.5 px |
| `/map` | header; 9 module boxes; title block | 450 ms; title 500 ms `ease-out` | modules 100, 150 … 500 ms (50 ms stagger); title 600 ms | y +6…+8 px |

**Totals.** Every page has fully settled by **about 0.6–1.0 s** after a route change. /map is the slowest at about 1.0 s, because of its 9-step stagger.

## Ambient loops (CSS keyframes found in the stylesheet)

`dashdraw, term-blink, term-pulse, term-scan, spin-bd, mapdash, ring-spin, kick-l, kick-r, net-pulse, rainbow-slide, shimmer, aurora-shift-1, aurora-shift-2, marquee-scroll, cmd-pop, scroll-bob`

The ones seen running:
- `term-blink`: caret, 1050 ms (`steps`, shown as linear). A second caret `▌` uses 1000 ms.
- `term-pulse`: status dot or `/` key hint, 1800 ms.
- `scroll-bob`: the "▼" scroll hint, 1500 ms.
- `spin-bd`: the CURRENT card border, 3200 ms.
- `mapdash`: dashed wires on /about, 4500 ms.
- `ring-spin`: the /services carousel, 28 s.
- `dashdraw`: React Flow edges, 500 ms.
- `cmd-pop`: the input glow on arriving at some pages, 950 ms, once.

＋ Two keyframe sets the bundle analysis did not mention, `aurora-shift-1` and `aurora-shift-2`, exist in the CSS, but I did not see them running on any route.

Micro-transitions:
- the `❯` prompt glyph scales over **80 ms `ease-out`** on every keystroke and route change;
- the input border, background and box-shadow change over **200 ms** with Tailwind's default `cubic-bezier(0.4, 0, 0.2, 1)`;
- card hover lifts use **200 ms** transform transitions on the same default curve.

## Sound map (WebAudio oscillators, instrumented)

| Interaction | Sound |
|---|---|
| Pointer enters a /work card, or the back/home buttons | `triangle 900 Hz` tick (one per element entered) |
| Palette open (`/`) and each ↑/↓ | `square 600 Hz` |
| Palette Enter, including an unknown command such as `/zz` | two-note confirm `square 540 → 820 Hz` |
| Skills sector click | `triangle 900` + `square 700 Hz` click |
| Home wheel step (mouse wheel) | `square 600 Hz` |
| Pointer moving over the /about ASCII art | drone: `sine 160 + 240 Hz` |
| Esc, typing in the input, hovering skill rows, hovering or clicking wheel items | none |

There is no mute or sound toggle anywhere.

## Interaction checks that were open after the first audit

- **/about mind map is draggable.** The FULL-STACK node has `cursor: grab`. A pointer drag moved it from (1046, 654) to (906, 729), and it stays where it is dropped (`1440-about-mindmap-dragged.jpg`). It is not React Flow; React Flow is used for the **architecture diagrams inside project READMEs** (`path.react-flow__edge-path`).
- **Home wheel nav ignores the keyboard.** ArrowDown did nothing after clicking the page, with the pointer over the nav, or with the nav focused. Only the mouse wheel and clicks work. The nav is `fixed left-1/2 top-[40%] … hidden lg:block`.
- **There is no "Uni-Verse" hover card on home.** Hovering the link added no DOM nodes and showed no popover. The link is a plain `<a href="https://uni-verse.co.in" target="_blank">`. The hover card described in the bundle notes is either unused or lives elsewhere.
- **Edge auto-scroll on /work.**
  - Headless Chromium rendered at **43 fps**.
  - With the pointer at x = 1435, the outer 1%, the strip scrolled **≈198 px/s**.
  - At x = 1300, just inside the 10% edge band, it scrolled **0 px/s**.
  - Speed therefore rises with depth into the band. At 60 fps the top speed would be about 280 px/s.
