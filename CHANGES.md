# Portfolio Changes

## Current Architecture

- **Section Reordering**: Body is a CSS grid with inline `order` styles. DOM order is Hero → About → Tech Stack → Projects → Experience → Contact → Footer, reflowed to: Hero (0) → About (1) → Tech Stack (2) → Projects (3) → Experience (4) → Contact (6) → Footer (7).
- **Sticky magic**: `.about-sticky` pins the About content while `.projects-pin-spacer`/`.projects-sticky` pins the Selected Work canvas to the viewport during its scroll room.

## Header Theme Detector

- **Universal detection**: `data-header-theme` attributes mark light-background sections (`#projects`, `#experience`). A rAF-driven detector in `main.js` samples the scroll position at the header's center and toggles `header--light` across all sections.
- **Seamless transitions**: Header background, backdrop-filter, box-shadow, brand color, hamburger and nav colors all interpolate over `600ms cubic-bezier(0.16, 1, 0.3, 1)` with a frosted gradient cross-fade for dark→light transitions.
- **Golden shimmer underline**: The light header retains an animated gold gradient line gliding along the bottom edge.

## Apple 2026 Liquid Glass UI

- **Glass Panels**: Project fan cards and experience timeline cards use `backdrop-filter: blur(25px) saturate(140%)` with translucent `rgba(255,255,255,…)` backgrounds.
- **Glass Borders**: Ultra-thin `1px solid rgba(255,255,255,0.15)` borders with rounded squircle-style corners (28px radii).
- **Bevel Highlights**: Bright top-edge inner borders `inset 0 1px 0 rgba(255,255,255,0.35)` simulate light catching the glass edge, paired with dynamic soft outer shadows.
- **Organic Blobs**: Six slowly-drifting radial-gradient blobs (gold/emerald/blue) sit behind the Projects and Experience panels (`lg-blob--1/2/4` in Projects, `lg-blob--5/6` in Experience). Each floats via `lg-blob-float` keyframes.
- **Page Canvas**: Body uses soft radial gradients + animated `::before`/`::after` layers behind the glass.

## Pinned Scroll Transition (Static → Parallax Zoom)

1. **Projects pin-spacer**: `220vh` (mobile `340vh`) scroll room.
2. **Projects-sticky**: `position: sticky; top: 0; height: 100vh` keeps the Selected Work canvas pinned while scrolling.
3. **Experience overlay**: `margin-top: -100vh; z-index: 5` pulls the Experience section over the pinned projects.
4. **Zoom/Scale Parallax**: Each `.timeline-item` scales from `0.82 → 1.0` and translates up `70px → 0` as `--exp-progress` goes `0 → 1` (independent `scale`/`translate` properties).
5. **Frosted reveal**: `.experience` uses `backdrop-filter: blur(6px) saturate(140%)`; `.experience-bg` (off-white, `--exp-progress` opacity, rounded bottom via clip-path) melts in to reveal the cards.

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

## Accessibility

- Sections carry `data-header-theme` for automatic header color switching.
- `prefers-reduced-motion` disables animations (global `* { animation-duration… }` override, `.reveal`, `.text-motion`, hero intro, hero→about transition, and landing snap).

## Performance

- Scroll-driven values are set with `requestAnimationFrame` throttling where needed.
- CSS uses compositor-friendly transforms and independent `scale`/`translate` properties.
- `background-attachment: fixed` is intentionally removed from `body` to avoid repaint jank on macOS Safari/Chrome.
- No heavy per-frame parallax on the main content; the hero parallax layers and blobs are transform/opacity only.