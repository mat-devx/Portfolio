// Simple typing loop for the green code-like line
const phrases = [
  "processing web requests",
  "optimizing code efficiency",
  "simulating intelligence",
  "debugging human errors",
  "compiling clean structures",
  "executing flawless design",
  "learning new frameworks",
  "training neural patterns",
  "automating repetitive tasks",
  "analyzing complex systems",
  "deploying digital solutions",
  "upgrading self continuously",
];
const el = document.getElementById("typing");
let pi = 0,
  ci = 0,
  forward = true;

// Typing timing controls (increased for a noticeably slower feel)
const TYPING_SPEED = 140; // ms per char when typing forward
const DELETING_SPEED = 100; // ms per char when deleting
const PAUSE_MS = 1500; // pause after a phrase completes

function tick() {
  const cur = phrases[pi];
  if (forward) {
    el.textContent = cur.slice(0, ci + 1);
    ci++;
    if (ci === cur.length) {
    forward = false;
    setTimeout(tick, PAUSE_MS);
      return;
    }
  } else {
    el.textContent = cur.slice(0, ci - 1);
    ci--;
    if (ci === 0) {
      forward = true;
      pi = (pi + 1) % phrases.length;
    }
  }
  setTimeout(tick, forward ? TYPING_SPEED : DELETING_SPEED);
}

document.addEventListener("DOMContentLoaded", () => {
  if (el) tick();
  // mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.mobile-nav');
  if(toggle && mobile){
    toggle.addEventListener('click', ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      const nowHidden = mobile.getAttribute('aria-hidden') === 'true';
      mobile.setAttribute('aria-hidden', String(!nowHidden));
      mobile.style.display = nowHidden ? 'block' : 'none';
    });
  }
});

// portrait parallax / subtle tilt interaction (damped interpolation for a slower, smoother feel)
const portrait = document.querySelector('.portrait');
if (portrait) {
  const wrap = portrait;
  const img = wrap.querySelector('img');
  // target values updated by pointer events
  const target = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
  // current values used by the RAF loop
  const current = { rx: 0, ry: 0, tx: 0, ty: 0, scale: 1 };
  const DAMP = 0.08; // lower -> slower, more floaty

  function setTargetsFromEvent(e) {
    const rect = wrap.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || (rect.left + rect.width/2);
    const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || (rect.top + rect.height/2);
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    // rotated degrees and image translate offsets
    target.rx = y * 6; // rotateX
    target.ry = -x * 8; // rotateY
    target.tx = x * 6; // image translateX px
    target.ty = -y * 6; // image translateY px
    target.scale = 1.04;
  }

  function resetTargets() {
    target.rx = 0; target.ry = 0; target.tx = 0; target.ty = 0; target.scale = 1;
  }

  // pointer handlers only update targets — RAF loop actually applies values (creates the slower feel)
  wrap.addEventListener('mousemove', (e) => setTargetsFromEvent(e));
  wrap.addEventListener('touchmove', (e) => setTargetsFromEvent(e), { passive: true });
  wrap.addEventListener('mouseleave', () => resetTargets());
  wrap.addEventListener('touchend', () => resetTargets());

  // RAF loop
  function rafLoop() {
    // simple linear interpolation toward target
    current.rx += (target.rx - current.rx) * DAMP;
    current.ry += (target.ry - current.ry) * DAMP;
    current.tx += (target.tx - current.tx) * DAMP;
    current.ty += (target.ty - current.ty) * DAMP;
    current.scale += (target.scale - current.scale) * DAMP;

    wrap.style.transform = `translateZ(0) rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg)`;
    if (img) {
      img.style.transform = `scale(${current.scale.toFixed(3)}) translate(${current.tx.toFixed(1)}px, ${current.ty.toFixed(1)}px)`;
    }

    requestAnimationFrame(rafLoop);
  }

    // --- Dock scroll behavior: show/hide and pop animation ---
    (function(){
      const dock = document.getElementById('dock');
      if(!dock) return;

      let lastScrollY = window.scrollY || window.pageYOffset;
      let ticking = false;
      let scrollTimeout = null;

      // set initial visible state
      dock.classList.add('is-visible');
      // add entrance animation class (staggered icons)
      const triggerEntrance = ()=>{
        dock.classList.remove('animate');
        // force reflow to restart animation
        void dock.offsetWidth;
        dock.classList.add('animate');
      };
      // run once on load
      document.addEventListener('DOMContentLoaded', ()=> triggerEntrance());

      function onScroll(){
        const currentY = window.scrollY || window.pageYOffset;
        // hide when scrolling down, show when scrolling up
        if(currentY > lastScrollY + 5){
          dock.classList.remove('is-visible');
          dock.classList.remove('pop');
          dock.classList.add('is-hidden');
        } else if(currentY < lastScrollY - 5){
          dock.classList.remove('is-hidden');
          dock.classList.add('is-visible');
          // add a short "pop" when revealing
          dock.classList.add('pop');
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(()=> dock.classList.remove('pop'), 500);
          // retrigger entrance animation when it becomes visible again
          triggerEntrance();
        }

        lastScrollY = currentY;
        ticking = false;
      }

      window.addEventListener('scroll', ()=>{
        if(!ticking){
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      }, { passive: true });
    })();

  requestAnimationFrame(rafLoop);
}
