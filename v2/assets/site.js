(() => {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let manual = false, io;
  const reduced = () => mq.matches || manual;
  function setup() {
    const r = reduced();
    root.dataset.motion = r ? 'reduce' : 'normal';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(r));
      toggle.disabled = mq.matches;
      toggle.textContent = mq.matches ? 'Movimento reduzido pelo sistema' : r ? 'Movimento reduzido' : 'Reduzir movimento';
    }
    io?.disconnect();
    if (r || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => io.observe(el));
  }
  setup();
  mq.addEventListener('change', setup);
  toggle?.addEventListener('click', () => { manual = !manual; setup(); });

  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const dlg = document.querySelector('.lightbox');
  let opener;
  document.querySelectorAll('[data-lb]').forEach(b => b.addEventListener('click', () => {
    opener = b;
    const img = dlg.querySelector('img');
    img.src = b.dataset.src; img.alt = b.dataset.alt;
    dlg.querySelector('p').textContent = b.dataset.cap;
    dlg.showModal();
  }));
  dlg.querySelector('.close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => opener?.focus());
})();
