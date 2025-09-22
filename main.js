/**
 * Portfolio - Main JavaScript
 * Handles animations, navigation and interactive elements
 */

// Immediately-invoked Function Expression for encapsulation
(function () {
  "use strict";

  // DOM elements (update selectors here if you rename HTML)
  const typingEl = document.getElementById("typing");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const body = document.body;

  // Typing animation configuration
  // Typing animation config (edit phrases or timing below)
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
  // Timing (ms): typing, deleting, pause after full phrase
  const TYPING_SPEED = 120;
  const DELETING_SPEED = 80;
  const PAUSE_MS = 1800;

  // Initialize on DOM load
  // Init modules on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function () {
    initTypingAnimation();
    initHeroAnimations();
    initNavToggle();
    initSkillsFilter();
    initPortraitEffects();
    initDockInteraction();
  });

  // Typing animation
  function initTypingAnimation() {
    if (!typingEl) return;

    let phraseIdx = 0,
      charIdx = 0,
      typingForward = true;

  // Typing loop
  function tickTyping() {
      const cur = PHRASES[phraseIdx];

      if (typingForward) {
        typingEl.textContent = cur.slice(0, charIdx + 1);
        charIdx++;

        if (charIdx === cur.length) {
          typingForward = false;
          setTimeout(tickTyping, PAUSE_MS);
          return;
        }
      } else {
        typingEl.textContent = cur.slice(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          typingForward = true;
          phraseIdx = (phraseIdx + 1) % PHRASES.length;
        }
      }

      setTimeout(tickTyping, typingForward ? TYPING_SPEED : DELETING_SPEED);
    }

    // Start typing
    setTimeout(tickTyping, 800);
  }

  // Hero animations
  function initHeroAnimations() {
  // Hero animations (respect prefers-reduced-motion)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Just make content visible immediately for users who prefer reduced motion
      document
        .querySelectorAll(".hero-content, .hero-text, .hero-portrait")
        .forEach((el) => {
          if (el) el.classList.add("visible");
        });
      return;
    }

    const heroContent = document.querySelector(".hero-content");
    const heroText = document.querySelector(".hero-text");
    const heroPortrait = document.querySelector(".hero-portrait");

    // Make content visible immediately (as fallback)
    // and then apply transitions for animation effect
    if (heroContent) {
      heroContent.classList.add("visible");
    }

    if (heroText) {
      heroText.classList.add("visible");
    }

    if (heroPortrait) {
      heroPortrait.classList.add("visible");
    }
  }

  // Navigation toggle
  function initNavToggle() {
  // Navigation toggle (update selectors above if renamed)
  if (!toggle || !mobileNav) return;

  // Toggle mobile nav and manage focus
  function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      mobileNav.setAttribute("aria-hidden", String(!isOpen));

      if (isOpen) {
        mobileNav.classList.add("open");
        body.classList.add("nav-open");

        const firstFocusableElement = mobileNav.querySelector("a");
        if (firstFocusableElement) {
          setTimeout(() => firstFocusableElement.focus(), 100);
        }
      } else {
        mobileNav.classList.remove("open");
        body.classList.remove("nav-open");
        toggle.focus();
      }
    }

    // Close mobile nav when window resizes to desktop width
    // Close mobile nav on resize (desktop breakpoint = 992px)
    function handleResize() {
      if (window.innerWidth >= 992) {
        setOpen(false);
      }
    }

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Initial check on page load
    handleResize();

    // Toggle menu
  // Hamburger click handler
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setOpen(false);
      }
    });

    // Close on outside click
  // Close on outside click
    document.addEventListener("click", function (e) {
      if (
        toggle.getAttribute("aria-expanded") === "true" &&
        !mobileNav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        setOpen(false);
      }
    });

    // Close menu on link click
    // Close menu when a link is clicked
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  // Skills filter
  function initSkillsFilter() {
    const cards = Array.from(document.querySelectorAll(".skill-card"));
    const filters = Array.from(document.querySelectorAll(".filter-btn"));

  // Skills filter (edit selectors above if renamed)
  if (!cards.length || !filters.length) return;

  // Apply filter
  function reveal(filter) {
      const shouldShow = (c) =>
        !filter || filter === "all" ? true : c.dataset.category === filter;

      cards.forEach((c) => {
        c.classList.remove("animate");
        shouldShow(c)
          ? c.classList.remove("hidden")
          : c.classList.add("hidden");
      });

      const visible = cards.filter(shouldShow);
      visible.forEach((c, i) =>
        setTimeout(() => c.classList.add("animate"), i * 80)
      );
    }

    // Initialize with all skills visible
    reveal("all");

    // Filter click handlers
    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        reveal(btn.dataset.filter || "all");
      });
    });
  }

  // Portrait hover effects
  function initPortraitEffects() {
    const portraitContainer = document.querySelector(".portrait-container");
  // Portrait tilt effects
  if (!portraitContainer) return;

    const img = portraitContainer.querySelector(".portrait-img");
    if (!img) return;

    const target = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
    const current = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
    const DAMP = 0.08;

    function setTargets(e) {
      const rect = portraitContainer.getBoundingClientRect();
      const clientX =
        e.clientX ||
        (e.touches && e.touches[0] && e.touches[0].clientX) ||
        rect.left + rect.width / 2;
      const clientY =
        e.clientY ||
        (e.touches && e.touches[0] && e.touches[0].clientY) ||
        rect.top + rect.height / 2;

      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      target.rx = y * 6;
      target.ry = -x * 8;
      target.tx = x * 6;
      target.ty = -y * 6;
      target.scale = 1.04;
    }

    function reset() {
      target.rx = 0;
      target.ry = 0;
      target.tx = 0;
      target.ty = 0;
      target.scale = 1;
    }

    portraitContainer.addEventListener("mousemove", setTargets);
    portraitContainer.addEventListener("touchmove", setTargets, {
      passive: true,
    });
    portraitContainer.addEventListener("mouseleave", reset);
    portraitContainer.addEventListener("touchend", reset);

  // Portrait animation loop (tweak DAMP to change snappiness)
  function animate() {
      current.rx += (target.rx - current.rx) * DAMP;
      current.ry += (target.ry - current.ry) * DAMP;
      current.tx += (target.tx - current.tx) * DAMP;
      current.ty += (target.ty - current.ty) * DAMP;
      current.scale += (target.scale - current.scale) * DAMP;

      portraitContainer.style.transform = `translateZ(0) translateY(-5px) rotateX(${current.rx.toFixed(
        2
      )}deg) rotateY(${current.ry.toFixed(2)}deg)`;

      if (img) {
        img.style.transform = `scale(${current.scale.toFixed(
          3
        )}) translate(${current.tx.toFixed(1)}px, ${current.ty.toFixed(1)}px)`;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // Dock interaction
  function initDockInteraction() {
    const dock = document.getElementById("dock");
  // Dock interactions and active-section highlighting
  if (!dock) return;

    // Animate dock icons entrance
    const dockIcons = dock.querySelectorAll(".dock-icon");
    dockIcons.forEach((icon, index) => {
      icon.style.opacity = "0";
      icon.style.transform = "translateY(20px)";

      setTimeout(() => {
        icon.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        icon.style.opacity = "1";
        icon.style.transform = "";
      }, 100 + index * 100);
    });

    // Highlight active section
    const sections = document.querySelectorAll("section[id]");

    function highlightActiveSection() {
      const scrollPos = window.scrollY + 200;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          dockIcons.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + sectionId) {
              link.classList.add("active");
            }
          });
        }
      });
    }

    window.addEventListener("scroll", highlightActiveSection, {
      passive: true,
    });
    highlightActiveSection();
  }
})();

