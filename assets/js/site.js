/* =========================================================
   DJIDONOU SHALOM IMMO — Site public
   ========================================================= */
(function () {
  const { DB, fcfa, shortMoney, esc, icon, img, parcelPlan, CATEGORIES, STATUS, isFav, toggleFav, updateFavCount, toast, qs, qsa, priceLabel, waLink, fdate } = window.DSI;
  const S = () => DB.settings();
  const page = document.body.dataset.page;

  /* ---------------- En-tête & pied de page ---------------- */
  const NAV = [
    ['index.html', 'Accueil', 'home'],
    ['biens.html?transaction=vente&category=parcelle', 'Parcelles', 'parcelles'],
    ['biens.html?transaction=vente', 'Acheter', 'acheter'],
    ['biens.html?transaction=location', 'Louer', 'louer'],
    ['services.html', 'Services', 'services'],
    ['contact.html', 'Contact', 'contact'],
  ];

  function logo(light) {
    return `<a href="index.html" class="logo ${light ? 'logo-light' : ''}" aria-label="${esc(S().name)} – accueil">
      <span class="logo-mark"><svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="currentColor"/><path d="M11 25 24 14l13 11" fill="none" stroke="#d4af6a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 23v11h18V23" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M21 34v-6h6v6" fill="none" stroke="#d4af6a" stroke-width="3" stroke-linejoin="round"/></svg></span>
      <span class="logo-text"><b>DJIDONOU SHALOM</b><i>IMMO</i></span></a>`;
  }

  function header() {
    const current = location.pathname.split('/').pop() || 'index.html';
    const params = new URLSearchParams(location.search);
    const activeKey = current === 'biens.html'
      ? (params.get('fav') ? 'favoris' : params.get('category') === 'parcelle' ? 'parcelles' : params.get('transaction') === 'location' ? 'louer' : 'acheter')
      : current.replace('.html', '').replace('index', 'home').replace('bien', 'acheter') || 'home';
    const links = NAV.map(([h, t, k]) => `<a href="${h}" class="${k === activeKey ? 'active' : ''}">${t}</a>`).join('');
    const transparent = page !== 'detail';
    const el = document.createElement('header');
    el.className = 'site-header' + (transparent ? ' is-transparent' : ' solid');
    el.innerHTML = `<div class="container nav-in">
        ${logo()}
        <nav class="main-nav" aria-label="Navigation principale">${links}</nav>
        <div class="nav-actions">
          <a href="biens.html?fav=1" class="icon-btn" aria-label="Mes favoris">${icon('heart')}<span class="badge" data-fav-count hidden>0</span></a>
          <a href="services.html#confier" class="btn btn-gold btn-sm hide-md magnetic">Confier mon bien</a>
          <button class="icon-btn burger" aria-label="Ouvrir le menu" aria-expanded="false">${icon('menu')}</button>
        </div>
      </div>`;
    document.body.prepend(el);
    const mnav = document.createElement('div');
    mnav.className = 'mobile-nav';
    mnav.innerHTML = `${links}<a href="services.html#confier" class="btn btn-gold">Confier mon bien</a>
      <div class="mobile-nav-foot"><a href="tel:${esc(S().phone.replace(/\s/g, ''))}">${icon('phone')} ${esc(S().phone)}</a><a href="mailto:${esc(S().email)}">${icon('mail')} ${esc(S().email)}</a><a href="admin.html">${icon('settings')} Espace administrateur</a></div>`;
    document.body.appendChild(mnav);
    const burger = qs('.burger', el);
    burger.addEventListener('click', () => {
      const open = !document.body.classList.contains('nav-open');
      document.body.classList.toggle('nav-open', open); burger.setAttribute('aria-expanded', open); burger.innerHTML = icon(open ? 'close' : 'menu');
    });
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      el.classList.toggle('scrolled', y > 40);
      el.classList.toggle('hide', y > 500 && y > last + 4 && !document.body.classList.contains('nav-open'));
      if (y < last - 4 || y < 500) el.classList.remove('hide');
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // Barre d'onglets mobile (style application)
    const tabs = [['index.html', 'home', 'Accueil', 'home'], ['biens.html?transaction=vente&category=parcelle', 'map', 'Parcelles', 'parcelles'], ['biens.html?transaction=location', 'key', 'Louer', 'louer'], ['biens.html?fav=1', 'heart', 'Favoris', 'favoris'], ['contact.html', 'phone', 'Contact', 'contact']];
    const tb = document.createElement('nav');
    tb.className = 'tabbar'; tb.setAttribute('aria-label', 'Navigation rapide');
    tb.innerHTML = tabs.map(([h, i, t, k]) => `<a href="${h}" class="${k === activeKey || (k === 'home' && activeKey === 'acheter' && current === 'index.html') ? 'active' : ''}">${icon(i)}<span>${t}</span>${k === 'favoris' ? '<span class="badge" data-fav-count hidden>0</span>' : ''}</a>`).join('');
    document.body.appendChild(tb);
  }

  function footer() {
    const s = S();
    const f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML = `<div class="footer-cta"><div class="container"><h2 class="reveal">Un projet immobilier ? <span class="gold-text">Parlons-en aujourd'hui.</span></h2>
        <div class="btns reveal" style="--d:120ms"><a class="btn btn-gold magnetic" href="contact.html">Prendre rendez-vous ${icon('arrow', 'ico-arrow')}</a><a class="btn btn-ghost-light" href="${waLink('Bonjour Shalom Immo, ')}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a></div></div></div>
      <div class="container footer-grid">
        <div>${logo(true)}<p class="footer-about">${esc(s.slogan)}. Gestion locative, vente de parcelles, accompagnement à l'achat et à la vente de biens immobiliers au Bénin.</p>
          <div class="socials"><a href="${esc(s.facebook)}" aria-label="Facebook">f</a><a href="${esc(s.instagram)}" aria-label="Instagram">ig</a><a href="${esc(s.tiktok)}" aria-label="TikTok">tt</a></div></div>
        <div><h4>Nos biens</h4><a href="biens.html?transaction=vente&category=parcelle">Parcelles à vendre</a><a href="biens.html?transaction=vente&category=maison">Maisons & villas</a><a href="biens.html?transaction=location">Locations</a><a href="biens.html?transaction=location&category=bureau">Bureaux & commerces</a></div>
        <div><h4>Services</h4><a href="services.html#gestion">Gestion locative</a><a href="services.html#foncier">Sécurisation foncière</a><a href="services.html#accompagnement">Achat & vente accompagnés</a><a href="services.html#confier">Faire estimer mon bien</a></div>
        <div><h4>Contact</h4><a href="tel:${esc(s.phone.replace(/\s/g, ''))}">${icon('phone')} ${esc(s.phone)}</a><a href="${waLink('Bonjour Shalom Immo, ')}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a><a href="mailto:${esc(s.email)}">${icon('mail')} ${esc(s.email)}</a><span>${icon('pin')} ${esc(s.address)}</span><span>${icon('clock')} ${esc(s.hours)}</span></div>
      </div>
      <div class="footer-word" aria-hidden="true">SHALOM IMMO</div>
      <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(s.name)}. Tous droits réservés.</span><span><a href="admin.html">Espace administrateur</a> · <button class="linklike" data-install hidden>Installer l'application</button></span></div>`;
    document.body.appendChild(f);

    const wa = document.createElement('a');
    wa.className = 'wa-float'; wa.href = waLink('Bonjour Shalom Immo, je souhaite des informations.'); wa.target = '_blank'; wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Discuter sur WhatsApp'); wa.innerHTML = icon('whatsapp');
    document.body.appendChild(wa);
  }

  /* ---------------- Carte d'annonce ---------------- */
  function card(p, opts = {}) {
    const isParcel = p.category === 'parcelle';
    const metas = isParcel
      ? [[icon('area'), p.surface + ' m²'], [icon('doc'), p.document || '—'], p.installment ? [icon('calendar'), 'Échelonné'] : null]
      : [[icon('area'), (p.built || p.surface) + ' m²'], p.bedrooms ? [icon('bed'), p.bedrooms + ' ch.'] : null, p.bathrooms ? [icon('bath'), p.bathrooms + ' sdb'] : null];
    const badges = [
      `<span class="tag ${p.transaction === 'location' ? 'tag-blue' : 'tag-green'}">${p.transaction === 'location' ? 'À louer' : 'À vendre'}</span>`,
      p.status !== 'disponible' ? `<span class="tag tag-dark">${esc(STATUS[p.status] || p.status)}</span>` : '',
      p.featured && p.status === 'disponible' ? `<span class="tag tag-gold">${icon('star')} Coup de cœur</span>` : '',
    ].join('');
    return `<article class="card prop-card tilt ${opts.horizontal ? 'horizontal' : ''} ${p.status === 'vendu' || p.status === 'loué' ? 'is-closed' : ''}" data-id="${esc(p.id)}">
      <a href="bien.html?id=${encodeURIComponent(p.id)}" class="prop-media">
        ${img(p.images && p.images[0], p.title, 'prop-img')}
        <div class="prop-badges">${badges}</div>
        <div class="prop-price-tag"><span>${esc(CATEGORIES[p.category] || '')}</span>${priceLabel(p)}</div>
        ${isParcel ? `<div class="prop-plan-mini">${parcelPlan(p, { cls: 'mini' })}</div>` : ''}
      </a>
      <button class="fav-btn ${isFav(p.id) ? 'on' : ''}" data-fav="${esc(p.id)}" aria-label="Ajouter aux favoris">${icon('heart')}</button>
      <div class="prop-body">
        <h3 class="prop-title"><a href="bien.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></h3>
        <p class="prop-loc">${icon('pin')} ${esc(p.district)}, ${esc(p.city)}</p>
        <ul class="prop-meta">${metas.filter(Boolean).map(([i, t]) => `<li>${i}${esc(t)}</li>`).join('')}</ul>
      </div>
    </article>`;
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault();
    const on = toggleFav(b.dataset.fav);
    qsa(`[data-fav="${b.dataset.fav}"]`).forEach((x) => x.classList.toggle('on', on));
    toast(on ? 'Ajouté à vos favoris' : 'Retiré de vos favoris');
    if (page === 'listing' && new URLSearchParams(location.search).get('fav')) window.dispatchEvent(new Event('dsi:refresh'));
  });

  /* ---------------- Formulaires de contact ---------------- */
  function bindLeadForms() {
    qsa('form[data-lead]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(form).entries());
        if (!fd.name || !fd.phone) { toast('Merci d\'indiquer votre nom et votre téléphone', 'err'); return; }
        const lead = DB.insert('leads', {
          date: new Date().toISOString().slice(0, 16), name: fd.name, phone: fd.phone, email: fd.email || '',
          subject: fd.subject || form.dataset.lead, propertyId: fd.propertyId || '', message: fd.message || '',
          preferredDate: fd.preferredDate || '', budget: fd.budget || '', status: 'nouveau',
        }, 'D');
        form.reset();
        const done = qs('.form-done', form.parentElement);
        const msg = `Bonjour Shalom Immo, je suis ${lead.name}. ${lead.subject}${lead.propertyId ? ' – réf. ' + (DB.find('properties', lead.propertyId)?.ref || lead.propertyId) : ''}. ${lead.message}`;
        if (done) { done.hidden = false; const a = qs('a', done); if (a) a.href = waLink(msg); form.hidden = true; }
        toast('Votre demande a bien été envoyée. Nous vous rappelons très vite.');
      });
    });
  }

  /* ---------------- Animations d'apparition ---------------- */
  function reveal() {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 }) : null;
    qsa('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
    qsa('[data-count]').forEach((el) => {
      const target = +el.dataset.count; let started = false;
      const run = () => { if (started) return; started = true; const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('fr-FR'); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
      if (io) new IntersectionObserver((ents, o) => ents.forEach((en) => { if (en.isIntersecting) { run(); o.disconnect(); } })).observe(el); else run();
    });
  }

  /* ---------------- Carte Leaflet ---------------- */
  function makeMap(el, items, opts = {}) {
    if (!window.L || !el) { if (el) el.innerHTML = '<p class="map-off">Carte indisponible hors connexion.</p>'; return null; }
    const map = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView(opts.center || [6.43, 2.35], opts.zoom || 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    const markers = [];
    items.forEach((p) => {
      if (!p.lat || !p.lng) return;
      const html = `<div class="pin-label ${p.transaction === 'location' ? 'loc' : ''} ${p.status !== 'disponible' ? 'off' : ''}">${shortMoney(p.price)}${p.transaction === 'location' ? '/m' : ''}</div>`;
      const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ html, className: 'pin-wrap', iconSize: null }) }).addTo(map);
      m.bindPopup(`<a href="bien.html?id=${encodeURIComponent(p.id)}" class="map-pop">${img(p.images && p.images[0], p.title)}<b>${esc(p.title)}</b><span>${fcfa(p.price)}${p.transaction === 'location' ? ' / mois' : ''}</span></a>`, { minWidth: 220 });
      markers.push(m);
    });
    if (markers.length > 1 && !opts.center) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));
    else if (markers.length === 1 && !opts.center) map.setView(markers[0].getLatLng(), 14);
    setTimeout(() => map.invalidateSize(), 200);
    return map;
  }

  /* ---------------- Simulateur de paiement ---------------- */
  function bindSimulator(root, preset) {
    if (!root) return;
    const price = qs('[name=simPrice]', root), down = qs('[name=simDown]', root), months = qs('[name=simMonths]', root), out = qs('.sim-out', root);
    if (preset) { price.value = preset.price; if (preset.installmentMonths) months.value = preset.installmentMonths; }
    const calc = () => {
      const P = +price.value || 0, dp = Math.min(100, +down.value || 0), n = Math.max(1, +months.value || 1);
      const apport = P * dp / 100, mensual = (P - apport) / n;
      qs('[data-v=down]', root).textContent = dp + ' %'; qs('[data-v=months]', root).textContent = n + ' mois';
      out.innerHTML = `<div><span>Apport initial</span><b>${fcfa(apport)}</b></div><div class="sim-main"><span>Mensualité</span><b>${fcfa(mensual)}</b></div><div><span>Total</span><b>${fcfa(P)}</b></div>`;
    };
    [price, down, months].forEach((i) => i.addEventListener('input', calc)); calc();
  }

  /* ---------------- PWA ---------------- */
  let deferred;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; qsa('[data-install]').forEach((b) => (b.hidden = false)); });
  document.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-install]') || !deferred) return;
    deferred.prompt(); await deferred.userChoice; deferred = null; qsa('[data-install]').forEach((b) => (b.hidden = true));
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

  /* ================= PAGES ================= */
  const visible = () => DB.all('properties');
  const cities = () => [...new Set(visible().map((p) => p.city))].sort();

  function home() {
    const s = S();
    qs('#hero-slogan').textContent = s.slogan;
    // Recherche
    const sf = qs('#hero-search');
    const citySel = qs('[name=city]', sf); cities().forEach((c) => citySel.insertAdjacentHTML('beforeend', `<option>${esc(c)}</option>`));
    qsa('.search-tabs button', sf).forEach((b) => b.addEventListener('click', () => {
      qsa('.search-tabs button', sf).forEach((x) => x.classList.toggle('active', x === b));
      qs('[name=transaction]', sf).value = b.dataset.t;
      const budget = qs('[name=priceMax]', sf);
      budget.innerHTML = b.dataset.t === 'location'
        ? '<option value="">Loyer max</option><option value="100000">100 000 FCFA</option><option value="200000">200 000 FCFA</option><option value="500000">500 000 FCFA</option>'
        : '<option value="">Budget max</option><option value="5000000">5 M FCFA</option><option value="10000000">10 M FCFA</option><option value="50000000">50 M FCFA</option><option value="200000000">200 M FCFA</option>';
    }));
    sf.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = new URLSearchParams([...new FormData(sf).entries()].filter(([, v]) => v));
      location.href = 'biens.html?' + p.toString();
    });

    const all = visible();
    const avail = all.filter((p) => p.status === 'disponible');
    qs('#stat-parcels').dataset.count = all.filter((p) => p.category === 'parcelle').length * 23 + 1;
    qs('#stat-rentals').dataset.count = DB.all('rentals').length * 31 + 6;

    // Catégories rapides
    const cnt = (f) => avail.filter(f).length;
    const I = window.DSI_SEED.IMG;
    qs('#quick-cats').innerHTML = [
      ['biens.html?transaction=vente&category=parcelle', 'map', 'Parcelles', cnt((p) => p.category === 'parcelle'), I.terrain1],
      ['biens.html?transaction=vente&category=maison', 'home', 'Maisons & villas', cnt((p) => p.category === 'maison' && p.transaction === 'vente'), I.villa2],
      ['biens.html?transaction=location&category=appartement', 'key', 'Appartements', cnt((p) => p.category === 'appartement'), I.salon4],
      ['biens.html?transaction=location&category=bureau', 'build', 'Bureaux', cnt((p) => p.category === 'bureau'), I.bureau1],
    ].map(([h, i, t, n, src], k) => `<a href="${h}" class="qcat reveal zoom" style="--d:${k * 90}ms">${img(src, t)}<span class="qcat-ico">${icon(i)}</span><span class="qcat-go">${icon('arrow')}</span><b>${t}</b><span>${n} disponible${n > 1 ? 's' : ''}</span></a>`).join('');

    // Services
    qs('#services-grid').innerHTML = DB.all('services').map((sv, i) => `<div class="service spot reveal" style="--d:${i * 80}ms"><span class="service-num">0${i + 1}</span><div class="service-ico">${icon(sv.icon)}</div><h3>${esc(sv.title)}</h3><p>${esc(sv.text)}</p><ul>${sv.points.map((pt) => `<li>${icon('check')}${esc(pt)}</li>`).join('')}</ul></div>`).join('');

    // Parcelles en vedette
    const parcels = all.filter((p) => p.category === 'parcelle' && p.transaction === 'vente').sort((a, b) => (a.status === 'disponible' ? 0 : 1) - (b.status === 'disponible' ? 0 : 1) || (b.featured - a.featured));
    qs('#featured-parcels').innerHTML = parcels.map((p) => card(p)).join('');
    const rentals = all.filter((p) => p.transaction === 'location').sort((a, b) => (a.status === 'disponible' ? 0 : 1) - (b.status === 'disponible' ? 0 : 1));
    qs('#featured-rentals').innerHTML = rentals.map((p) => card(p)).join('');
    const houses = all.filter((p) => p.transaction === 'vente' && p.category !== 'parcelle').slice(0, 3);
    qs('#featured-houses').innerHTML = houses.map((p, k) => `<div class="reveal" style="--d:${k * 100}ms">${card(p)}</div>`).join('');

    // Villes
    const cp = qs('#city-pills'); if (cp) cp.innerHTML = cities().map((c) => `<a href="biens.html?city=${encodeURIComponent(c)}">${esc(c)}</a>`).join('');

    // Carte
    makeMap(qs('#home-map'), all.filter((p) => p.status !== 'vendu'));

    // Témoignages
    qs('#testimonials').innerHTML = DB.all('testimonials').map((t, k) => `<figure class="testi reveal" style="--d:${k * 100}ms"><div class="stars">${icon('star').repeat(5)}</div><blockquote>${esc(t.text)}</blockquote><figcaption><span class="avatar">${esc(t.name[0])}</span><span><b>${esc(t.name)}</b><small>${esc(t.role)}</small></span></figcaption></figure>`).join('');

    qsa('.faq-q').forEach((b) => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
  }

  /* --------- Liste / recherche --------- */
  function listing() {
    const form = qs('#filters');
    const citySel = qs('[name=city]', form); cities().forEach((c) => citySel.insertAdjacentHTML('beforeend', `<option>${esc(c)}</option>`));
    const params = new URLSearchParams(location.search);
    for (const [k, v] of params) { const f = form.elements[k]; if (!f) continue; if (f.type === 'checkbox') f.checked = v === '1'; else f.value = v; }
    const favMode = params.get('fav') === '1';
    let view = 'grid', map;
    try { view = localStorage.getItem('dsi_view') || 'grid'; } catch (e) {}

    function apply() {
      const f = Object.fromEntries(new FormData(form).entries());
      const q = (f.q || '').trim().toLowerCase();
      let items = visible().filter((p) =>
        (!favMode || isFav(p.id)) &&
        (!f.transaction || p.transaction === f.transaction) &&
        (!f.category || p.category === f.category) &&
        (!f.city || p.city === f.city) &&
        (!f.priceMin || p.price >= +f.priceMin) &&
        (!f.priceMax || p.price <= +f.priceMax) &&
        (!f.surfaceMin || p.surface >= +f.surfaceMin) &&
        (!f.bedrooms || (p.bedrooms || 0) >= +f.bedrooms) &&
        (!f.document || p.document === f.document) &&
        (!f.installment || p.installment) &&
        (!f.available || p.status === 'disponible') &&
        (!q || [p.title, p.city, p.district, p.ref, p.description].join(' ').toLowerCase().includes(q)));
      const sort = f.sort || 'recent';
      items.sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : sort === 'surface' ? b.surface - a.surface : (b.createdAt || '').localeCompare(a.createdAt || ''));
      items.sort((a, b) => (a.status === 'disponible' ? 0 : 1) - (b.status === 'disponible' ? 0 : 1));

      const title = favMode ? 'Mes favoris' : f.category === 'parcelle' ? 'Parcelles à vendre' : f.transaction === 'location' ? 'Biens à louer' : f.transaction === 'vente' ? 'Biens à vendre' : 'Tous nos biens';
      qs('#list-title').textContent = title;
      qs('#list-count').textContent = `${items.length} bien${items.length > 1 ? 's' : ''} trouvé${items.length > 1 ? 's' : ''}`;
      const res = qs('#results');
      res.className = 'results view-' + view;
      res.innerHTML = items.length ? items.map((p) => card(p, { horizontal: view === 'list' })).join('')
        : `<div class="empty">${icon(favMode ? 'heart' : 'search')}<h3>${favMode ? 'Aucun favori pour le moment' : 'Aucun bien ne correspond'}</h3><p>${favMode ? 'Touchez le cœur sur une annonce pour la retrouver ici.' : 'Élargissez vos critères ou laissez-nous votre recherche : nous vous prévenons dès qu\'un bien correspond.'}</p><a href="#alerte" class="btn btn-primary">Créer une alerte</a></div>`;
      const mapEl = qs('#list-map');
      mapEl.hidden = view !== 'map';
      if (view === 'map') { if (map) { map.remove(); map = null; } mapEl.innerHTML = ''; map = makeMap(mapEl, items); }
      // chips
      const labels = { transaction: { vente: 'À vendre', location: 'À louer' }, category: CATEGORIES };
      qs('#chips').innerHTML = Object.entries(f).filter(([k, v]) => v && !['sort'].includes(k)).map(([k, v]) => {
        const txt = labels[k]?.[v] || ({ priceMin: 'Min ' + shortMoney(+v), priceMax: 'Max ' + shortMoney(+v), surfaceMin: '≥ ' + v + ' m²', bedrooms: v + '+ ch.', installment: 'Paiement échelonné', available: 'Disponibles' }[k]) || v;
        return `<button type="button" class="chip" data-clear="${esc(k)}">${esc(txt)} ${icon('close')}</button>`;
      }).join('');
      const url = new URLSearchParams(Object.entries(f).filter(([, v]) => v)); if (favMode) url.set('fav', '1');
      history.replaceState(null, '', 'biens.html' + (url.toString() ? '?' + url : ''));
      qsa('.view-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    }
    form.addEventListener('input', apply);
    form.addEventListener('submit', (e) => { e.preventDefault(); apply(); document.body.classList.remove('filters-open'); });
    qs('#chips').addEventListener('click', (e) => { const c = e.target.closest('[data-clear]'); if (!c) return; const el = form.elements[c.dataset.clear]; if (el.type === 'checkbox') el.checked = false; else el.value = ''; apply(); });
    qs('#reset-filters').addEventListener('click', () => { form.reset(); apply(); });
    qsa('.view-toggle button').forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; try { localStorage.setItem('dsi_view', view); } catch (e) {} apply(); }));
    qsa('[data-toggle-filters]').forEach((b) => b.addEventListener('click', () => document.body.classList.toggle('filters-open')));
    window.addEventListener('dsi:refresh', apply);
    apply();
  }

  /* --------- Détail d'un bien --------- */
  function detail() {
    const id = new URLSearchParams(location.search).get('id');
    const p = DB.find('properties', id);
    const root = qs('#detail');
    if (!p) { root.innerHTML = `<div class="container empty">${icon('search')}<h3>Ce bien n'existe plus</h3><p>Il a peut-être été vendu ou retiré.</p><a class="btn btn-primary" href="biens.html">Voir tous nos biens</a></div>`; return; }
    document.title = p.title + ' – ' + S().name;
    const isParcel = p.category === 'parcelle';
    const imgs = p.images && p.images.length ? p.images : [''];
    const specs = isParcel
      ? [['area', 'Superficie', p.surface + ' m²'], ['map', 'Dimensions', p.width && p.depth ? `${p.width} m × ${p.depth} m` : '—'], ['doc', 'Document', p.document || '—'], ['check', 'Viabilisée', p.viabilise ? 'Oui' : 'Non'], ['calendar', 'Paiement', p.installment ? `Échelonné (${p.installmentMonths} mois)` : 'Comptant']]
      : [['area', p.transaction === 'location' ? 'Surface' : 'Terrain', p.surface + ' m²'], p.built ? ['home', 'Bâti', p.built + ' m²'] : null, ['grid', 'Pièces', p.rooms || '—'], ['bed', 'Chambres', p.bedrooms || '—'], ['bath', 'Salles de bain', p.bathrooms || '—'], p.transaction === 'location' ? ['key', 'Meublé', p.furnished ? 'Oui' : 'Non'] : ['doc', 'Document', p.document || '—']].filter(Boolean);
    const shareText = `${p.title} – ${fcfa(p.price)}${p.transaction === 'location' ? '/mois' : ''}`;
    root.innerHTML = `
      <div class="container">
        <nav class="crumbs"><a href="index.html">Accueil</a> / <a href="biens.html?transaction=${p.transaction}">${p.transaction === 'location' ? 'Location' : 'Vente'}</a> / <span>${esc(p.ref)}</span></nav>
        <div class="detail-head">
          <div><div class="prop-badges static"><span class="tag ${p.transaction === 'location' ? 'tag-blue' : 'tag-green'}">${p.transaction === 'location' ? 'À louer' : 'À vendre'}</span><span class="tag tag-light">${esc(CATEGORIES[p.category])}</span>${p.status !== 'disponible' ? `<span class="tag tag-dark">${esc(STATUS[p.status])}</span>` : ''}</div>
            <h1>${esc(p.title)}</h1><p class="prop-loc">${icon('pin')} ${esc(p.district)}, ${esc(p.city)} · Réf. ${esc(p.ref)}</p></div>
          <div class="detail-price"><b>${priceLabel(p)}</b>${isParcel && p.surface ? `<span>soit ${fcfa(p.price / p.surface)} / m²</span>` : ''}
            <div class="detail-actions"><button class="icon-btn fav-btn static ${isFav(p.id) ? 'on' : ''}" data-fav="${esc(p.id)}" aria-label="Favori">${icon('heart')}</button><button class="icon-btn" id="share" aria-label="Partager">${icon('share')}</button></div></div>
        </div>
        <div class="gallery ${imgs.length > 1 ? '' : 'single'} ${imgs.length === 2 ? 'sides-1' : ''}">
          <button class="g-main" data-g="0">${img(imgs[0], p.title)}</button>
          ${imgs.slice(1, 3).map((s, i) => `<button class="g-side" data-g="${i + 1}">${img(s, p.title)}${i === 1 && imgs.length > 3 ? `<span class="g-more">+${imgs.length - 3}</span>` : ''}</button>`).join('')}
          ${isParcel ? `<div class="g-plan">${parcelPlan(p)}</div>` : ''}
        </div>
        <div class="detail-grid">
          <div class="detail-main">
            <section class="panel"><h2>Caractéristiques</h2><div class="specs">${specs.map(([i, k, v]) => `<div class="spec">${icon(i)}<span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div></section>
            <section class="panel"><h2>Description</h2><p class="lead-text">${esc(p.description)}</p>
              <ul class="checklist">${(p.features || []).map((f) => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul></section>
            ${p.transaction === 'location' ? `<section class="panel"><h2>Conditions de location</h2><div class="specs"><div class="spec">${icon('money')}<span>Loyer mensuel</span><b>${fcfa(p.price)}</b></div><div class="spec">${icon('shield')}<span>Caution</span><b>${p.deposit || 0} mois</b></div><div class="spec">${icon('calendar')}<span>Avance</span><b>${p.advance || 0} mois</b></div><div class="spec">${icon('key')}<span>Total à l'entrée</span><b>${fcfa(p.price * ((p.deposit || 0) + (p.advance || 0)))}</b></div></div><p class="note">Caution et avance indicatives, à confirmer lors de la visite. Frais d'agence : 1 mois de loyer.</p></section>` : ''}
            ${isParcel ? `<section class="panel"><h2>Sécurité du dossier foncier</h2><div class="steps-mini">
              <div>${icon('shield')}<b>Vérifié à l'ANDF</b><span>Nous contrôlons l'historique de la parcelle avant la mise en vente.</span></div>
              <div>${icon('map')}<b>Bornage contradictoire</b><span>Visite sur site, bornes et voisinage vérifiés avec vous.</span></div>
              <div>${icon('doc')}<b>Signature chez le notaire</b><span>Convention, puis accompagnement à la mutation de votre ${esc(p.document === 'Titre Foncier' ? 'Titre Foncier' : 'CPF')}.</span></div></div></section>` : ''}
            ${p.installment ? `<section class="panel" id="simulator"><h2>Simulez votre paiement échelonné</h2>${simulatorHTML()}</section>` : ''}
            <section class="panel"><h2>Situation géographique</h2><div id="detail-map" class="map map-md"></div><p class="note">${icon('pin')} Position approximative. L'emplacement exact est communiqué lors de la visite.</p></section>
          </div>
          <aside class="detail-side">
            <div class="panel sticky contact-card">
              <h3>Intéressé(e) par ce bien ?</h3>
              <p class="muted">Un conseiller vous répond en moins de 2 heures.</p>
              <a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="${waLink(`Bonjour, je suis intéressé(e) par « ${p.title} » (réf. ${p.ref}).`)}">${icon('whatsapp')} WhatsApp</a>
              <a class="btn btn-outline btn-block" href="tel:${esc(S().phone.replace(/\s/g, ''))}">${icon('phone')} Appeler</a>
              <div class="sep"><span>ou</span></div>
              <form data-lead="Visite" class="form">
                <input type="hidden" name="propertyId" value="${esc(p.id)}">
                <div class="seg"><label><input type="radio" name="subject" value="Visite" checked><span>Visiter</span></label><label><input type="radio" name="subject" value="Information"><span>M'informer</span></label>${p.transaction === 'vente' ? '<label><input type="radio" name="subject" value="Offre"><span>Faire une offre</span></label>' : ''}</div>
                <input name="name" placeholder="Nom complet *" required autocomplete="name">
                <input name="phone" placeholder="Téléphone / WhatsApp *" required type="tel" autocomplete="tel">
                <input name="email" placeholder="E-mail" type="email" autocomplete="email">
                <label class="lbl">Date de visite souhaitée<input name="preferredDate" type="datetime-local"></label>
                <textarea name="message" rows="3" placeholder="Votre message">Bonjour, je suis intéressé(e) par ce bien (réf. ${esc(p.ref)}).</textarea>
                <button class="btn btn-primary btn-block">Envoyer ma demande</button>
              </form>
              <div class="form-done" hidden>${icon('check')}<b>Demande envoyée !</b><p>Nous vous contactons très vite. Vous pouvez aussi nous écrire directement :</p><a class="btn btn-wa btn-block" target="_blank" rel="noopener">${icon('whatsapp')} Continuer sur WhatsApp</a></div>
            </div>
          </aside>
        </div>
        <section class="section-sm"><div class="sec-head"><h2>Biens similaires</h2><a href="biens.html?transaction=${p.transaction}&category=${p.category}" class="link-arrow">Voir tout ${icon('arrow')}</a></div>
          <div class="grid-cards">${visible().filter((x) => x.id !== p.id && x.category === p.category && x.transaction === p.transaction).slice(0, 3).map((x) => card(x)).join('') || '<p class="muted">Aucun bien similaire pour le moment.</p>'}</div></section>
      </div>
      <div class="mobile-cta"><div><b>${priceLabel(p)}</b><span>${esc(p.district)}, ${esc(p.city)}</span></div><a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Bonjour, je suis intéressé(e) par « ${p.title} » (réf. ${p.ref}).`)}">${icon('whatsapp')} Contacter</a></div>
      <div class="lightbox" hidden><button class="lb-close" aria-label="Fermer">${icon('close')}</button><button class="lb-prev" aria-label="Précédente">‹</button><img alt=""><button class="lb-next" aria-label="Suivante">›</button><span class="lb-count"></span></div>`;

    makeMap(qs('#detail-map'), [p], { center: [p.lat, p.lng], zoom: 14 });
    if (p.installment) bindSimulator(qs('#simulator'), p);
    bindLeadForms();
    qs('#share').addEventListener('click', async () => {
      const data = { title: p.title, text: shareText, url: location.href };
      if (navigator.share) { try { await navigator.share(data); } catch (e) {} }
      else { try { await navigator.clipboard.writeText(location.href); toast('Lien copié'); } catch (e) { toast('Copiez le lien dans la barre d\'adresse'); } }
    });
    // Lightbox
    const lb = qs('.lightbox'), lbImg = qs('img', lb); let cur = 0;
    const show = (i) => { cur = (i + imgs.length) % imgs.length; lbImg.src = imgs[cur]; lbImg.onerror = () => { lbImg.src = window.DSI.FALLBACK; }; qs('.lb-count', lb).textContent = `${cur + 1} / ${imgs.length}`; };
    qsa('[data-g]').forEach((b) => b.addEventListener('click', () => { show(+b.dataset.g); lb.hidden = false; }));
    qs('.lb-close', lb).onclick = () => (lb.hidden = true);
    qs('.lb-prev', lb).onclick = () => show(cur - 1); qs('.lb-next', lb).onclick = () => show(cur + 1);
    document.addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
    // Vu récemment
    try { const r = JSON.parse(localStorage.getItem('dsi_recent') || '[]').filter((x) => x !== p.id); r.unshift(p.id); localStorage.setItem('dsi_recent', JSON.stringify(r.slice(0, 8))); } catch (e) {}
  }

  function simulatorHTML() {
    return `<div class="sim"><div class="sim-in">
      <label>Prix du bien (FCFA)<input type="number" name="simPrice" value="8500000" min="0" step="100000"></label>
      <label>Apport initial <b data-v="down"></b><input type="range" name="simDown" min="10" max="90" step="5" value="30"></label>
      <label>Durée <b data-v="months"></b><input type="range" name="simMonths" min="3" max="36" step="1" value="12"></label>
    </div><div class="sim-out"></div></div><p class="note">Simulation indicative sans intérêts. Les conditions définitives sont fixées dans la convention de vente.</p>`;
  }
  window.DSI.simulatorHTML = simulatorHTML;

  function services() {
    qs('#services-detail').innerHTML = DB.all('services').map((sv, i) => {
      const anchors = ['gestion', 'parcelles', 'accompagnement', 'foncier', 'recherche', 'construction'];
      return `<article class="svc-row reveal from-left" id="${anchors[i] || 's' + i}"><div class="svc-num">0${i + 1}</div><div class="service-ico">${icon(sv.icon)}</div><div><h3>${esc(sv.title)}</h3><p>${esc(sv.text)}</p><ul class="checklist inline">${sv.points.map((pt) => `<li>${icon('check')}${esc(pt)}</li>`).join('')}</ul></div></article>`;
    }).join('');
  }

  function contact() {
    const s = S();
    qs('#contact-info').innerHTML = `
      <a href="tel:${esc(s.phone.replace(/\s/g, ''))}" class="cinfo">${icon('phone')}<span><small>Téléphone</small><b>${esc(s.phone)}</b></span></a>
      <a href="${waLink('Bonjour Shalom Immo, ')}" target="_blank" rel="noopener" class="cinfo">${icon('whatsapp')}<span><small>WhatsApp</small><b>Écrire maintenant</b></span></a>
      <a href="mailto:${esc(s.email)}" class="cinfo">${icon('mail')}<span><small>E-mail</small><b>${esc(s.email)}</b></span></a>
      <div class="cinfo">${icon('pin')}<span><small>Adresse</small><b>${esc(s.address)}</b></span></div>
      <div class="cinfo">${icon('clock')}<span><small>Horaires</small><b>${esc(s.hours)}</b></span></div>`;
    if (window.L) {
      const map = L.map(qs('#contact-map'), { scrollWheelZoom: false }).setView([s.lat, s.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      L.marker([s.lat, s.lng], { icon: L.divIcon({ html: '<div class="pin-label agency">Shalom Immo</div>', className: 'pin-wrap', iconSize: null }) }).addTo(map);
    }
  }

  /* ---------------- Démarrage ---------------- */
  header(); footer(); updateFavCount();
  ({ home, listing, detail, services, contact }[page] || (() => {}))();
  bindLeadForms();
  qsa('[data-simulator]').forEach((el) => { el.innerHTML = simulatorHTML(); bindSimulator(el.closest('section') || el); });
  reveal();
})();
