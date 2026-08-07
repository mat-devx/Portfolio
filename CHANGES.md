# Portfolio Changes

## Launch Hardening (2026-08-07)

- **Dead CSS removed**: ~430 lines cut from `style.css` — the entire old PROCESS block (`process-*`, `techstack-process`, `process-inline-grid*`), dead `.timeline-card`/`.timeline-header`/`.timeline-org`/`.timeline-date`/`.timeline-list` rules, `.define-hover`, `.hover-*`, and orphaned `.about-portrait-card` rules. Live techstack/experience timeline CSS untouched. Verified: brace-balanced, zero CSS diagnostics, all removed selectors confirmed dead (html:0, js:0).
- **Inline script moved**: the scroll-restoration snippet moved from `index.html` into the top of `main.js` (inside the IIFE). `index.html` now has zero inline `<script>` blocks, so CSP can drop `script-src 'unsafe-inline'`.
- **Cloudflare Pages `_headers`**: full CSP (`default-src 'self'`, scripts only from self + unpkg, styles from self + Google Fonts + cdnjs + `'unsafe-inline'` for the `style="order: N"` attributes, fonts from gstatic + cdnjs, data: for the inline SVG favicon/mockups) plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `COOP`, and HSTS.
- **`robots.txt`**: allow-all for indexing.

## Current Architecture

- **Section Reordering**: Body is a CSS grid with inline `order` styles. DOM order is Hero → About → Tech Stack → Projects → Constructing → Contact → Footer, reflowed to: Hero (0) → About (1) → Tech Stack (2) → Projects (3) → Constructing (4) → Contact (6) → Footer (7).
- **Sticky magic**: `.about-sticky` pins the About content while `.projects-pin-spacer`/`.projects-sticky` pins the Selected Work canvas to the viewport during its scroll room.
- **Experience content** lives in Tech Stack's left-column `process-timeline` (PPA + DOST entries). The standalone section (order 4) was renamed to "Constructing" — it shows work in progress and keeps all `--exp-progress` driven effects (off-white melting background, dark→light theme blending, card zoom parallax).

## Header Theme Detector

- **Universal detection**: `data-header-theme` attributes mark light-background sections (`#projects`, `#experience`). A rAF-driven detector in `main.js` samples the scroll position at the header's center and toggles `header--light` across all sections.
- **Seamless transitions**: Header background, backdrop-filter, box-shadow, brand color, hamburger and nav colors all interpolate over `600ms cubic-bezier(0.16, 1, 0.3, 1)` with a frosted gradient cross-fade for dark→light transitions.
- **Golden shimmer underline**: The light header retains an animated gold gradient line gliding along the bottom edge.

## Apple 2026 Liquid Glass UI

- **Glass Panels**: Project fan cards and experience timeline cards use `backdrop-filter: blur(25px) saturate(140%)` with translucent `rgba(255,255,255,…)` backgrounds.
- **Glass Borders**: Ultra-thin `1px solid rgba(255,255,255,0.15)` borders with rounded squircle-style corners (28px radii).
- **Bevel Highlights**: Bright top-edge inner borders `inset 0 1px 0 rgba(255,255,255,0.35)` simulate light catching the glass edge, paired with dynamic soft outer shadows.
- **Organic Blobs**: Removed 2026-08-07. The drifting radial-gradient blobs (gold/emerald/blue) bled through the light Projects canvas background; the frosted panels now sit on a clean light gradient.
- **Page Canvas**: Body uses soft radial gradients + animated `::before`/`::after` layers behind the glass.

## Pinned Scroll Transition (Static → Parallax Zoom)

1. **Projects pin-spacer**: `160vh` (mobile `260vh`) scroll room.
2. **Projects-sticky**: `position: sticky; top: 0; height: 100vh` keeps the Selected Work canvas pinned while scrolling. The canvas is **static** — no zoom, no drift (scroll-driven motion removed 2026-08-07 per user request). The pin reads as a stable docked frame, and Contact scrolls over it in normal flow.
3. **Contact rises over the canvas**: `.contact` is `position: relative; z-index: 1` with an opaque `var(--bg)` background, so it paints **above** the pinned Projects section (which is `position: relative` with `z-index: auto`). As the pin's last viewport scrolls, the dark Contact section slides up over the light canvas and lands covering the viewport exactly when the pin releases. Footer (z-index 10) still paints above Contact. Pure smooth scrolling — no parallax/stagger.
4. **Footer**: renders in normal flow after Contact (no overlap/reveal).

## Scroll-Driven Effects

- **Hero → About motion**: `--hero-progress` drives the hero content upward, scales it down slightly, and applies blur + fade as it scrolls away.
- **Tech stack heading**: `initTechstackMotion` in `main.js` splits the heading into `.tw` word spans and staggers them in with translate/blur/opacity via IntersectionObserver.
- **Brand ticker**: Auto-scrolling `tech-brand-track` ribbon with a duplicated item set for a seamless `translateX(-50%)` loop.
- **Scroll reveal**: `.reveal` elements blur-to-sharp pop in with staggered delays (`--reveal-delay` set by JS).
- **Text motion**: `.about-big-word` and `.about-bio` get a soft rise + de-blur entrance via `.text-motion` / `.text-motion-in`.

## Projects Section

- **Design**: White-themed section matching the Liquid Glass screenshot.
- **Features**: Filter tabs (All, Real Project, Exploration), "View full portfolio" link, and a fan carousel rendered by `main.js` (`initProjectsSection`).
- **Layout**: `fan-track` horizontal spread with rotated side cards; drag/swipe via `initFanCarousel`.
- **Mobile**: Horizontal snap-scrolling inside the pinned canvas (`76vw` cards, `340vh` spacer).
- **Particles removed**: The floating green/gold ambient particle canvas (`#projects-particles`, `initParticles()` IIFE) was removed per user preference (2026-08-07). Cursor glow (`#cursor-glow`) retained.

## Footer (simplified — 2026-08-07)

The earlier rise-over-canvas reveal (tall scroll-room box, sticky dock, `--footer-progress`) read as accidental and was removed. The footer now renders in normal CSS grid flow after Contact, with `margin-bottom: var(--dock-height)` for dock clearance. No JS-driven motion, no negative margins, no mobile/reduced-motion overrides needed.

## Accessibility

- Sections carry `data-header-theme` for automatic header color switching.
- `prefers-reduced-motion` disables animations (global `* { animation-duration… }` override, `.reveal`, `.text-motion`, hero intro, and hero→about transition). Section snap (`initSectionSnap`) was removed 2026-08-07 — no landing magnet, pure free scroll.

## Performance

- Scroll-driven values are set with `requestAnimationFrame` throttling where needed.
- CSS uses compositor-friendly transforms and independent `scale`/`translate` properties.
- `background-attachment: fixed` is intentionally removed from `body` to avoid repaint jank on macOS Safari/Chrome.
- No heavy per-frame parallax on the main content; the hero parallax layers are transform/opacity only. The organic blobs were removed 2026-08-07 (they bled through the light Projects background).