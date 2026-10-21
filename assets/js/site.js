(() => {
  'use strict';
  const DATA = window.PORTFOLIO_DATA || {};
  const $ = (s, scope=document) => scope.querySelector(s);
  const $$ = (s, scope=document) => [...scope.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme persistence
  try {
    const saved = localStorage.getItem('salim-theme');
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (_) {}
  $('#themeToggle')?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('salim-theme', root.dataset.theme); } catch (_) {}
  });

  // Side menu inspired by supplied header/menu project; works desktop + mobile.
  const menu = $('#sideMenu');
  const menuBtn = $('#menuButton');
  const menuClose = $('#menuClose');
  const backdrop = $('#menuBackdrop');
  let lockedY = 0;
  const lockScroll = () => {
    lockedY = window.scrollY;
    body.style.position = 'fixed';
    body.style.top = `-${lockedY}px`;
    body.style.left = '0'; body.style.right = '0'; body.style.width = '100%';
    body.classList.add('menu-open');
  };
  const unlockScroll = () => {
    body.style.position = ''; body.style.top = ''; body.style.left = ''; body.style.right = ''; body.style.width = '';
    body.classList.remove('menu-open');
    window.scrollTo(0, lockedY);
  };
  const setMenu = (open) => {
    if (!menu) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn?.setAttribute('aria-expanded', String(open));
    if (open) {
      lockScroll();
      $$('.side-menu-text', menu).forEach((el, i) => el.style.transitionDelay = `${.10 + i * .055}s`);
    } else unlockScroll();
  };
  menuBtn?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));
  menuClose?.addEventListener('click', () => setMenu(false));
  backdrop?.addEventListener('click', () => setMenu(false));
  $$('.side-menu-link').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.classList.contains('open')) setMenu(false); });

  // Current page menu state
  const current = body.dataset.page || 'home';
  $$(`[data-page-link="${current}"]`).forEach(a => a.classList.add('active'));

  // Header & page scroll progress
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 28);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    }
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Reveal animations
  const reveals = $$('.reveal');
  if (reduceMotion) reveals.forEach(el => el.classList.add('revealed'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
    }), {threshold:.1, rootMargin:'0px 0px -30px 0px'});
    reveals.forEach(el => io.observe(el));
  }

  // Count animation
  function animateNumber(el, target, suffix='') {
    target = Number(target || 0);
    if (reduceMotion) { el.textContent = `${target}${suffix}`; return; }
    const t0 = performance.now(), duration = 1100;
    const step = now => {
      const p = Math.min((now-t0)/duration, 1);
      el.textContent = `${Math.round(target * (1-Math.pow(1-p,3)))}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const startYear = Number(DATA.developerStartYear || 2020);
  const experience = Math.max(0, new Date().getFullYear() - startYear);
  $$('[data-experience-years]').forEach(el => {
    if (el.matches('.stat-value,[data-animate-count]')) animateNumber(el, experience, el.dataset.suffix || '');
    else el.textContent = experience;
  });
  $$('[data-project-count]').forEach(el => {
    const n = Array.isArray(DATA.projects) ? DATA.projects.length : 0;
    if (el.matches('.stat-value,[data-animate-count]')) animateNumber(el, n, el.dataset.suffix || '');
    else el.textContent = n;
  });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Contact injection
  const c = DATA.contact || {};
  $$('[data-location]').forEach(el => el.textContent = c.location || '⚲ Perak, Malaysia');
  $$('[data-phone]').forEach(el => { el.textContent = c.phone || '+601172236602'; if (el.tagName === 'A') el.href = `tel:${(c.phone||'').replace(/\s/g,'')}`; });
  $$('[data-email]').forEach(el => { el.textContent = c.email || ''; if (el.tagName === 'A') el.href = `mailto:${c.email||''}`; });
  $$('[data-github]').forEach(el => { if (c.github) el.href = c.github; });
  $$('[data-literature-instagram]').forEach(el => { if (c.instagramLiterature) el.href = c.instagramLiterature; });

  // Project render + filtering + associated-link bounce on project hover
  const stack = $('#projectStack');
  if (stack && Array.isArray(DATA.projects)) {
    const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    stack.innerHTML = DATA.projects.map((p, i) => `
      <article class="project-row ${i%2?'reverse':''} reveal" data-category="${esc(p.categories.join(' '))}">
        <a class="project-visual" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(p.title)}">
          <div class="project-fallback">${esc(p.title)}</div>
          <img src="${esc(p.image)}" alt="${esc(p.title)} project preview" loading="lazy" />
          <span class="visual-index">${String(i+1).padStart(2,'0')}</span>
        </a>
        <div class="project-panel tilt-card">
          <div class="project-meta"><span>${esc(p.meta?.[0]||'Project')}</span><span>${esc(p.meta?.[1]||'Web')}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <div class="tag-row">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div>
          <a class="text-link project-live-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.linkLabel||'View live project')} <span>↗</span></a>
        </div>
      </article>`).join('');
    stack.querySelectorAll('img').forEach(img => img.addEventListener('error', () => img.style.display='none'));
    requestAnimationFrame(() => stack.querySelectorAll('.reveal').forEach(el => {
      if (reduceMotion) el.classList.add('revealed'); else {
        const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target);} }), {threshold:.08}); io.observe(el);
      }
    }));
    stack.querySelectorAll('.project-row').forEach(row => {
      const link = $('.project-live-link', row);
      row.addEventListener('mouseenter', () => link?.classList.add('bounce-link'));
      row.addEventListener('mouseleave', () => link?.classList.remove('bounce-link'));
      row.addEventListener('focusin', () => link?.classList.add('bounce-link'));
      row.addEventListener('focusout', () => link?.classList.remove('bounce-link'));
    });
    $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      $$('[data-filter]').forEach(b => b.classList.toggle('active', b===btn));
      stack.querySelectorAll('.project-row').forEach(row => {
        row.classList.toggle('project-hidden', !(f==='all' || row.dataset.category.split(' ').includes(f)));
      });
    }));
  }

  // Horizontal core technology rows
  const toolMap = $('#toolMap');
  if (toolMap && DATA.coreTech) {
    toolMap.innerHTML = Object.entries(DATA.coreTech).map(([name, items]) => `
      <div class="tool-row reveal"><span class="skill-label">${name}</span><div class="tool-row-chips">${items.map(i=>`<span>${i}</span>`).join('')}</div></div>`).join('');
    requestAnimationFrame(() => toolMap.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed')));
  }

  // Academic data
  const academic = DATA.academic || {};
  const h = $('#teachingHours');
  if (h) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting){ animateNumber(h, academic.teachingHours || 0); observer.disconnect(); }
    }), {threshold:.5}); observer.observe(h);
  }
  if ($('#teachingNote')) $('#teachingNote').textContent = academic.teachingNote || '';
  if ($('#meterFill')) setTimeout(() => $('#meterFill').classList.add('animate'), 350);
  const courseList = $('#courseList');
  if (courseList && Array.isArray(academic.courses)) {
    courseList.innerHTML = academic.courses.map((course,i)=>`
      <article class="course-item ${course.placeholder?'placeholder':''}">
        <button class="course-toggle" type="button" aria-expanded="false" aria-controls="course-panel-${i}">
          <span class="course-code">${course.code}</span><span class="course-title">${course.title}</span><span class="course-hours">${course.hours||0}h</span><span class="course-plus">+</span>
        </button>
        <div class="course-panel" id="course-panel-${i}"><div class="course-panel-inner"><div><span class="mini-label">Semester</span><p>${course.semester}</p></div><div><span class="mini-label">About</span><p>${course.summary}</p></div></div></div>
      </article>`).join('');
    const real = academic.courses.filter(c=>!c.placeholder).length;
    if ($('#courseCount')) $('#courseCount').textContent = real ? `${real} course${real===1?'':'s'}` : 'Ready for your courses';
    $$('.course-toggle', courseList).forEach(btn => btn.addEventListener('click', () => {
      const item=btn.closest('.course-item'); item.classList.toggle('open'); btn.setAttribute('aria-expanded', item.classList.contains('open'));
    }));
  }
  $$('.inline-expander').forEach(btn => btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.expand);
    const open = btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open)); target?.classList.toggle('open', !open);
    const mark=btn.querySelector('span'); if(mark) mark.textContent=open?'+':'−';
  }));
  if (academic.research) {
    if ($('#researchFocus')) $('#researchFocus').textContent = academic.research.focus;
    if ($('#researchTopic')) $('#researchTopic').textContent = academic.research.topic;
    if ($('#researchDegree')) $('#researchDegree').textContent = academic.research.degree;
    if ($('#publicationList')) $('#publicationList').innerHTML = (academic.research.outputs||[]).map(o=>`<div class="publication"><small>${o.type}</small><strong>${o.title}</strong></div>`).join('');
  }

  // Writing list
  const writing = $('#writingList');
  if (writing && Array.isArray(DATA.writing)) {
    writing.innerHTML = DATA.writing.map((w,i)=>`<article class="writing-item reveal"><span>${String(i+1).padStart(2,'0')}</span><div><p class="eyebrow">${w.kind||'Writing'}</p><h3>${w.title}</h3></div><p>${w.excerpt}</p></article>`).join('');
    requestAnimationFrame(()=>$$('.reveal', writing).forEach(el=>el.classList.add('revealed')));
  }

  // Photography gallery/lightbox: click, arrows, keyboard, swipe
  const grid=$('#galleryGrid'), modal=$('#galleryModal'), modalImg=$('#galleryImage'), cap=$('#galleryCaption');
  let idx=0, touchX=0;
  const show = n => {
    if(!modal || !DATA.photography?.length) return;
    idx=(n+DATA.photography.length)%DATA.photography.length;
    const p=DATA.photography[idx]; modalImg.src=p.src; modalImg.alt=p.alt||'Photography'; cap.textContent=`${String(idx+1).padStart(2,'0')} / ${String(DATA.photography.length).padStart(2,'0')} — ${p.caption||''}`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); body.style.overflow='hidden';
  };
  const close = () => { if(!modal?.classList.contains('open')) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); body.style.overflow=''; };
  if(grid && Array.isArray(DATA.photography)) {
    grid.innerHTML=DATA.photography.map((p,i)=>`<button class="gallery-item reveal" data-gallery-index="${i}" type="button"><img src="${p.src}" alt="${p.alt||'Photography'}" loading="lazy"><span>${p.caption||`Frame ${i+1}`}</span></button>`).join('');
    $$('.gallery-item',grid).forEach(b=>{ b.classList.add('revealed'); b.addEventListener('click',()=>show(+b.dataset.galleryIndex)); });
  }
  $('#galleryPrev')?.addEventListener('click',()=>show(idx-1)); $('#galleryNext')?.addEventListener('click',()=>show(idx+1)); $('#galleryClose')?.addEventListener('click',close);
  modal?.addEventListener('click',e=>{if(e.target===modal)close();});
  modal?.addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
  modal?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)show(idx+(dx<0?1:-1));},{passive:true});
  addEventListener('keydown',e=>{ if(!modal?.classList.contains('open'))return; if(e.key==='ArrowRight')show(idx+1); if(e.key==='ArrowLeft')show(idx-1); if(e.key==='Escape')close(); });

  // Tilt cards + magnetic buttons + cursor glow
  if(!reduceMotion && matchMedia('(pointer:fine)').matches) {
    $$('.tilt-card').forEach(card=>{ card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${y*-3.5}deg) rotateY(${x*4}deg)`;}); card.addEventListener('pointerleave',()=>card.style.transform=''); });
    $$('.magnetic').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.06}px)`;});b.addEventListener('pointerleave',()=>b.style.transform='');});
    const glow=$('#cursorGlow'); addEventListener('pointermove',e=>{if(glow)glow.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`;},{passive:true});
  }
})();