(function () {
  // ----- HEADER AUTO-HIDE CONFIG -----
  // Change the selector if your header uses a different class/id. The script
  // toggles the CSS class `header--hidden` on the header element — update
  // your CSS if you prefer a different class name or animation.
  const header = document.querySelector('.site-header');
  if (!header) return;

  // If you rename the nav toggle button, update this selector to match.
  const navToggle = document.querySelector('.nav-toggle'); // used to detect mobile menu open

  // State variables used to determine scroll direction and debouncing
  let lastScroll = window.scrollY || 0;
  let ticking = false;

  // Tweak these to change behavior:
  // - hideAfter: how many pixels down before the header can hide
  // - ignoreDelta: ignore tiny scrolls (helps avoid flicker on touch)
  const hideAfter = 60; // only start hiding after this many px scrolled down
  const ignoreDelta = 5; // ignore micro scrolls

  // Prevents content jumping when header is fixed by adding top padding equal
  // to the header height. If you prefer not to set padding, remove this and
  // adjust your layout/CSS so the header doesn't overlap content.
  function setBodyPadding() {
    const h = header.offsetHeight || 0;
    document.body.style.paddingTop = h + 'px';
  }

  // Run once on load and whenever the window resizes (header height may change)
  setBodyPadding();
  window.addEventListener('resize', setBodyPadding);

  // Return true when we should keep the header visible (e.g. mobile menu open)
  function shouldSkipHiding() {
    // If mobile nav is expanded, keep header visible. The nav toggle should
    // set aria-expanded="true" when open — if your implementation differs,
    // change this check accordingly.
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      return true;
    }
    return false;
  }

  // Main logic that decides whether to hide or show the header based on
  // scroll direction and thresholds. If you want the header to hide faster,
  // reduce `hideAfter`. To make it less sensitive to direction changes,
  // increase `ignoreDelta`.
  function updateHeaderOnScroll() {
    const current = window.scrollY || 0;

    // Always show at the very top of the page
    if (current <= 0) {
      header.classList.remove('header--hidden');
      lastScroll = current;
      return;
    }

    // If there are conditions to keep the header visible (mobile menu open),
    // respect them
    if (shouldSkipHiding()) {
      header.classList.remove('header--hidden');
      lastScroll = current;
      return;
    }

    // Ignore very small scroll deltas to prevent jitter
    if (Math.abs(current - lastScroll) <= ignoreDelta) {
      return;
    }

    // If scrolling down and we've scrolled further than `hideAfter`, hide it
    if (current > lastScroll && current > hideAfter) {
      header.classList.add('header--hidden');
    } else if (current < lastScroll) {
      // If scrolling up, reveal header
      header.classList.remove('header--hidden');
    }

    lastScroll = current;
  }

  // Use requestAnimationFrame for smoother/performant updates on scroll
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateHeaderOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
