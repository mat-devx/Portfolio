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
  document.addEventListener("DOMContentLoaded", function () {
    initTypingAnimation();
    initHeroAnimations();
    initNavToggle();
    initHeaderScrollAnimation();
    initSkillsFilter();
    initPortraitEffects();
    initDockInteraction();
    initPortraitScrollAnimation();
    initCustomCursor();
    initProjectsScrollAnimation();
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

  // Navigation toggle functionality
  function initNavToggle() {
    if (!toggle || !mobileNav) return;

    // Handle toggle click
    toggle.addEventListener('click', function() {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggleMobileNav(!isExpanded);
    });

    // Close mobile nav when clicking on nav links
    const navLinks = mobileNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        toggleMobileNav(false);
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
      const isClickInsideNav = toggle.contains(e.target) || mobileNav.contains(e.target);
      if (!isClickInsideNav && mobileNav.classList.contains('open')) {
        toggleMobileNav(false);
      }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
      // Close nav with Escape key
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        toggleMobileNav(false);
        toggle.focus(); // Return focus to toggle button
      }
    });

    // Trap focus within mobile nav when open
    mobileNav.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        const focusableElements = mobileNav.querySelectorAll('a');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    // Toggle mobile navigation function
    function toggleMobileNav(isOpen) {
      toggle.setAttribute('aria-expanded', isOpen);
      mobileNav.classList.toggle('open', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
      body.classList.toggle('nav-open', isOpen);

      // Focus management
      if (isOpen) {
        // Focus first nav link when opening
        const firstLink = mobileNav.querySelector('a');
        if (firstLink) {
          setTimeout(() => firstLink.focus(), 300); // Delay for animation
        }
      }
    }
  }

  // Smooth header hide/show animation on scroll
  function initHeaderScrollAnimation() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let isHeaderHidden = false;
    let scrollTimeout;

    function updateHeader() {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrolledPastThreshold = currentScrollY > 80; // Reduced threshold for more responsive feel
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);

      // Only react to significant scroll movements (prevents jittery behavior)
      if (scrollDelta > 5) {
        if (scrollingDown && scrolledPastThreshold && !isHeaderHidden) {
          // Hide header when scrolling down
          header.classList.add('header--hidden');
          isHeaderHidden = true;
        } else if (!scrollingDown && isHeaderHidden) {
          // Show header when scrolling up
          header.classList.remove('header--hidden');
          isHeaderHidden = false;
        }
      }

      // Show header when near the top
      if (currentScrollY < 50) {
        header.classList.remove('header--hidden');
        isHeaderHidden = false;
      }

      lastScrollY = currentScrollY;
    }

    // Debounced scroll handler for even smoother performance
    function onScroll() {
      clearTimeout(scrollTimeout);
      
      // Immediate update for responsiveness
      if (!isHeaderHidden && window.scrollY > lastScrollY && window.scrollY > 80) {
        requestAnimationFrame(updateHeader);
      } else {
        // Slight delay for showing header to prevent flickering
        scrollTimeout = setTimeout(() => {
          requestAnimationFrame(updateHeader);
        }, 100);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Handle resize events
    window.addEventListener('resize', () => {
      lastScrollY = window.scrollY;
    }, { passive: true });
  }

  // Projects background transition on scroll
  function initProjectsScrollAnimation() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;

    function updateProjectsBackground() {
      const projectsSectionRect = projectsSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the projects section is visible
      const sectionTop = projectsSectionRect.top;
      
      // Simple trigger: when the projects section top is in the upper half of the viewport
      const isInView = sectionTop < windowHeight * 0.5;
      
      if (isInView) {
        projectsSection.classList.add('white-bg');
      } else {
        projectsSection.classList.remove('white-bg');
      }
    }

    // Throttled scroll handler for better performance
    let ticking = false;
    function onProjectsScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProjectsBackground();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onProjectsScroll, { passive: true });
    window.addEventListener('resize', onProjectsScroll, { passive: true });
    
    // Initial check
    updateProjectsBackground();
  }

  // Placeholder functions for other features
  function initSkillsFilter() {
    // Skills filter functionality can be added here
  }

  function initPortraitEffects() {
    // Portrait effects can be added here
  }

  function initDockInteraction() {
    // Dock interaction can be added here
  }

  function initPortraitScrollAnimation() {
    // Portrait scroll animation can be added here
  }

  // Custom cursor with delay effect
  function initCustomCursor() {
    const cursorDot = document.getElementById('cursorDot');
    if (!cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let isMouseMoving = false;
    let mouseTimeout;

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      
      // Show cursor dot when mouse moves
      cursorDot.classList.add('active');
      
      // Check if cursor is over a white background section
      updateCursorColor(e.clientX, e.clientY);
      
      // Clear existing timeout
      clearTimeout(mouseTimeout);
      
      // Hide cursor dot after 2 seconds of no movement
      mouseTimeout = setTimeout(() => {
        isMouseMoving = false;
        cursorDot.classList.remove('active');
      }, 2000);
    });

    // Function to update cursor color based on background
    function updateCursorColor(x, y) {
      // Get the element under the cursor
      const elementUnderCursor = document.elementFromPoint(x, y);
      if (!elementUnderCursor) return;
      
      // Check if the cursor is over the projects section with white background
      const projectsSection = document.getElementById('projects');
      const isOverProjects = projectsSection && (
        elementUnderCursor === projectsSection || 
        projectsSection.contains(elementUnderCursor)
      );
      
      if (isOverProjects && projectsSection.classList.contains('white-bg')) {
        cursorDot.classList.add('dark');
      } else {
        cursorDot.classList.remove('dark');
      }
    }

    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('active');
      isMouseMoving = false;
    });

    // Show cursor when mouse enters window
    document.addEventListener('mouseenter', () => {
      if (isMouseMoving) {
        cursorDot.classList.add('active');
      }
    });

    // Animate cursor dot with delay
    function animateCursor() {
      // Smoothly interpolate cursor position (creates delay effect)
      const ease = 0.03;  
      dotX += (mouseX - dotX) * ease;
      dotY += (mouseY - dotY) * ease;
      
      // Update cursor position
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top = dotY + 'px';
      
      requestAnimationFrame(animateCursor);
    }
    
    // Start animation loop
    animateCursor();
  }

})();  