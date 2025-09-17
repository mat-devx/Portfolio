// animation.js - cleaned and deduplicated

// Typing loop
const PHRASES = [
  'processing web requests','optimizing code efficiency','simulating intelligence','debugging human errors',
  'compiling clean structures','executing flawless design','learning new frameworks','training neural patterns',
  'automating repetitive tasks','analyzing complex systems','deploying digital solutions','upgrading self continuously'
];
const typingEl = document.getElementById('typing');
let phraseIdx = 0, charIdx = 0, typingForward = true;
const TYPING_SPEED = 140, DELETING_SPEED = 100, PAUSE_MS = 1500;
function tickTyping(){
  if(!typingEl) return;
  const cur = PHRASES[phraseIdx];
  if(typingForward){
    typingEl.textContent = cur.slice(0, charIdx + 1);
    charIdx++;
    if(charIdx === cur.length){ typingForward = false; setTimeout(tickTyping, PAUSE_MS); return; }
  } else {
    typingEl.textContent = cur.slice(0, charIdx - 1);
    charIdx--;
    if(charIdx === 0){ typingForward = true; phraseIdx = (phraseIdx + 1) % PHRASES.length; }
  }
  setTimeout(tickTyping, typingForward ? TYPING_SPEED : DELETING_SPEED);
}

// Start typing and wire mobile nav toggle
document.addEventListener('DOMContentLoaded', ()=>{
  if(typingEl) tickTyping();
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

// Skills reveal / filters
(function(){
  const cards = Array.from(document.querySelectorAll('.skill-card'));
  const filters = Array.from(document.querySelectorAll('.filter-btn'));
  if(!cards.length || !filters.length) return;
  function reveal(filter){
    const shouldShow = c => (!filter || filter === 'all') ? true : c.dataset.category === filter;
    cards.forEach(c=>{ c.classList.remove('animate'); if(shouldShow(c)) c.classList.remove('hidden'); else c.classList.add('hidden'); });
    const visible = cards.filter(shouldShow);
    visible.forEach((c,i)=> setTimeout(()=> c.classList.add('animate'), i * 80));
  }
  document.addEventListener('DOMContentLoaded', ()=> reveal('all'));
  filters.forEach(btn => btn.addEventListener('click', ()=>{ filters.forEach(b=> b.classList.remove('active')); btn.classList.add('active'); reveal(btn.dataset.filter || 'all'); }));
})();

// Portrait parallax (optional)
(function(){
  const portrait = document.querySelector('.portrait');
  if(!portrait) return;
  const wrap = portrait, img = wrap.querySelector('img');
  const target = { rx:0, ry:0, tx:0, ty:0, scale:1 };
  const current = { rx:0, ry:0, tx:0, ty:0, scale:1 };
  const DAMP = 0.08;
  function setTargets(e){
    const rect = wrap.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || (rect.left + rect.width/2);
    const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || (rect.top + rect.height/2);
    const x = (clientX - rect.left) / rect.width - 0.5, y = (clientY - rect.top) / rect.height - 0.5;
    target.rx = y * 6; target.ry = -x * 8; target.tx = x * 6; target.ty = -y * 6; target.scale = 1.04;
  }
  function reset(){ target.rx = 0; target.ry = 0; target.tx = 0; target.ty = 0; target.scale = 1; }
  wrap.addEventListener('mousemove', setTargets);
  wrap.addEventListener('touchmove', setTargets, { passive: true });
  wrap.addEventListener('mouseleave', reset);
  wrap.addEventListener('touchend', reset);
  function raf(){
    current.rx += (target.rx - current.rx) * DAMP;
    current.ry += (target.ry - current.ry) * DAMP;
    current.tx += (target.tx - current.tx) * DAMP;
    current.ty += (target.ty - current.ty) * DAMP;
    current.scale += (target.scale - current.scale) * DAMP;
    wrap.style.transform = `translateZ(0) rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg)`;
    if(img) img.style.transform = `scale(${current.scale.toFixed(3)}) translate(${current.tx.toFixed(1)}px, ${current.ty.toFixed(1)}px)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

// Dock scroll behavior (always runs)
(function(){
  const dock = document.getElementById('dock');
  const wrapper = document.getElementById('dock-wrapper');
  if(!dock) return;
  let lastY = window.scrollY || window.pageYOffset;
  let ticking = false; let popTimeout = null;
  // ensure initial visible state
  dock.classList.add('is-visible'); if(wrapper) wrapper.classList.add('is-visible'); if(wrapper) wrapper.setAttribute('aria-hidden','false');
  const triggerEntrance = ()=>{ dock.classList.remove('animate'); void dock.offsetWidth; dock.classList.add('animate'); };
  document.addEventListener('DOMContentLoaded', ()=> triggerEntrance());
  function handleScroll(){
    const y = window.scrollY || window.pageYOffset;
    if(y > lastY + 5){
      // scrolling down -> hide
      dock.classList.remove('is-visible'); dock.classList.remove('pop'); dock.classList.add('is-hidden');
      if(wrapper){ wrapper.classList.remove('is-visible'); wrapper.classList.add('is-hidden'); wrapper.setAttribute('aria-hidden','true'); }
    } else if(y < lastY - 5){
      // scrolling up -> show
      dock.classList.remove('is-hidden'); dock.classList.add('is-visible'); dock.classList.add('pop');
      if(wrapper){ wrapper.classList.remove('is-hidden'); wrapper.classList.add('is-visible'); wrapper.setAttribute('aria-hidden','false'); }
      clearTimeout(popTimeout); popTimeout = setTimeout(()=> dock.classList.remove('pop'), 600);
      triggerEntrance();
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', ()=>{ if(!ticking){ window.requestAnimationFrame(handleScroll); ticking = true; } }, { passive: true });
})();


