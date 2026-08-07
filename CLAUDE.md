# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page portfolio site for Mathew Valiente, built from three hand-written files — `index.html`, `style.css` (~4,000 lines), and `main.js` (~1,600 lines). No framework, no build system, no package.json, no tests. All interactivity is vanilla JS; all motion is CSS + scroll-driven CSS custom properties.

Third-party assets are loaded via CDN in `index.html` and must not be duplicated locally:
- Font Awesome 6.4.2 (icons, `fa-` classes)
- Google Fonts: Inter Tight
- Lenis 1.1.18 smooth scroll (`unpkg.com/lenis`), exposed globally as `window.__lenis`

## Running the site

There is no build/lint/test tooling. To develop, serve the directory statically and open it:

```sh
cd "Documents/Web Deveploment/Portfolio"
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from the filesystem mostly works but serves external scripts/fonts over CDN regardless. Changes are visible on refresh — edit HTML/CSS/JS and reload.

## Architecture

### Section ordering (CSS grid, not DOM order)

`body` is `display: grid`. Sections carry inline `style="order: N"` that reflow the DOM order (Hero → About → Tech Stack → Projects → Contact → Footer) into display order Hero(0) → About(1) → Tech Stack(2) → Projects(3) → Contact(6) → Footer(7). Add/remove sections with the same pattern or the layout breaks.

### Pinned scroll sections

The signature effect is scroll "pin" via sticky positioning, not JS scroll hijacking:
- **Projects**: `.projects-pin-spacer` (280vh of scroll room) wraps `.projects-sticky` (`position: sticky; top: 0; height: 100vh`), pinning the Selected Work canvas while the spacer scrolls past.
- **About**: `.about-sticky` pins the About content similarly.
- **Tech Stack**: split layout — left column is the scrolling process/experience timeline, right column is pinned content with the auto-scrolling brand ribbon.

### Scroll-driven effects (the core pattern)

JS writes CSS custom properties as the page scrolls; CSS consumes them. There is no per-frame parallax on layout properties.

- `--hero-progress` (0→1) on `#home` fades/blurs/scales the hero away as About arrives.
- `--exp-progress` (0→1) drives experience card zoom + background reveal.
- Lenis is the source of truth: JS listens on `window.__lenis.on("scroll", …)` (with native scroll as fallback) and updates inside `requestAnimationFrame` throttling. Keep this pattern when adding scroll effects — native scroll events desync from Lenis's smoothed scroll.
- Motion is compositor-friendly only: transforms, opacity, filter blur, no layout reads inside rAF hot loops (geometry is cached on resize).

### Header theming

Sections mark light backgrounds with `data-header-theme="light"` (Projects). A rAF-driven detector in `main.js` samples the scroll position at the header's vertical center and toggles `header--light`, which cross-fades colors over `600ms`. Any new light-background section needs the attribute.

### main.js structure

One IIFE. DOM-ready initializers are listed in the `DOMContentLoaded` handler (`initLoadingScreen`, `initLenisSmoothScroll`, `initTechstackTimeline`, `initProjectsSection`, `initAboutCardMotion`, …), plus a few self-executing blocks for tech-stack heading motion, the particles canvas, cursor glow, and magnetic tilt cards.

Key subsystems:
- **Projects section** (`initProjectsSection`): card data lives in JS (SVG mockups are inline `data:` URIs — not image files). Filter tabs re-render the grid, which re-invokes `initFanCarousel`; the carousel guards against double-binding via `track.dataset.fanInit`.
- **About card** (`initAboutCardMotion`): one rAF loop with lerp smoothing drives tilt/scroll parallax/idle-bob; the loop starts/stops with viewport visibility.
- **Reduced motion**: nearly every init checks `window.matchMedia("(prefers-reduced-motion: reduce)")` and either early-returns or applies static fallbacks. Respect this when adding animations.

## Known gaps (do not "fix" without checking)

- `initExperienceProgress()` in `main.js` targets `#experience`, which no longer exists — the experience timeline now lives inside `#techstack`. The function is dead code (never called) and safely no-ops.
- The contact form (`#contact-form`) has no submit handler or backend; it renders only.
- The settings panel's "Reduce motion" button (`#settings-reduce-motion`) is in the HTML but not wired to JS.

## Working conventions

`.clinerules` (Superpowers Framework) applies to how work is done here:
1. **Brainstorm first**: before writing code, ask 2–3 targeted clarifying questions about scope and propose a structural architecture in a markdown block.
2. **Test-driven**: write the test first, watch it fail, then implement — unless the change is a static-site tweak with no test harness (note this when skipping).
3. **Atomic execution**: break features into a checklist and update progress as you go; never tackle more than one item at a time.

`CHANGES.md` is a hand-maintained log of design decisions (section reordering, pinned-scroll mechanics, header theming). Read it before restructuring — it documents the "why" behind the layout that the CSS inline `order` styles make non-obvious.
