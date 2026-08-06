/**
 * Portfolio - Main JavaScript (Optimized)
 * Clean, performant — no heavy parallax or pinned scroll.
 */

(function () {
  "use strict";

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

  document.addEventListener("DOMContentLoaded", function () {
    initLoadingScreen();
    initLenisSmoothScroll();
    initLandingSnap();
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
    initExperienceProgress();
  });

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
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(aboutSection);
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

    function updateProgress() {
      var rect = expSection.getBoundingClientRect();
      var vh = window.innerHeight;
      // Start fading in when the top of Experience hits 80% of viewport
      // Complete at 20% of viewport
      var progress = 1 - (rect.top / (vh * 0.8));
      progress = Math.max(0, Math.min(1, progress));
      expSection.style.setProperty("--exp-progress", progress.toFixed(4));
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(updateProgress);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateProgress();
  }

  // ============================================
  // LOADING SCREEN
  // ============================================
  function initLoadingScreen() {
    var loadingScreen = document.getElementById("loading-screen");
    var loadingNumber = document.getElementById("loading-number");
    var loadingBarFill = document.getElementById("loading-bar-fill");
    if (!loadingScreen) return;

    var progress = 0;
    // ~2s total: tick every 40ms for a silky-smooth fill.
    // Uses an ease-out curve so it accelerates early and eases
    // into 100% right around the 2s mark.
    var STEP_MS = 40;
    var DURATION_MS = 2000;
    var startedAt = Date.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function updateProgress() {
      var elapsed = Date.now() - startedAt;
      var t = Math.min(1, elapsed / DURATION_MS);
      var eased = easeOutCubic(t);
      // Small organic jitter (±1.5%) so the bar feels alive, never frozen
      progress = Math.round(eased * 100 + (Math.random() * 1.5 - 0.75));
      progress = Math.max(0, Math.min(100, progress));

      if (loadingNumber) loadingNumber.textContent = progress + "%";
      if (loadingBarFill) loadingBarFill.style.width = progress + "%";

      if (t >= 1) {
        clearInterval(interval);
        // Gentle settle at 100%, then fade out
        setTimeout(function () {
          progress = 100;
          if (loadingNumber) loadingNumber.textContent = "100%";
          if (loadingBarFill) loadingBarFill.style.width = "100%";
          loadingScreen.classList.add("hidden");
          setTimeout(function () {
            loadingScreen.style.display = "none";
          }, 300);
        }, 150);
      }
    }

    var interval = setInterval(updateProgress, STEP_MS);

    // Fallback: force-dismiss shortly after the 2s ramp completes
    setTimeout(function () {
      if (!loadingScreen.classList.contains("hidden")) {
        clearInterval(interval);
        progress = 100;
        if (loadingNumber) loadingNumber.textContent = "100%";
        if (loadingBarFill) loadingBarFill.style.width = "100%";
        loadingScreen.classList.add("hidden");
        setTimeout(function () {
          loadingScreen.style.display = "none";
        }, 300);
      }
    }, 2500);
  }

  // ============================================
  // LENIS SMOOTH SCROLL (lightweight)
  // ============================================
  function initLenisSmoothScroll() {
    if (typeof Lenis === "undefined") return;

    window.__lenis = new Lenis({
      duration: 1.0,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 4);
      },
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
    });

    function raf(time) {
      window.__lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.__lenis.on("scroll", function () {
      window.dispatchEvent(new Event("scroll"));
    });
  }

  // ============================================
  // LANDING → ABOUT SNAP (one-way)
  // Scrolling DOWN from the hero smoothly locks the
  // page onto the top of the About section. Scrolling
  // back UP is completely free — no forced lock pulls
  // the user away while they return to the hero.
  // ============================================
  function initLandingSnap() {
    var about = document.getElementById("about");
    if (!about || !window.__lenis) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var stopTimer = null;
    var animating = false;
    var lastScroll = 0;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    window.__lenis.on("scroll", function () {
      if (animating) return;

      var y = window.scrollY;
      var delta = y - lastScroll;
      lastScroll = y;

      // Only engage while scrolling DOWN, and never re-engage
      // once the user has moved back up past the hero.
      if (delta <= 0) return;

      clearTimeout(stopTimer);
      stopTimer = setTimeout(function () {
        var aboutTop = about.offsetTop;
        var band = 160; // px past About's top we still snap into it

        // Snap only when stopped past the hero threshold but still
        // near About — never force the user back once they're up.
        if (y <= 0 || y > aboutTop + band) return;

        animating = true;
        window.__lenis.scrollTo(aboutTop, {
          duration: 1.1,
          easing: easeOutQuart,
          lock: true,
          onComplete: function () {
            animating = false;
          },
        });
        // Fallback unlock in case onComplete never fires
        setTimeout(function () {
          animating = false;
        }, 1500);
      }, 120);
    });
  }

  // ============================================
  // HERO → ABOUT TRANSITION
  // As the hero scrolls away, its content drifts upward
  // and softens (scale + blur + fade) while the About
  // section begins to catch. Driven by --hero-progress
  // (0 = top of hero, 1 = About fully in view).
  // ============================================
  function initHeroToAboutTransition() {
    var hero = document.getElementById("home");
    var about = document.getElementById("about");
    if (!hero || !about) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var ticking = false;

    function update() {
      var aboutTop = about.offsetTop;
      var y = window.scrollY || 0;
      var progress = Math.max(0, Math.min(1, y / aboutTop));
      hero.style.setProperty("--hero-progress", progress.toFixed(4));
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
      { passive: true }
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
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    var motionEls = document.querySelectorAll(
      ".about-big-word, .about-bio"
    );
    if (!motionEls.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, idx) {
          if (entry.isIntersecting) {
            var el = entry.target;
            // Stagger a gentle wave across siblings
            var delay = Math.min(idx % 5, 4) * 90;
            el.style.transitionDelay = delay + "ms";
            el.classList.add("text-motion-in");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
    );

    motionEls.forEach(function (el) {
      el.classList.add("text-motion");
      observer.observe(el);
    });
  }

  function initTypingAnimation() {
    if (!typingEl) return;

    let phraseIdx = 0,
      charIdx = 0,
      typingForward = true;

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

    setTimeout(tickTyping, 800);
  }

  function initHeroAnimations() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
      "(prefers-reduced-motion: reduce)"
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
      if (
        navToggle &&
        navToggle.getAttribute("aria-expanded") === "true"
      ) {
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
      { passive: true }
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
      { passive: true }
    );
  }

  // ============================================
  // HEADER THEME DETECTOR
  // ============================================
  (function () {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var sections = Array.from(
      document.querySelectorAll("section[data-header-theme]")
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

    window.addEventListener("scroll", function () {
      requestAnimationFrame(detect);
    }, { passive: true });
    detect();
  })();

  // ============================================
  // PROJECTS SECTION — Card rendering & filtering
  // ============================================
  function initProjectsSection() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    var mockups = {
      ppa: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e3a5f"/></linearGradient></defs><rect fill="url(%23g1)" width="800" height="500"/><rect x="40" y="40" width="720" height="50" rx="8" fill="%231e293b" opacity="0.8"/><circle cx="70" cy="65" r="6" fill="%23fbbf24"/><circle cx="90" cy="65" r="6" fill="%2334d399"/><circle cx="110" cy="65" r="6" fill="%23f87171"/><rect x="140" y="55" width="200" height="20" rx="4" fill="%23334155"/><rect x="40" y="110" width="260" height="350" rx="10" fill="%231e293b" opacity="0.6"/><rect x="55" y="125" width="230" height="14" rx="4" fill="%23334155"/><rect x="55" y="150" width="180" height="14" rx="4" fill="%23334155"/><rect x="55" y="180" width="210" height="14" rx="4" fill="%23334155"/><rect x="55" y="220" width="230" height="80" rx="6" fill="%230f172a" opacity="0.5"/><rect x="55" y="315" width="100" height="36" rx="18" fill="%23fbbf24" opacity="0.7"/><rect x="320" y="110" width="440" height="165" rx="10" fill="%231e293b" opacity="0.6"/><rect x="340" y="130" width="120" height="14" rx="4" fill="%23334155"/><rect x="340" y="155" width="100" height="50" rx="6" fill="%23fbbf24" opacity="0.25"/><rect x="460" y="155" width="100" height="50" rx="6" fill="%2334d399" opacity="0.25"/><rect x="320" y="295" width="440" height="165" rx="10" fill="%231e293b" opacity="0.6"/></svg>'),
      dost: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%23065f46"/></linearGradient></defs><rect fill="url(%23g2)" width="800" height="500"/><rect x="40" y="40" width="720" height="50" rx="8" fill="%23064e3b" opacity="0.8"/><circle cx="70" cy="65" r="6" fill="%23fbbf24"/><circle cx="90" cy="65" r="6" fill="%2334d399"/><circle cx="110" cy="65" r="6" fill="%23f87171"/><rect x="40" y="110" width="300" height="350" rx="10" fill="%23064e3b" opacity="0.6"/><rect x="55" y="125" width="160" height="12" rx="3" fill="%23065f46"/><rect x="55" y="148" width="120" height="12" rx="3" fill="%23065f46"/><rect x="55" y="175" width="270" height="60" rx="6" fill="%2310b981" opacity="0.2"/><rect x="360" y="110" width="400" height="165" rx="10" fill="%23064e3b" opacity="0.6"/><rect x="380" y="130" width="140" height="12" rx="3" fill="%23065f46"/><rect x="380" y="155" width="360" height="100" rx="6" fill="%2310b981" opacity="0.12"/></svg>'),
      ibdms: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23312e81"/></linearGradient></defs><rect fill="url(%23g3)" width="800" height="500"/><rect x="40" y="40" width="720" height="50" rx="8" fill="%231e1b4b" opacity="0.8"/><circle cx="70" cy="65" r="6" fill="%23fbbf24"/><circle cx="90" cy="65" r="6" fill="%2334d399"/><circle cx="110" cy="65" r="6" fill="%23f87171"/><rect x="40" y="110" width="220" height="350" rx="10" fill="%231e1b4b" opacity="0.6"/><rect x="55" y="125" width="120" height="12" rx="3" fill="%23312e81"/><rect x="55" y="150" width="190" height="32" rx="6" fill="%23818cf8" opacity="0.18"/><rect x="280" y="110" width="480" height="165" rx="10" fill="%231e1b4b" opacity="0.6"/><rect x="300" y="130" width="160" height="12" rx="3" fill="%23312e81"/><rect x="300" y="155" width="440" height="100" rx="6" fill="%23818cf8" opacity="0.1"/></svg>'),
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
            '<div class="fan-card" style="--i:' + i + '">' +
            '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy" />' +
            '<div class="fan-card-overlay">' +
            '<h3 class="fan-card-title">' + p.title + "</h3>" +
            '<div class="fan-card-tags">' +
            p.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") +
            "</div>" +
            (p.badge ? '<span class="fan-card-badge">' + p.badge + "</span>" : "") +
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
      return e.type.includes("mouse")
        ? e.pageX
        : e.touches[0].clientX;
    }

    track.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      currentTranslate = prevTranslate + dx;
      setSliderPosition();
    });

    track.addEventListener("touchmove", function (e) {
      if (!isDragging) return;
      var dx = e.touches[0].clientX - startX;
      currentTranslate = prevTranslate + dx;
      setSliderPosition();
    }, { passive: true });
  }

  /* ============================================
     TECH STACK — Scroll-Driven Typography Motion
     Splits the heading into individual word spans,
     then uses IntersectionObserver to stagger them
     in with translate + blur + opacity animation.
     ============================================ */
  (function initTechstackMotion() {
    var heading = document.querySelector('.techstack-heading');
    if (!heading) return;

    // Split heading text into word spans
    var words = heading.textContent.trim().split(/\s+/);
    heading.innerHTML = words.map(function (word, i) {
      return '<span class="tw" style="--tw-i:' + i + '">' + word + '</span>';
    }).join(' ');

    // IntersectionObserver: add .visible when section enters viewport
    var techSection = document.querySelector('.techstack');
    if (!techSection) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Heading words
          heading.querySelectorAll('.tw').forEach(function (tw) {
            tw.classList.add('visible');
          });

          // Sub text
          if (document.querySelector('.techstack-sub')) {
            document.querySelector('.techstack-sub').classList.add('visible');
          }

          // Brand ribbon
          if (document.querySelector('.tech-brand-ribbon')) {
            document.querySelector('.tech-brand-ribbon').classList.add('visible');
          }
        }
      });
    }, { threshold: 0.15 });

    observer.observe(techSection);
  })();
})();
