/* =========================================================
   DJIDONOU SHALOM IMMO — Animations & effets
   ========================================================= */
(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Écran d'ouverture ---------- */
  const pre = qs('#preloader');
  if (pre) {
    const done = () => { pre.classList.add('out'); document.body.classList.add('loaded'); setTimeout(() => pre.remove(), 900); };
    let seen = false; try { seen = sessionStorage.getItem('dsi_pre') === '1'; sessionStorage.setItem('dsi_pre', '1'); } catch (e) {}
    if (seen || reduce) done(); else setTimeout(done, 1700);
  } else document.body.classList.add('loaded');

  /* ---------- Barre de progression ---------- */
  const bar = document.createElement('div'); bar.className = 'scroll-progress'; document.body.appendChild(bar);
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    qsa('[data-parallax]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const k = parseFloat(el.dataset.parallax) || 0.15;
      el.style.transform = `translate3d(0, ${((r.top + r.height / 2) - innerHeight / 2) * -k}px, 0)`;
    });
  };
  if (!reduce) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

  /* ---------- Texte découpé mot par mot ---------- */
  qsa('[data-split]').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            const o = document.createElement('span'); o.className = 'w';
            const inner = document.createElement('span'); inner.textContent = w; inner.style.transitionDelay = (0.15 + i++ * 0.07) + 's';
            o.appendChild(inner); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.hasAttribute('data-rotate')) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- Mot qui change ---------- */
  qsa('[data-rotate]').forEach((el) => {
    const words = el.dataset.rotate.split('|'); let i = 0;
    el.innerHTML = `<span class="rot-in">${words[0]}</span>`;
    if (reduce) return;
    setInterval(() => {
      const cur = qs('.rot-in', el); i = (i + 1) % words.length;
      cur.classList.add('rot-out');
      const nx = document.createElement('span'); nx.className = 'rot-in rot-enter'; nx.textContent = words[i];
      el.appendChild(nx);
      requestAnimationFrame(() => requestAnimationFrame(() => nx.classList.remove('rot-enter')));
      setTimeout(() => cur.remove(), 700);
    }, 2600);
  });

  /* ---------- Diaporama du hero ---------- */
  qsa('.hero-slides').forEach((wrap) => {
    const slides = qsa('.slide', wrap), dots = qsa('.hero-dots button');
    if (slides.length < 2) return;
    let i = 0, t;
    const show = (n) => {
      slides[i].classList.remove('active'); dots[i] && dots[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active'); dots[i] && dots[i].classList.add('active');
      const cap = qs('.hero-caption'); if (cap) { cap.classList.remove('show'); setTimeout(() => { cap.textContent = slides[i].dataset.caption || ''; cap.classList.add('show'); }, 300); }
    };
    const play = () => { clearInterval(t); t = setInterval(() => show(i + 1), 6000); };
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); play(); }));
    if (!reduce) play();
  });

  /* ---------- Carrousels ---------- */
  qsa('[data-carousel]').forEach((root) => {
    const track = qs('.car-track', root);
    const step = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; };
    qs('.car-prev', root)?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    qs('.car-next', root)?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth - 4;
      root.classList.toggle('at-start', track.scrollLeft <= 4); root.classList.toggle('at-end', track.scrollLeft >= max);
      const p = qs('.car-progress i', root); if (p) p.style.width = (max > 0 ? Math.min(100, (track.scrollLeft + track.clientWidth) / track.scrollWidth * 100) : 100) + '%';
    };
    track.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); setTimeout(upd, 300);
    // glisser à la souris
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('drag'); } if (moved) track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { down = false; track.classList.remove('drag'); });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } moved = false; }, true);
    // défilement automatique doux
    if (root.dataset.carousel === 'auto' && !reduce) {
      let pause = false; root.addEventListener('pointerenter', () => (pause = true)); root.addEventListener('pointerleave', () => (pause = false));
      setInterval(() => { if (pause || document.hidden) return; const max = track.scrollWidth - track.clientWidth - 4; track.scrollTo({ left: track.scrollLeft >= max ? 0 : track.scrollLeft + step(), behavior: 'smooth' }); }, 4500);
    }
  });

  /* ---------- Inclinaison 3D, projecteur, boutons magnétiques ---------- */
  if (fine && !reduce) {
    document.addEventListener('pointermove', (e) => {
      const t = e.target.closest('.tilt');
      qsa('.tilt.tilting').forEach((x) => { if (x !== t) { x.classList.remove('tilting'); x.style.transform = ''; } });
      if (t) {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        t.classList.add('tilting');
        t.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
        t.style.setProperty('--gx', (x + 0.5) * 100 + '%'); t.style.setProperty('--gy', (y + 0.5) * 100 + '%');
      }
      const s = e.target.closest('.spot');
      if (s) { const r = s.getBoundingClientRect(); s.style.setProperty('--mx', e.clientX - r.left + 'px'); s.style.setProperty('--my', e.clientY - r.top + 'px'); }
      const m = e.target.closest('.magnetic');
      qsa('.magnetic.mag').forEach((x) => { if (x !== m) { x.classList.remove('mag'); x.style.transform = ''; } });
      if (m) { const r = m.getBoundingClientRect(); m.classList.add('mag'); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`; }
    }, { passive: true });
    document.addEventListener('pointerleave', () => qsa('.tilting,.mag').forEach((x) => { x.style.transform = ''; x.classList.remove('tilting', 'mag'); }));
  }

  /* ---------- Transitions entre pages ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript')) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = url.href; }, reduce ? 0 : 280);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) document.body.classList.remove('leaving'); });
})();
