(function () {
  "use strict";

  // Prevent browser from restoring scroll position on refresh
  if (history.scrollRestoration) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // DOM elements
  const typingEl = document.getElementById("typing");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  // Typing animation phrases
  const PHRASES = [
    "developing responsive websites",
    "optimizing code efficiency",
    "building modern web apps",
    "solving complex problems",
    "creating user experiences",
    "learning new frameworks",
    "mastering software engineering",
    "implementing AI solutions",
  ];
  const TYPING_SPEED = 120;
  const DELETING_SPEED = 80;
  const PAUSE_MS = 1800;

  // Pointer tilt + scroll parallax + blur reveal for about-intro-card.
  // A single rAF loop with exponential smoothing (lerp) drives the
  // transform every frame — buttery in every browser, no CSS custom
  // property transitions, no class-state conflicts.
  function initAboutCardMotion() {
    const card = document.querySelector(".about-intro-card");
    if (!card) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // State — targets are updated by events/scroll, current values
    // are lerped toward them every frame for smoothness.
    let inView = false;
    let hovering = false;
    let revealed = false;
    let loopRunning = false;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let smoothTiltX = 0;
    let smoothTiltY = 0;
    let smoothScrollY = 0;
    let smoothScrollRot = 0;

    // ── Blur reveal on first scroll into view ──
    const enterObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;

        if (entry.isIntersecting) {
          if (!revealed) {
            revealed = true;
            card.classList.add("is-entering");
            setTimeout(() => card.classList.remove("is-entering"), 1200);
          }
          startLoop();
        } else {
          // Hover state can leak while the cursor is over a card that
          // scrolls out from under it — clean up when leaving view.
          hovering = false;
          stopLoop();
        }
      },
      { threshold: 0.35 },
    );
    enterObserver.observe(card);

    // ── Pointer tilt targets (only meaningful while in view) ──
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
      const ny = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
      targetTiltX = ny * 14;
      targetTiltY = nx * -14;
      hovering = true;
    });

    card.addEventListener("mouseleave", () => {
      targetTiltX = 0;
      targetTiltY = 0;
      hovering = false;
    });

    // ── Main loop — runs only while the card is near the viewport.
    //    Stops when the card leaves so we never read layout off-screen. ──
    let rafId = null;

    function startLoop() {
      if (reduceMotion || loopRunning) return;
      loopRunning = true;
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      loopRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function tick() {
      if (!loopRunning) return;
      const now = performance.now() / 1000;

      // Scroll parallax: card drifts vertically + rotates slightly
      // based on its distance from the viewport center. Negative when
      // the card is above center, positive when below — a real
      // scroll-linked move, not a static CSS tilt.
      const rect = card.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centerOffset = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      const targetScrollY = centerOffset * 40;
      const targetScrollRot = centerOffset * 3;

      // Hover: lift, scale, and straighten toward level
      const targetLift = hovering ? -14 : 0;
      const targetScale = hovering ? 1.035 : 1;
      const targetBaseRot = -3.5 + (hovering ? 2 : 0);

      // Idle bob — gentle continuous sway while the card is in view
      // and the pointer isn't touching it (prevents it feeling static).
      const bobY =
        inView && !hovering && revealed ? Math.sin(now * 1.1) * 4 : 0;
      const bobRot =
        inView && !hovering && revealed ? Math.sin(now * 1.1 + 0.6) * 0.7 : 0;

      // Exponential smoothing: faster while hovering for responsive
      // tracking, slower for scroll drift so it feels weighty.
      const k = hovering ? 0.16 : 0.07;
      smoothTiltX += (targetTiltX - smoothTiltX) * k;
      smoothTiltY += (targetTiltY - smoothTiltY) * k;
      smoothScrollY += (targetScrollY - smoothScrollY) * 0.05;
      smoothScrollRot += (targetScrollRot - smoothScrollRot) * 0.05;

      // Transform is set directly — compositor-friendly, no conflicts.
      card.style.transform =
        "translate3d(6px, " +
        smoothScrollY.toFixed(2) +
        "px, 0) " +
        "rotate(" +
        (targetBaseRot + smoothScrollRot + bobRot).toFixed(2) +
        "deg) " +
        "rotateX(" +
        smoothTiltX.toFixed(2) +
        "deg) " +
        "rotateY(" +
        smoothTiltY.toFixed(2) +
        "deg) " +
        "translateY(" +
        (targetLift + bobY).toFixed(2) +
        "px) " +
        "scale(" +
        targetScale.toFixed(4) +
        ")";

      rafId = requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      // Static tilted card, no motion — but still visible.
      card.style.transform = "translate3d(6px, 0, 0) rotate(-3.5deg)";
      card.classList.add("is-entering");
      return;
    }

    // Kick off the loop if the card is already in view (e.g. restored
    // scroll position or the about section starts in the viewport).
    if (card.getBoundingClientRect().top < window.innerHeight) {
      startLoop();
    } else {
      // Set the initial transform so the card is properly tilted before
      // it enters — no visible pop when the loop starts.
      card.style.transform = "translate3d(6px, 0, 0) rotate(-3.5deg)";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoadingScreen();
    initLenisSmoothScroll();
    initTypingAnimation();
    initHeroAnimations();
    initHeroToAboutTransition();
    initTextMotion();
    initNavToggle();
    initScrollReveal();
    initHeaderAutoHide();
    initDockHide();
    initProjectsSection();
    initFanCarousel();
    initAboutParallax();
    initAboutWordParallax();
    initTechstackTimeline();
    initAboutCardMotion(); // Added for about-intro-card animations
  });

  // ============================================
  // TECHSTACK TIMELINE — activate steps on scroll
  // Uses IntersectionObserver to mark steps .active
  // as they enter the viewport. On mobile the
  // threshold is relaxed (entries are tall) so they
  // always reveal. Adds a subtle scroll parallax so
  // each entry body drifts at its own rate while
  // scrolling past the viewport center.
  // ============================================
  function initTechstackTimeline() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var steps = document.querySelectorAll(".techstack-left .timeline-entry");
    if (!steps.length) return;

    var isMobile = window.innerWidth <= 767;

    // Activate timeline entries on scroll.
    // Desktop: entries activate as they cross the viewport center.
    // Mobile: entries are tall relative to the viewport, a strict
    // threshold can leave them stuck faint/hidden — relax it so the
    // reveal reliably fires as soon as the entry peeks in.
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      isMobile
        ? { threshold: 0.05, rootMargin: "-5% 0px -15% 0px" }
        : { threshold: 0.4, rootMargin: "-10% 0px -10% 0px" },
    );
    steps.forEach(function (step) {
      observer.observe(step);
    });

    // Animate the timeline fill line based on scroll progress
    var lineFill = document.querySelector(".process-timeline-line-fill");
    var timeline = document.querySelector(".techstack-left .process-timeline");
    if (!lineFill || !timeline) return;

    var ticking = false;

    function updateLineFill() {
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var totalTravel = rect.height;
      // How far the top of the timeline has scrolled past the viewport top
      var scrolled = vh - rect.top;
      // Progress: 0 when timeline enters viewport, 1 when fully scrolled past
      var progress = Math.max(0, Math.min(1, scrolled / totalTravel));
      lineFill.style.height = (progress * 100).toFixed(2) + "%";

      // ── Entry scroll parallax ──
      // Each entry body drifts vertically at its own rate based on
      // distance from the viewport center — layered, alive motion
      // instead of a static list. Transform on the body keeps the
      // badge pinned to the spine (compositor-friendly).
      // Skip when the timeline is far off-screen to avoid layout reads.
      if (rect.bottom > -vh && rect.top < vh * 2) {
        for (var i = 0; i < steps.length; i++) {
          var step = steps[i];
          var sr = step.getBoundingClientRect();
          var centerOffset = (sr.top + sr.height / 2 - vh / 2) / (vh / 2);
          // Larger drift on desktop for a deeper effect; smaller on
          // mobile so text stays readable on narrow screens.
          var drift = centerOffset * (isMobile ? 22 : 34);
          var body = step.querySelector(".timeline-entry-body");
          if (body) {
            body.style.transform = "translateY(" + drift.toFixed(2) + "px)";
          }
        }
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(updateLineFill);
          ticking = true;
        }
      },
      { passive: true },
    );

    // Also listen on Lenis if available
    if (window.__lenis) {
      window.__lenis.on("scroll", function () {
        if (!ticking) {
          requestAnimationFrame(updateLineFill);
          ticking = true;
        }
      });
    }

    // Refresh the mobile flag when the viewport crosses the breakpoint
    window.addEventListener(
      "resize",
      function () {
        isMobile = window.innerWidth <= 767;
      },
      { passive: true },
    );

    updateLineFill();
  }

  // ============================================
  // ABOUT PARALLAX — fixed-bg visibility
  // Shows the dark fixed background while About section
  // is in the viewport. Uses IntersectionObserver (no scroll).
  // ============================================
  function initAboutParallax() {
    var aboutSection = document.getElementById("about");
    var fixedBg = document.querySelector(".about-fixed-bg");
    if (!aboutSection || !fixedBg) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          fixedBg.classList.toggle("visible", entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: "0px" },
    );
    observer.observe(aboutSection);
  }

  // ============================================
  // ABOUT WORD PARALLAX — DEFINE / DESIGN / DELIVER
  // Each stacked word drifts at a different rate as
  // the About section scrolls, so they offset each
  // other horizontally. Uses rAF throttling + transform (GPU).
  // Also adds blur when words are out of focus (not centered).
  // ============================================
  function initAboutWordParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var aboutSection = document.getElementById("about");
    var words = document.querySelectorAll(".about-big-word");
    if (!aboutSection || !words.length) return;

    // Per-word drift multiplier — each word travels its own
    // horizontal distance so the stack fans apart while scrolling.
    var speeds = [-0.18, 0.14, -0.18];

    var ticking = false;
    var isVisible = false;

    // IntersectionObserver: only run parallax when section is in view
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0, rootMargin: "0px" },
    );
    sectionObserver.observe(aboutSection);

    function update() {
      if (!isVisible) {
        ticking = false;
        return;
      }

      var y = window.scrollY || 0;
      var vh = window.innerHeight;
      var sectionRect = aboutSection.getBoundingClientRect();
      var sectionCenter = sectionRect.top + sectionRect.height / 2;
      var viewportCenter = vh / 2;

      // Distance from section center to viewport center (normalized)
      var centerOffset = (sectionCenter - viewportCenter) / vh;
      // 0 when perfectly centered, increases as section moves away
      var focusAmount = Math.abs(centerOffset);
      // Blur: 0px when centered, increases to max 6px when far out of view
      var blurValue = Math.min(6, focusAmount * 8);

      words.forEach(function (word, i) {
        var group = word.parentElement;
        var speed = speeds[i % speeds.length];
        var xOffset = centerOffset * speed * vh * 2;

        // Transform goes on the group so the inner word's hover
        // translateX and text-motion entrance still work.
        group.style.transform = "translateX(" + xOffset.toFixed(2) + "px)";

        // Only apply parallax blur/opacity AFTER the text-motion
        // entrance animation has played, otherwise we'd override
        // the CSS entrance and the words would never appear.
        if (word.classList.contains("text-motion-in")) {
          word.style.filter = "blur(" + blurValue.toFixed(2) + "px)";
          word.style.opacity = Math.max(0.3, 1 - focusAmount * 0.6).toFixed(3);
        }
      });

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );
    update();
  }

  // ============================================
  // EXPERIENCE PROGRESS — scroll-driven --exp-progress
  // Sets a CSS variable 0→1 as the Experience section
  // scrolls into view. Drives the timeline card zoom/parallax
  // and background fade. Uses rAF throttling for performance.
  // ============================================
  function initExperienceProgress() {
    var expSection = document.getElementById("experience");
    if (!expSection) return;

    var ticking = false;
    var sectionTop = 0;

    // Cache section geometry — reading getBoundingClientRect()
    // inside the rAF loop forces a synchronous layout each frame.
    function cacheGeometry() {
      sectionTop = expSection.offsetTop;
    }
    cacheGeometry();
    window.addEventListener("resize", cacheGeometry, { passive: true });

    function updateProgress() {
      var y =
        (window.__lenis && typeof window.__lenis.scroll === "number"
          ? window.__lenis.scroll
          : window.scrollY) || 0;
      var vh = window.innerHeight;
      // rect.top === sectionTop - y (document-space), computed
      // from cached geometry — no layout read in the hot loop.
      var progress = 1 - (sectionTop - y) / (vh * 0.8);
      progress = Math.max(0, Math.min(1, progress));
      var rounded = progress.toFixed(4);
      if (expSection.dataset.expProgress === rounded) {
        ticking = false;
        return;
      }
      expSection.dataset.expProgress = rounded;
      expSection.style.setProperty("--exp-progress", rounded);
      ticking = false;
    }

    // Sync with Lenis exactly like the hero transition so the
    // CSS variables update on the same frame Lenis paints.
    if (window.__lenis) {
      window.__lenis.on("scroll", function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateProgress);
        }
      });
    }

    // Fallback for when Lenis is unavailable
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateProgress);
        }
      },
      { passive: true },
    );
    updateProgress();
  }

  // ============================================
  // LOADING SCREEN
  // Deliberate speed-ramp: the bar crawls early, ramps
  // up through the middle, then settles at 100%. On
  // finish it plays a short celebration (cat pop + bar
  // glow + content zoom) before the curtain lifts away
  // and reveals the hero entrance animations.
  // ============================================
  function initLoadingScreen() {
    var loadingScreen = document.getElementById("loading-screen");
    var loadingNumber = document.getElementById("loading-number");
    var loadingBarFill = document.getElementById("loading-bar-fill");
    if (!loadingScreen) return;

    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    var progress = 0;
    var lastRendered = -1;
    var finished = false;
    // ~4s speed ramp — long enough to read, short enough to hold
    // attention. Uses requestAnimationFrame so every subtle easing
    // step lands on a real paint frame (no stutter).
    var DURATION_MS = reduceMotion ? 900 : 4000;
    var startedAt = performance.now();
    var rafId = null;
    var finishTimer = null;

    // Ease-in-out cubic: starts slow, ramps up through the middle,
    // then eases gently into 100%.
    function speedRamp(t) {
      if (t < 0.5) return 4 * t * t * t;
      return 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function render(p) {
      var rounded = Math.round(p);
      // Monotonic — never re-render a lower value than what was
      // already shown, so the bar can never visually stutter back.
      if (rounded <= lastRendered) return;
      lastRendered = rounded;
      // Clamp the display value so 100 is the absolute cap.
      var shown = Math.min(100, rounded);
      if (loadingNumber) loadingNumber.textContent = shown + "%";
      if (loadingBarFill) loadingBarFill.style.width = shown + "%";
    }

    function finishLoading() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      clearTimeout(finishTimer);

      // Guarantee a clean 100% — jump straight there with no jitter.
      render(101);
      loadingScreen.classList.add("complete");

      if (reduceMotion) {
        // Skip the celebration — hide immediately and reveal the page.
        loadingScreen.classList.add("hidden");
        setTimeout(function () {
          loadingScreen.style.display = "none";
          document.body.classList.add("hero-ready");
        }, 250);
        return;
      }

      // Let the finish animations play (cat pop, bar glow, content zoom),
      // then lift the curtain away while hero entrance starts.
      setTimeout(function () {
        loadingScreen.classList.add("hidden");
        document.body.classList.add("hero-ready");
        setTimeout(function () {
          loadingScreen.style.display = "none";
        }, 900);
      }, 1000);
    }

    function updateProgress(now) {
      if (finished) return;
      var elapsed = now - startedAt;
      var t = Math.min(1, elapsed / DURATION_MS);
      // Smooth eased progress — no random jitter near the end so
      // the bar settles into 100% perfectly instead of oscillating.
      var eased = speedRamp(t) * 100;
      // Tiny organic wobble ONLY in the middle band (20%–85%),
      // never near 0 or 100 where it would look like stuttering.
      if (eased > 20 && eased < 85) {
        eased += Math.sin(elapsed / 90) * 0.6;
      }
      progress = Math.max(progress, Math.min(100, eased));
      render(progress);

      if (t >= 1) {
        finishLoading();
        return;
      }
      rafId = requestAnimationFrame(updateProgress);
    }

    rafId = requestAnimationFrame(updateProgress);

    // Fallback: force-finish shortly after the ramp completes
    finishTimer = setTimeout(function () {
      if (!finished) finishLoading();
    }, DURATION_MS + 2200);
  }

  // ============================================
  // LENIS SMOOTH SCROLL (lightweight)
  // ============================================
  function initLenisSmoothScroll() {
    if (typeof Lenis === "undefined") return;

    // lerp-based smoothing gives the scroll a natural inertial
    // "float" instead of a duration-based snap-glide. 0.09 is a
    // calm, buttery follow — the page trails the wheel gently.
    window.__lenis = new Lenis({
      lerp: 0.09,
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 0.9,
      infinite: false,
    });

    function raf(time) {
      try {
        if (window.__lenis) window.__lenis.raf(time);
      } catch (err) {
        // Never let a one-off raf error kill the loop — if this
        // returns without rescheduling, Lenis freezes permanently
        // and the page stops scrolling. Log and keep going.
        console.error("Lenis error:", err);
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Native scroll event dispatch removed — it caused infinite recursion
    // on Windows/Chromium via Lenis scroll → dispatch → Lenis scroll loop.
  }

  // ============================================
  // HERO → ABOUT TRANSITION
  // As the hero scrolls away, its content drifts upward
  // and softens (scale + fade) while the About section
  // begins to catch. Driven by --hero-progress
  // (0 = top of hero, 1 = About fully in view).
  // Uses Lenis's virtual scroll value (not the native
  // scroll event) so the transition stays perfectly in
  // sync with the smooth scroll — no lag.
  // ============================================
  function initHeroToAboutTransition() {
    var hero = document.getElementById("home");
    var about = document.getElementById("about");
    if (!hero || !about) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var aboutTop = about.offsetTop;
    // Cache geometry — reading offsetTop inside the rAF loop
    // forces a synchronous layout every frame (jank source).
    function cacheGeometry() {
      aboutTop = about.offsetTop;
    }
    window.addEventListener("resize", cacheGeometry, { passive: true });

    var ticking = false;

    function update() {
      var y =
        (window.__lenis && typeof window.__lenis.scroll === "number"
          ? window.__lenis.scroll
          : window.scrollY) || 0;
      var progress = aboutTop > 0 ? Math.max(0, Math.min(1, y / aboutTop)) : 0;
      var rounded = progress.toFixed(4);
      // Skip redundant writes — setting the same CSS var value
      // every frame still triggers style recalc.
      if (hero.dataset.heroProgress === rounded) {
        ticking = false;
        return;
      }
      hero.dataset.heroProgress = rounded;
      hero.style.setProperty("--hero-progress", rounded);
      ticking = false;
    }

    // Listen on Lenis's instance so the update fires on the
    // exact frame Lenis animates — zero perceived lag between
    // the wheel and the hero fade/blur.
    if (window.__lenis) {
      window.__lenis.on("scroll", function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      });
    }

    // Fallback for when Lenis is unavailable
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  // ============================================
  // TEXT MOTION — scroll-driven entrance effects
  // Adds a soft rise + de-blur to text elements as
  // they enter the viewport. Targets hero and About
  // typography with a subtle staggered wave.
  // ============================================
  function initTextMotion() {
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    // About section elements — staggered wave entrance
    var motionEls = document.querySelectorAll(".about-big-word");
    if (!motionEls.length) return;

    var aboutObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, idx) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = Math.min(idx % 5, 4) * 90;
            el.style.transitionDelay = delay + "ms";
            el.classList.add("text-motion-in");
            aboutObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -40px 0px" },
    );
    motionEls.forEach(function (el) {
      el.classList.add("text-motion");
      aboutObserver.observe(el);
    });
  }

  function initTypingAnimation() {
    if (!typingEl) return;

    var aboutTypingEl = document.getElementById("about-typing");

    var phraseIdx = 0,
      charIdx = 0,
      typingForward = true;

    function tickTyping() {
      var cur = PHRASES[phraseIdx];

      if (typingForward) {
        var text = cur.slice(0, charIdx + 1);
        if (typingEl) typingEl.textContent = text;
        if (aboutTypingEl) aboutTypingEl.textContent = text;
        charIdx++;

        if (charIdx === cur.length) {
          typingForward = false;
          setTimeout(tickTyping, PAUSE_MS);
          return;
        }
      } else {
        var text = cur.slice(0, charIdx - 1);
        if (typingEl) typingEl.textContent = text;
        if (aboutTypingEl) aboutTypingEl.textContent = text;
        charIdx--;

        if (charIdx === 0) {
          typingForward = true;
          phraseIdx = (phraseIdx + 1) % PHRASES.length;
        }
      }

      setTimeout(tickTyping, typingForward ? TYPING_SPEED : DELETING_SPEED);
    }

    setTimeout(tickTyping, 800);
  }

  function initHeroAnimations() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // If a loading screen is still covering the page, wait for it
    // to finish — initLoadingScreen() triggers the hero entrance
    // as the curtain lifts so the animations line up with the reveal.
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen && !loadingScreen.classList.contains("hidden")) {
      if (reduceMotion) document.body.classList.add("hero-ready");
      return;
    }

    if (reduceMotion) {
      document.body.classList.add("hero-ready");
      return;
    }

    requestAnimationFrame(() => {
      document.body.classList.add("hero-ready");
    });
  }

  function initNavToggle() {
    if (!toggle || !mobileNav) return;

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      mobileNav.setAttribute("aria-hidden", String(!isOpen));

      if (isOpen) {
        mobileNav.classList.add("open");

        const firstFocusableElement = mobileNav.querySelector("a");
        if (firstFocusableElement) {
          setTimeout(() => firstFocusableElement.focus(), 100);
        }
      } else {
        mobileNav.classList.remove("open");
        toggle.focus();
      }
    }

    function handleResize() {
      if (window.innerWidth >= 992) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setOpen(false);
      }
    });

    document.addEventListener("click", function (e) {
      if (
        toggle.getAttribute("aria-expanded") === "true" &&
        !mobileNav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        setOpen(false);
      }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  // Scroll reveal — lightweight IntersectionObserver
  function initScrollReveal() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.1,
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // ============================================
  // HEADER AUTO-HIDE
  // ============================================
  function initHeaderAutoHide() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastScroll = window.scrollY || 0;
    const hideAfter = 24;
    const showAfter = 90;
    const ignoreDelta = 2;

    function shouldSkipHiding() {
      const navToggle = document.querySelector(".nav-toggle");
      if (navToggle && navToggle.getAttribute("aria-expanded") === "true") {
        return true;
      }
      return false;
    }

    function updateHeader() {
      const current = window.scrollY || 0;

      if (current > 10) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      if (current <= 0) {
        header.classList.remove("header--hidden");
        lastScroll = current;
        return;
      }

      if (shouldSkipHiding()) {
        header.classList.remove("header--hidden");
        lastScroll = current;
        return;
      }

      if (Math.abs(current - lastScroll) <= ignoreDelta) return;

      if (current > lastScroll && current > hideAfter) {
        header.classList.add("header--hidden");
      } else if (
        current < lastScroll &&
        (lastScroll - current > 12 || current < showAfter)
      ) {
        header.classList.remove("header--hidden");
      }

      lastScroll = current;
    }

    window.addEventListener(
      "scroll",
      function () {
        requestAnimationFrame(updateHeader);
      },
      { passive: true },
    );
    updateHeader();
  }

  // ============================================
  // DOCK HIDE ON SCROLL
  // ============================================
  function initDockHide() {
    const dock = document.getElementById("dock-wrapper");
    if (!dock) return;

    let lastY = window.scrollY || 0;
    let isHidden = false;

    window.addEventListener(
      "scroll",
      function () {
        const y = window.scrollY || 0;
        const delta = y - lastY;

        if (delta > 0 && y > 120 && !isHidden) {
          dock.classList.add("dock--hidden");
          isHidden = true;
        } else if (delta < -30 && isHidden) {
          dock.classList.remove("dock--hidden");
          dock.classList.add("dock--pop");
          isHidden = false;
          setTimeout(() => dock.classList.remove("dock--pop"), 600);
        }

        lastY = y;
      },
      { passive: true },
    );
  }

  // ============================================
  // HEADER THEME DETECTOR
  // ============================================
  (function () {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var sections = Array.from(
      document.querySelectorAll("section[data-header-theme]"),
    );
    if (!sections.length) return;

    var geometry = sections.map(function (s) {
      return { el: s, top: 0, height: 0, theme: s.dataset.headerTheme };
    });

    function cacheGeom() {
      geometry.forEach(function (g) {
        g.top = g.el.getBoundingClientRect().top + window.scrollY;
        g.height = g.el.offsetHeight;
      });
    }
    cacheGeom();
    window.addEventListener("resize", cacheGeom, { passive: true });

    var lastTheme = "";

    function detect() {
      var y = window.scrollY || 0;
      var headerH = header.offsetHeight || 60;
      var sampleY = y + headerH / 2;
      var detected = "dark";

      for (var i = 0; i < geometry.length; i++) {
        var g = geometry[i];
        if (sampleY >= g.top && sampleY < g.top + g.height) {
          detected = g.theme;
          break;
        }
      }

      if (detected !== lastTheme) {
        header.classList.toggle("header--light", detected === "light");
        lastTheme = detected;
      }
    }

    window.addEventListener(
      "scroll",
      function () {
        requestAnimationFrame(detect);
      },
      { passive: true },
    );
    detect();
  })();

  // ============================================
  // PROJECTS SECTION — Card rendering & filtering
  // ============================================
  function initProjectsSection() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    var mockups = {
      ppa:
        "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e3a5f"/></linearGradient></defs><rect fill="url(%23g1)" width="800" height="500"/><rect x="40" y="40" width="720" height="50" rx="8" fill="%231e293b" opacity="0.8"/><circle cx="70" cy="65" r="6" fill="%23fbbf24"/><circle cx="90" cy="65" r="6" fill="%2334d399"/><circle cx="110" cy="65" r="6" fill="%23f87171"/><rect x="140" y="55" width="200" height="20" rx="4" fill="%23334155"/><rect x="40" y="110" width="260" height="350" rx="10" fill="%231e293b" opacity="0.6"/><rect x="55" y="125" width="230" height="14" rx="4" fill="%23334155"/><rect x="55" y="150" width="180" height="14" rx="4" fill="%23334155"/><rect x="55" y="180" width="210" height="14" rx="4" fill="%23334155"/><rect x="55" y="220" width="230" height="80" rx="6" fill="%230f172a" opacity="0.5"/><rect x="55" y="315" width="100" height="36" rx="18" fill="%23fbbf24" opacity="0.7"/><rect x="320" y="110" width="440" height="165" rx="10" fill="%231e293b" opacity="0.6"/><rect x="340" y="130" width="120" height="14" rx="4" fill="%23334155"/><rect x="340" y="155" width="100" height="50" rx="6" fill="%23fbbf24" opacity="0.25"/><rect x="460" y="155" width="100" height="50" rx="6" fill="%2334d399" opacity="0.25"/><rect x="320" y="295" width="440" height="165" rx="10" fill="%231e293b" opacity="0.6"/></svg>',
        ),
      dost:
        "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%23065f46"/></linearGradient></defs><rect fill="url(%23g2)" width="800" height="500"/><rect x="40" y="40" width="720" height="50" rx="8" fill="%23064e3b" opacity="0.8"/><circle cx="70" cy="65" r="6" fill="%23fbbf24"/><circle cx="90" cy="65" r="6" fill="%2334d399"/><circle cx="110" cy="65" r="6" fill="%23f87171"/><rect x="40" y="110" width="300" height="350" rx="10" fill="%23064e3b" opacity="0.6"/><rect x="55" y="125" width="160" height="12" rx="3" fill="%23065f46"/><rect x="55" y="148" width="120" height="12" rx="3" fill="%23065f46"/><rect x="55" y="175" width="270" height="60" rx="6" fill="%2310b981" opacity="0.2"/><rect x="360" y="110" width="400" height="165" rx="10" fill="%23064e3b" opacity="0.6"/><rect x="380" y="130" width="140" height="12" rx="3" fill="%23065f46"/><rect x="380" y="155" width="360" height="100" rx="6" fill="%2310b981" opacity="0.12"/></svg>',
        ),
      ibdms:
        "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23312e81"/></linearGradient></defs><rect fill="url(%23g3)" width="800" height="500"/><rect x="40" y="40" width="720" height="50" rx="8" fill="%231e1b4b" opacity="0.8"/><circle cx="70" cy="65" r="6" fill="%23fbbf24"/><circle cx="90" cy="65" r="6" fill="%2334d399"/><circle cx="110" cy="65" r="6" fill="%23f87171"/><rect x="40" y="110" width="220" height="350" rx="10" fill="%231e1b4b" opacity="0.6"/><rect x="55" y="125" width="120" height="12" rx="3" fill="%23312e81"/><rect x="55" y="150" width="190" height="32" rx="6" fill="%23818cf8" opacity="0.18"/><rect x="280" y="110" width="480" height="165" rx="10" fill="%231e1b4b" opacity="0.6"/><rect x="300" y="130" width="160" height="12" rx="3" fill="%23312e81"/><rect x="300" y="155" width="440" height="100" rx="6" fill="%23818cf8" opacity="0.1"/></svg>',
        ),
    };

    var projects = [
      {
        title: "PPA Desk Assistance & Attendance System",
        image: mockups.ppa,
        tags: ["Full-Stack", "Laravel", "React"],
        filter: "real",
        badge: "REAL PROJECT",
      },
      {
        title: "DOST MSME Business Assessment Platform",
        image: mockups.dost,
        tags: ["Full-Stack", "React"],
        filter: "real",
        badge: "REAL PROJECT",
      },
      {
        title: "IBDMS – Barangay Document Management",
        image: mockups.ibdms,
        tags: ["Full-Stack", "Laravel", "TypeScript"],
        filter: "real",
        badge: "CAPSTONE",
      },
    ];

    function renderProjects(filter) {
      var filtered =
        filter === "all"
          ? projects
          : projects.filter(function (p) {
              return p.filter === filter;
            });

      grid.innerHTML = filtered
        .map(function (p, i) {
          return (
            '<div class="fan-card" style="--i:' +
            i +
            '">' +
            '<img src="' +
            p.image +
            '" alt="' +
            p.title +
            '" loading="lazy" />' +
            '<div class="fan-card-overlay">' +
            '<h3 class="fan-card-title">' +
            p.title +
            "</h3>" +
            '<div class="fan-card-tags">' +
            p.tags
              .map(function (t) {
                return "<span>" + t + "</span>";
              })
              .join("") +
            "</div>" +
            (p.badge
              ? '<span class="fan-card-badge">' + p.badge + "</span>"
              : "") +
            "</div>" +
            "</div>"
          );
        })
        .join("");

      // Re-init carousel after render
      initFanCarousel();
    }

    renderProjects("all");

    var filterBtns = document.querySelectorAll(".project-filter-btn");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        renderProjects(btn.dataset.pfilter || "all");
      });
    });
  }

  // ============================================
  // FAN CAROUSEL — Horizontal drag/swipe for project cards
  // ============================================
  function initFanCarousel() {
    var carousel = document.querySelector(".fan-carousel");
    if (!carousel) return;

    var track = carousel.querySelector(".fan-track");
    if (!track) return;

    // Bind drag/swipe listeners once — renderProjects() re-invokes this
    // after every filter re-render; without the guard the same listeners
    // pile up on the track (memory + duplicate event handling).
    if (track.dataset.fanInit === "1") return;
    track.dataset.fanInit = "1";

    var isDragging = false;
    var startX = 0;
    var currentTranslate = 0;
    var prevTranslate = 0;
    var animationID = 0;

    track.addEventListener("mousedown", dragStart);
    track.addEventListener("touchstart", dragStart, { passive: true });
    track.addEventListener("mouseup", dragEnd);
    track.addEventListener("mouseleave", dragEnd);
    track.addEventListener("touchend", dragEnd);

    function dragStart(e) {
      isDragging = true;
      startX = getPositionX(e);
      carousel.classList.add("is-grabbing");
      animationID = requestAnimationFrame(animation);
    }

    function dragEnd() {
      isDragging = false;
      cancelAnimationFrame(animationID);
      carousel.classList.remove("is-grabbing");
      prevTranslate = currentTranslate;
    }

    function animation() {
      if (!isDragging) return;
      setSliderPosition();
      requestAnimationFrame(animation);
    }

    function setSliderPosition() {
      track.style.transform =
        "translateX(calc(-50% + " + currentTranslate + "px))";
    }

    function getPositionX(e) {
      return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    }

    track.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      currentTranslate = prevTranslate + dx;
      setSliderPosition();
    });

    track.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging) return;
        var dx = e.touches[0].clientX - startX;
        currentTranslate = prevTranslate + dx;
        setSliderPosition();
      },
      { passive: true },
    );
  }

  /* ============================================
     TECH STACK — Scroll-Driven Typography Motion
     Splits the heading into individual word spans,
     then uses IntersectionObserver to stagger them
     in with translate + blur + opacity animation.
     ============================================ */
  (function initTechstackMotion() {
    var heading = document.querySelector(".techstack-heading");
    if (!heading) return;

    // Split heading text into word spans
    var words = heading.textContent.trim().split(/\s+/);
    heading.innerHTML = words
      .map(function (word, i) {
        return '<span class="tw" style="--tw-i:' + i + '">' + word + "</span>";
      })
      .join(" ");

    // IntersectionObserver: add .visible when section enters viewport
    var techSection = document.querySelector(".techstack");
    var techstackSub = document.querySelector(".techstack-sub");
    var brandRibbon = document.querySelector(".tech-brand-ribbon");
    if (!techSection) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Heading words
            heading.querySelectorAll(".tw").forEach(function (tw) {
              tw.classList.add("visible");
            });

            // Sub text + brand ribbon
            if (techstackSub) techstackSub.classList.add("visible");
            if (brandRibbon) brandRibbon.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(techSection);
  })();

  /* ============================================
     PROJECTS — Cursor Glow
     A soft radial gradient follows the mouse inside
     the pinned projects area for a premium feel.
     ============================================ */
  (function initCursorGlow() {
    var glow = document.getElementById("cursor-glow");
    var sticky = document.querySelector(".projects-sticky");
    if (!glow || !sticky) return;

    var mx = 0,
      my = 0;
    var gx = 0,
      gy = 0;
    var active = false;
    var rafId = null;

    sticky.addEventListener("mouseenter", function () {
      active = true;
      glow.classList.add("visible");
    });

    sticky.addEventListener("mouseleave", function () {
      active = false;
      glow.classList.remove("visible");
    });

    sticky.addEventListener("mousemove", function (e) {
      var rect = sticky.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    });

    function tick() {
      // smooth lerp
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      glow.style.transform =
        "translate(" + (gx - 170) + "px," + (gy - 170) + "px)";
      rafId = requestAnimationFrame(tick);
    }

    // always run the rAF loop (hidden element has no perf cost)
    tick();
  })();

  /* ============================================
     PROJECTS — 3D Magnetic Tilt on Fan Cards
     Uses per-card rAF loop with lerp smoothing
     to avoid fighting CSS hover transitions (no flutter).
     ============================================ */
  (function initMagneticCards() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    var cards = [];
    var mouseOver = false;
    var globalMX = 0,
      globalMY = 0;
    var rafId = null;

    function getBaseTransform(idx) {
      if (idx === 0) return { tx: 20, ty: 0, rot: 6, scale: 1 };
      if (idx === 1) return { tx: 0, ty: -12, rot: 0, scale: 1.06 };
      if (idx === 2) return { tx: -20, ty: 0, rot: -6, scale: 1 };
      return { tx: 0, ty: 0, rot: 0, scale: 1 };
    }

    function rebuildCards() {
      var els = grid.querySelectorAll(".fan-card");
      cards = [];
      els.forEach(function (card, i) {
        var base = getBaseTransform(i);
        card.style.transform = "";
        card.style.zIndex = "";
        cards.push({
          el: card,
          idx: i,
          base: base,
          smoothRotX: 0,
          smoothRotY: 0,
          smoothScale: base.scale,
          targetRotX: 0,
          targetRotY: 0,
          targetScale: base.scale,
          hovering: false,
        });
      });
    }

    rebuildCards();

    // Watch for filter re-renders
    var mutObs = new MutationObserver(function () {
      rebuildCards();
    });
    mutObs.observe(grid, { childList: true });

    grid.addEventListener("mousemove", function (e) {
      mouseOver = true;
      globalMX = e.clientX;
      globalMY = e.clientY;
      cards.forEach(function (c) {
        var rect = c.el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        c.targetRotY = dx * 14;
        c.targetRotX = -dy * 10;
        c.targetScale = c.base.scale + 0.06;
        c.hovering = true;
      });
    });

    grid.addEventListener("mouseleave", function () {
      mouseOver = false;
      cards.forEach(function (c) {
        c.targetRotX = 0;
        c.targetRotY = 0;
        c.targetScale = c.base.scale;
        c.hovering = false;
      });
    });

    function tick() {
      var needsFrame = false;
      cards.forEach(function (c) {
        var k = c.hovering ? 0.14 : 0.08;
        var dx = c.targetRotX - c.smoothRotX;
        var dy = c.targetRotY - c.smoothRotY;
        var ds = c.targetScale - c.smoothScale;
        // Snap when very close
        if (Math.abs(dx) < 0.05) dx = 0;
        else needsFrame = true;
        if (Math.abs(dy) < 0.05) dy = 0;
        else needsFrame = true;
        if (Math.abs(ds) < 0.001) ds = 0;
        else needsFrame = true;
        c.smoothRotX += dx * k;
        c.smoothRotY += dy * k;
        c.smoothScale += ds * k;
        var b = c.base;
        c.el.style.transform =
          "translate3d(" +
          b.tx +
          "px," +
          b.ty +
          "px,0) " +
          "rotate(" +
          b.rot +
          "deg) " +
          "perspective(700px) " +
          "rotateX(" +
          c.smoothRotX.toFixed(2) +
          "deg) " +
          "rotateY(" +
          c.smoothRotY.toFixed(2) +
          "deg) " +
          "scale(" +
          c.smoothScale.toFixed(4) +
          ")";
        if (c.hovering) {
          c.el.style.zIndex = "10";
          needsFrame = true;
        } else {
          c.el.style.zIndex = "";
        }
      });
      if (needsFrame) rafId = requestAnimationFrame(tick);
      else rafId = null;
    }

    function ensureLoop() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    grid.addEventListener("mousemove", ensureLoop);
    grid.addEventListener("mouseleave", ensureLoop);
  })();
})();
