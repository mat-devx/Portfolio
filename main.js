/**
 * Portfolio - Main JavaScript
 * Handles animations, navigation and interactive elements
 */

// Immediately-invoked Function Expression for encapsulation
(function() {
  'use strict';
  
  // DOM Elements
  const typingEl = document.getElementById('typing');
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const body = document.body;
  
  // Typing animation configuration
  const PHRASES = [
    'developing responsive websites',
    'optimizing code efficiency',
    'building modern web apps',
    'solving complex problems',
    'creating user experiences',
    'learning new frameworks',
    'mastering software engineering',
    'implementing AI solutions'
  ];
  const TYPING_SPEED = 120;
  const DELETING_SPEED = 80;
  const PAUSE_MS = 1800;
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
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
    
    let phraseIdx = 0, charIdx = 0, typingForward = true;
    
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
    
    // Start typing with delay
    setTimeout(tickTyping, 800);
  }
  
  // Hero animations
  function initHeroAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const heroContent = document.querySelector('.hero-content');
    const heroText = document.querySelector('.hero-text');
    const heroPortrait = document.querySelector('.hero-portrait');
    
    if (heroContent) {
      setTimeout(() => heroContent.classList.add('visible'), 300);
    }
    
    if (heroText) {
      setTimeout(() => heroText.classList.add('visible'), 500);
    }
    
    if (heroPortrait) {
      setTimeout(() => heroPortrait.classList.add('visible'), 700);
    }
  }
  
  // Navigation toggle
  function initNavToggle() {
    if (!toggle || !mobileNav) return;
    
    function setOpen(isOpen) {
      toggle.setAttribute('aria-expanded', String(isOpen));
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      
      if (isOpen) {
        mobileNav.classList.add('open');
        body.classList.add('nav-open');
        
        const firstFocusableElement = mobileNav.querySelector('a');
        if (firstFocusableElement) {
          setTimeout(() => firstFocusableElement.focus(), 100);
        }
      } else {
        mobileNav.classList.remove('open');
        body.classList.remove('nav-open');
        toggle.focus();
      }
    }
    
    // Toggle menu
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });
    
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
      }
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && 
          !mobileNav.contains(e.target) && 
          !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
    
    // Close menu on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });
  }
  
  // Skills filter
  function initSkillsFilter() {
    const cards = Array.from(document.querySelectorAll('.skill-card'));
    const filters = Array.from(document.querySelectorAll('.filter-btn'));
    
    if (!cards.length || !filters.length) return;
    
    function reveal(filter) {
      const shouldShow = c => (!filter || filter === 'all') ? true : c.dataset.category === filter;
      
      cards.forEach(c => {
        c.classList.remove('animate');
        shouldShow(c) ? c.classList.remove('hidden') : c.classList.add('hidden');
      });
      
      const visible = cards.filter(shouldShow);
      visible.forEach((c, i) => setTimeout(() => c.classList.add('animate'), i * 80));
    }
    
    // Initialize with all skills visible
    reveal('all');
    
    // Filter click handlers
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reveal(btn.dataset.filter || 'all');
      });
    });
  }
  
  // Portrait hover effects
  function initPortraitEffects() {
    const portraitContainer = document.querySelector('.portrait-container');
    if (!portraitContainer) return;
    
    const img = portraitContainer.querySelector('.portrait-img');
    if (!img) return;
    
    const target = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
    const current = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
    const DAMP = 0.08;
    
    function setTargets(e) {
      const rect = portraitContainer.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || (rect.left + rect.width / 2);
      const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || (rect.top + rect.height / 2);
      
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
    
    portraitContainer.addEventListener('mousemove', setTargets);
    portraitContainer.addEventListener('touchmove', setTargets, { passive: true });
    portraitContainer.addEventListener('mouseleave', reset);
    portraitContainer.addEventListener('touchend', reset);
    
    function animate() {
      current.rx += (target.rx - current.rx) * DAMP;
      current.ry += (target.ry - current.ry) * DAMP;
      current.tx += (target.tx - current.tx) * DAMP;
      current.ty += (target.ty - current.ty) * DAMP;
      current.scale += (target.scale - current.scale) * DAMP;
      
      portraitContainer.style.transform = 	ranslateZ(0) translateY(-5px) rotateX(-Raw{current.rx.toFixed(2)}deg) rotateY(-Raw{current.ry.toFixed(2)}deg);
      
      if (img) {
        img.style.transform = scale(-Raw{current.scale.toFixed(3)}) translate(-Raw{current.tx.toFixed(1)}px, -Raw{current.ty.toFixed(1)}px);
      }
      
      requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
  }
  
  // Dock interaction
  function initDockInteraction() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    // Animate dock icons entrance
    const dockIcons = dock.querySelectorAll('.dock-icon');
    dockIcons.forEach((icon, index) => {
      icon.style.opacity = '0';
      icon.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        icon.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        icon.style.opacity = '1';
        icon.style.transform = '';
      }, 100 + (index * 100));
    });
    
    // Highlight active section
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveSection() {
      const scrollPos = window.scrollY + 200;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          dockIcons.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    }
    
    window.addEventListener('scroll', highlightActiveSection, { passive: true });
    highlightActiveSection();
  }
})();
