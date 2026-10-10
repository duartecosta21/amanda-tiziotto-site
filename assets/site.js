(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('.motion-toggle');
  let manuallyReduced = false;
  const motionIsReduced = () => reducedMotion.matches || manuallyReduced;
  const motionTargets = [...document.querySelectorAll('.featured-spfc .featured-media button, .about-portrait')];
  let revealObserver;
  function prepareMotion() {
    revealObserver?.disconnect();
    const reduce = motionIsReduced();
    document.documentElement.dataset.motion = reduce ? 'reduce' : 'normal';
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', String(reduce));
      motionToggle.disabled = reducedMotion.matches;
      motionToggle.textContent = reducedMotion.matches ? 'Movimento reduzido pelo sistema' : reduce ? 'Movimento reduzido' : 'Reduzir movimento';
    }
    if (reduce) {
      document.getAnimations?.().forEach(animation => animation.cancel());
      return;
    }
    if (!('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        target.dataset.motionRevealed = 'true';
        target.querySelector('img').animate([
          { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(14px)' },
          { clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)' }
        ], { duration: 720, easing: 'cubic-bezier(.22,1,.36,1)' });
        revealObserver.unobserve(target);
      });
    }, { threshold: 0.12 });
    motionTargets.filter(target => target.dataset.motionRevealed !== 'true').forEach(target => revealObserver.observe(target));
  }
  prepareMotion();
  reducedMotion.addEventListener('change', prepareMotion);
  motionToggle?.addEventListener('click', () => {
    manuallyReduced = !manuallyReduced;
    prepareMotion();
  });
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.navlinks');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));nav.classList.toggle('is-open', open);menu.textContent = open ? 'Fechar' : 'Menu';
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {menu?.setAttribute('aria-expanded','false');nav.classList.remove('is-open');if(menu)menu.textContent='Menu';}));
  function signal(name, detail = {}) {document.dispatchEvent(new CustomEvent('site:interest',{detail:{name,...detail}}));}
  document.querySelectorAll('[data-contact]').forEach(link => link.addEventListener('click', () => signal('contact_link_click',{channel:link.dataset.contact,page:document.body.dataset.page})));
  const previewImage = document.querySelector('[data-preview-image]');
  const previewTitle = document.querySelector('[data-preview-title]');
  const previewCredit = document.querySelector('[data-preview-credit]');
  previewImage?.addEventListener('load', () => {
    if (!motionIsReduced()) previewImage.animate([{opacity:0.45},{opacity:1}], {duration:280,easing:'ease-out'});
  });
  document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    previewImage.src=button.dataset.src;previewImage.alt=button.dataset.alt;previewTitle.textContent=button.dataset.title;previewCredit.textContent=button.dataset.credit;
  }));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let count=0;document.querySelectorAll('.work').forEach(work=>{work.hidden=button.dataset.filter!=='todos'&&work.dataset.category!==button.dataset.filter;if(!work.hidden)count++;});
    const result=document.querySelector('[data-filter-result]');if(result)result.textContent=`${count} trabalhos na seleção.`;
  }));
  const dialog=document.querySelector('.lightbox');let opener;
  document.querySelectorAll('[data-enlarge]').forEach(button=>button.addEventListener('click',()=>{
    opener=button;dialog.querySelector('img').src=button.dataset.src;dialog.querySelector('img').alt=button.dataset.alt;dialog.querySelector('h3').textContent=button.dataset.title;dialog.querySelector('p').textContent=button.dataset.credit;dialog.showModal();
  }));
  dialog?.querySelector('.close').addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog?.addEventListener('close',()=>opener?.focus());
  document.querySelector('.contact-form')?.addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
    const values=new FormData(form);const name=String(values.get('nome')||'').trim();const text=String(values.get('mensagem')||'').trim();
    const subject=String(values.get('servico')||'Projeto de interiores');
    const message=`Olá, Amanda! Meu nome é ${name}. Gostaria de conversar sobre ${subject.toLowerCase()}.${text?'\n\n'+text:''}`;
    signal('whatsapp_message_prepared',{page:document.body.dataset.page});
    window.open(`https://wa.me/5519981767271?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
    const status=document.querySelector('[data-form-status]');if(status)status.textContent='Mensagem preparada. Revise e envie no WhatsApp. Se a janela não abriu, use o botão de contato ao lado.';
  });

  document.querySelectorAll('[data-comparison]').forEach(comparison => {
    const range = comparison.querySelector('.comparison-range');
    const stage = comparison.querySelector('.comparison-stage');
    const update = () => {
      const value = Number(range.value);
      stage.style.setProperty('--split', `${value}%`);
      range.setAttribute('aria-valuetext', `${value}% da simulação anterior e ${100 - value}% do projeto em 3D`);
    };
    range.hidden = false;
    stage.classList.add('is-ready');
    comparison.querySelector('.comparison-instruction').hidden = false;
    range.addEventListener('input', update);
    update();
  });
})();
