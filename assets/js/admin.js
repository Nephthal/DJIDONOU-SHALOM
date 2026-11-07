/* =========================================================
   DJIDONOU SHALOM IMMO — Espace administrateur (démo)
   ATTENTION : cette version stocke les données dans le
   navigateur. Pour un usage réel multi-appareils, brancher
   un serveur (voir README).
   ========================================================= */
(function () {
  const { DB, fcfa, shortMoney, esc, icon, img, CATEGORIES, STATUS, toast, qs, qsa, fdate, fdatetime, waLink } = window.DSI;
  const SESSION = 'dsi_admin_session';
  const app = qs('#admin');

  async function sha(s) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
    }
    return 'plain:' + s;
  }
  const DEFAULT_USER = 'admin', DEFAULT_PASS = 'shalom2026';
  const logged = () => { try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } };

  /* ---------------- Connexion ---------------- */
  function login() {
    app.innerHTML = `<div class="login-wrap"><form class="login-card" id="login">
      <div class="login-logo"><svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0f3b36"/><path d="M11 25 24 14l13 11" fill="none" stroke="#d4af6a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 23v11h18V23" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M21 34v-6h6v6" fill="none" stroke="#d4af6a" stroke-width="3" stroke-linejoin="round"/></svg></div>
      <h1>Espace administrateur</h1><p class="muted">${esc(DB.settings().name)}</p>
      <label>Identifiant<input name="user" autocomplete="username" required></label>
      <label>Mot de passe<input name="pass" type="password" autocomplete="current-password" required></label>
      <button class="a-btn a-primary">Se connecter</button>
      <p class="login-hint">Démo : <b>admin</b> / <b>shalom2026</b></p>
      <a href="index.html" class="muted small">← Retour au site</a></form></div>`;
    qs('#login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target).entries());
      const s = DB.settings();
      const ok = f.user === (s.adminUser || DEFAULT_USER) && (s.adminPassHash ? (await sha(f.pass)) === s.adminPassHash : f.pass === DEFAULT_PASS);
      if (!ok) { toast('Identifiant ou mot de passe incorrect', 'err'); return; }
      try { sessionStorage.setItem(SESSION, '1'); } catch (er) {}
      shell();
    });
  }

  /* ---------------- Structure ---------------- */
  const VIEWS = [
    ['dashboard', 'Tableau de bord', 'chart'],
    ['biens', 'Biens & annonces', 'home'],
    ['demandes', 'Demandes', 'inbox'],
    ['clients', 'Clients', 'users'],
    ['gestion', 'Gestion locative', 'key'],
    ['visites', 'Visites', 'calendar'],
    ['parametres', 'Paramètres', 'settings'],
  ];
  let current = 'dashboard';

  function shell() {
    app.innerHTML = `<div class="a-layout">
      <aside class="a-side"><a href="index.html" class="a-brand"><svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1d5c52"/><path d="M11 25 24 14l13 11" fill="none" stroke="#d4af6a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 23v11h18V23" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg><span><b>SHALOM IMMO</b><small>Administration</small></span></a>
        <nav>${VIEWS.map(([k, t, i]) => `<button data-view="${k}">${icon(i)}<span>${t}</span><em data-count="${k}"></em></button>`).join('')}</nav>
        <div class="a-side-foot"><a href="index.html" target="_blank">${icon('eye')}<span>Voir le site</span></a><button id="logout">${icon('logout')}<span>Déconnexion</span></button></div></aside>
      <div class="a-main"><header class="a-top"><button class="a-burger" aria-label="Menu">${icon('menu')}</button><h1 id="a-title"></h1><div class="a-top-actions" id="a-actions"></div></header><div class="a-content" id="a-content"></div></div>
    </div><div class="a-modal" hidden><div class="a-modal-box"><header><h2></h2><button class="a-x" aria-label="Fermer">${icon('close')}</button></header><div class="a-modal-body"></div></div></div>`;
    qsa('.a-side nav button').forEach((b) => b.addEventListener('click', () => { go(b.dataset.view); document.body.classList.remove('a-nav-open'); }));
    qs('#logout').onclick = () => { try { sessionStorage.removeItem(SESSION); } catch (e) {} login(); };
    qs('.a-burger').onclick = () => document.body.classList.toggle('a-nav-open');
    qs('.a-modal .a-x').onclick = closeModal;
    qs('.a-modal').addEventListener('click', (e) => { if (e.target.classList.contains('a-modal')) closeModal(); });
    const h = location.hash.slice(1); go(VIEWS.some((v) => v[0] === h) ? h : 'dashboard');
  }

  function counts() {
    const n = DB.all('leads').filter((l) => l.status === 'nouveau').length;
    const el = qs('[data-count=demandes]'); if (el) { el.textContent = n || ''; }
    const unpaid = unpaidList().length; const g = qs('[data-count=gestion]'); if (g) g.textContent = unpaid || '';
  }

  function go(v) {
    current = v; location.hash = v;
    qsa('.a-side nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    qs('#a-title').textContent = VIEWS.find((x) => x[0] === v)[1];
    qs('#a-actions').innerHTML = '';
    C().onclick = null; C().onchange = null;
    ({ dashboard, biens, demandes, clients, gestion, visites, parametres })[v]();
    counts();
    qs('#a-content').scrollTop = 0; window.scrollTo(0, 0);
  }
  const C = () => qs('#a-content');
  const action = (html, fn) => { const a = qs('#a-actions'); a.insertAdjacentHTML('beforeend', html); a.lastElementChild.addEventListener('click', fn); };

  /* ---------------- Modale & formulaires ---------------- */
  function openModal(title, html, onReady) {
    const m = qs('.a-modal'); qs('h2', m).textContent = title; qs('.a-modal-body', m).innerHTML = html; m.hidden = false; document.body.style.overflow = 'hidden';
    onReady && onReady(qs('.a-modal-body', m));
  }
  function closeModal() { qs('.a-modal').hidden = true; document.body.style.overflow = ''; }

  // champs : [name, label, type, options, extra]
  function fields(spec, data = {}) {
    return spec.map(([n, l, t = 'text', opts, cls = '']) => {
      const v = data[n] ?? '';
      if (t === 'section') return `<h3 class="f-sec">${esc(l)}</h3>`;
      if (t === 'select') return `<label class="${cls}">${esc(l)}<select name="${n}">${opts.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select></label>`;
      if (t === 'textarea') return `<label class="${cls || 'full'}">${esc(l)}<textarea name="${n}" rows="${opts || 3}">${esc(v)}</textarea></label>`;
      if (t === 'checkbox') return `<label class="a-check ${cls}"><input type="checkbox" name="${n}" ${v ? 'checked' : ''}> ${esc(l)}</label>`;
      return `<label class="${cls}">${esc(l)}<input name="${n}" type="${t}" value="${esc(v)}" ${t === 'number' ? 'step="any"' : ''} ${opts === 'req' ? 'required' : ''}></label>`;
    }).join('');
  }
  function readForm(form, spec) {
    const fd = new FormData(form), o = {};
    spec.forEach(([n, , t]) => {
      if (t === 'section') return;
      if (t === 'checkbox') o[n] = !!fd.get(n);
      else if (t === 'number') o[n] = fd.get(n) === '' ? '' : +fd.get(n);
      else o[n] = (fd.get(n) || '').toString().trim();
    });
    return o;
  }
  const confirmDel = (what) => confirm(`Supprimer ${what} ? Cette action est définitive.`);

  /* ---------------- Tableau de bord ---------------- */
  const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);
  function unpaidList() {
    const mk = monthKey(), out = [];
    DB.all('rentals').forEach((r) => {
      Object.entries(r.payments || {}).forEach(([m, paid]) => { if (!paid && m <= mk) out.push({ r, m }); });
    });
    return out;
  }
  function dashboard() {
    const props = DB.all('properties'), leads = DB.all('leads'), rentals = DB.all('rentals');
    const mk = monthKey();
    const avail = props.filter((p) => p.status === 'disponible');
    const saleValue = avail.filter((p) => p.transaction === 'vente').reduce((s, p) => s + p.price, 0);
    const expected = rentals.reduce((s, r) => s + r.rent, 0);
    const collected = rentals.filter((r) => r.payments?.[mk]).reduce((s, r) => s + r.rent, 0);
    const commission = rentals.filter((r) => r.payments?.[mk]).reduce((s, r) => s + r.rent * (r.commission || 0) / 100, 0);
    const newLeads = leads.filter((l) => l.status === 'nouveau').length;
    // demandes par mois (6 derniers)
    const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return monthKey(d); });
    const perMonth = months.map((m) => leads.filter((l) => (l.date || '').startsWith(m)).length);
    const maxM = Math.max(1, ...perMonth);
    const byCat = Object.keys(CATEGORIES).map((k) => [CATEGORIES[k], props.filter((p) => p.category === k).length]);
    const visits = DB.all('visits').filter((v) => v.status === 'planifiée').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
    const unpaid = unpaidList();
    action(`<button class="a-btn a-primary">${icon('plus')} Nouveau bien</button>`, () => { go('biens'); editProperty(); });

    C().innerHTML = `
      <div class="kpis">
        <div class="kpi"><span>${icon('home')} Biens disponibles</span><b>${avail.length}</b><small>${props.length} au total</small></div>
        <div class="kpi"><span>${icon('inbox')} Nouvelles demandes</span><b>${newLeads}</b><small>${leads.length} demandes reçues</small></div>
        <div class="kpi"><span>${icon('money')} Loyers du mois</span><b>${shortMoney(collected)}</b><small>sur ${fcfa(expected)} attendus</small><div class="bar"><i style="width:${expected ? Math.round(collected / expected * 100) : 0}%"></i></div></div>
        <div class="kpi"><span>${icon('chart')} Portefeuille à vendre</span><b>${shortMoney(saleValue)}</b><small>Commissions gestion : ${fcfa(commission)}</small></div>
      </div>
      <div class="a-grid">
        <section class="a-card"><h3>Demandes reçues (6 mois)</h3>
          <div class="chart">${perMonth.map((n, i) => `<div class="chart-col"><span class="chart-v">${n}</span><i style="height:${Math.max(4, n / maxM * 100)}%"></i><small>${new Date(months[i] + '-01').toLocaleDateString('fr-FR', { month: 'short' })}</small></div>`).join('')}</div></section>
        <section class="a-card"><h3>Répartition des biens</h3><div class="hbars">${byCat.map(([l, n]) => `<div><span>${esc(l)}</span><div class="hbar"><i style="width:${props.length ? n / props.length * 100 : 0}%"></i></div><b>${n}</b></div>`).join('')}</div></section>
        <section class="a-card"><h3>Dernières demandes <button class="a-link" data-go="demandes">Tout voir</button></h3>
          ${leads.slice(0, 5).map((l) => `<div class="mini-row"><span class="dot dot-${esc(l.status.replace(' ', '-'))}"></span><div><b>${esc(l.name)}</b><small>${esc(l.subject)} · ${fdatetime(l.date)}</small></div><a class="a-icon" target="_blank" rel="noopener" href="https://wa.me/${esc(l.phone.replace(/\D/g, ''))}">${icon('whatsapp')}</a></div>`).join('') || '<p class="muted">Aucune demande.</p>'}</section>
        <section class="a-card"><h3>Prochaines visites <button class="a-link" data-go="visites">Tout voir</button></h3>
          ${visits.map((v) => `<div class="mini-row"><span class="date-chip"><b>${new Date(v.date).getDate()}</b>${new Date(v.date).toLocaleDateString('fr-FR', { month: 'short' })}</span><div><b>${esc(v.client)}</b><small>${esc(DB.find('properties', v.propertyId)?.title || '—')} · ${new Date(v.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small></div></div>`).join('') || '<p class="muted">Aucune visite planifiée.</p>'}</section>
        <section class="a-card wide"><h3>Loyers impayés <button class="a-link" data-go="gestion">Gestion locative</button></h3>
          ${unpaid.length ? `<table class="a-table"><thead><tr><th>Bien</th><th>Locataire</th><th>Mois</th><th>Montant</th><th></th></tr></thead><tbody>${unpaid.map(({ r, m }) => { const t = DB.find('clients', r.tenantId); return `<tr><td>${esc(r.label)}</td><td>${esc(t?.name || '—')}</td><td>${esc(new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))}</td><td><b>${fcfa(r.rent)}</b></td><td>${t ? `<a class="a-btn a-sm" target="_blank" rel="noopener" href="https://wa.me/${esc(t.phone.replace(/\D/g, ''))}?text=${encodeURIComponent(`Bonjour ${t.name}, petit rappel : le loyer de ${new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long' })} (${fcfa(r.rent)}) pour « ${r.label} » est attendu. Merci. – Shalom Immo`)}">${icon('whatsapp')} Relancer</a>` : ''}</td></tr>`; }).join('')}</tbody></table>` : '<p class="muted">Tous les loyers sont à jour ✔</p>'}</section>
      </div>`;
    qsa('[data-go]', C()).forEach((b) => (b.onclick = () => go(b.dataset.go)));
  }

  /* ---------------- Biens ---------------- */
  const PROP_SPEC = [
    ['', 'Informations principales', 'section'],
    ['title', 'Titre de l\'annonce *', 'text', 'req', 'full'],
    ['ref', 'Référence', 'text'],
    ['transaction', 'Transaction', 'select', [['vente', 'Vente'], ['location', 'Location']]],
    ['category', 'Catégorie', 'select', Object.entries(CATEGORIES)],
    ['status', 'Statut', 'select', Object.entries(STATUS)],
    ['price', 'Prix / loyer mensuel (FCFA) *', 'number', 'req'],
    ['surface', 'Surface terrain (m²)', 'number'],
    ['', 'Localisation', 'section'],
    ['city', 'Ville *', 'text', 'req'],
    ['district', 'Quartier', 'text'],
    ['lat', 'Latitude', 'number'],
    ['lng', 'Longitude', 'number'],
    ['', 'Détails', 'section'],
    ['width', 'Largeur parcelle (m)', 'number'],
    ['depth', 'Profondeur parcelle (m)', 'number'],
    ['document', 'Document foncier', 'select', ['', 'Titre Foncier', 'CPF', 'ADC', 'Convention de vente', 'Autre']],
    ['built', 'Surface bâtie (m²)', 'number'],
    ['rooms', 'Pièces', 'number'],
    ['bedrooms', 'Chambres', 'number'],
    ['bathrooms', 'Salles de bain', 'number'],
    ['installmentMonths', 'Échelonnement max (mois)', 'number'],
    ['deposit', 'Caution (mois)', 'number'],
    ['advance', 'Avance (mois)', 'number'],
    ['installment', 'Paiement échelonné possible', 'checkbox'],
    ['viabilise', 'Viabilisé (eau / électricité)', 'checkbox'],
    ['furnished', 'Meublé', 'checkbox'],
    ['featured', 'Mettre en avant (coup de cœur)', 'checkbox'],
    ['description', 'Description', 'textarea', 4],
    ['featuresTxt', 'Points forts (un par ligne)', 'textarea', 4],
    ['imagesTxt', 'Photos — adresses web (une par ligne)', 'textarea', 3],
  ];

  function biens() {
    action(`<button class="a-btn a-primary">${icon('plus')} Ajouter un bien</button>`, () => editProperty());
    C().innerHTML = `<div class="a-toolbar"><input type="search" id="pq" placeholder="Rechercher (titre, réf., ville)…"><select id="pt"><option value="">Toutes transactions</option><option value="vente">Vente</option><option value="location">Location</option></select><select id="ps"><option value="">Tous statuts</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div><div id="plist"></div>`;
    const render = () => {
      const q = qs('#pq').value.toLowerCase(), t = qs('#pt').value, s = qs('#ps').value;
      const items = DB.all('properties').filter((p) => (!t || p.transaction === t) && (!s || p.status === s) && (!q || [p.title, p.ref, p.city, p.district].join(' ').toLowerCase().includes(q)));
      qs('#plist').innerHTML = items.length ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th></th><th>Bien</th><th>Type</th><th>Prix</th><th>Statut</th><th>Demandes</th><th></th></tr></thead><tbody>${items.map((p) => {
        const nl = DB.all('leads').filter((l) => l.propertyId === p.id).length;
        return `<tr><td class="thumb">${img(p.images?.[0], '')}</td><td><b>${esc(p.title)}</b><small>${esc(p.ref)} · ${esc(p.district)}, ${esc(p.city)}</small></td><td><span class="pill">${p.transaction === 'vente' ? 'Vente' : 'Location'}</span> ${esc(CATEGORIES[p.category])}</td><td><b>${fcfa(p.price)}</b>${p.transaction === 'location' ? '<small>/ mois</small>' : ''}</td>
        <td><select class="a-status st-${esc(p.status)}" data-status="${esc(p.id)}">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${p.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></td><td>${nl}</td>
        <td class="acts"><button class="a-icon ${p.featured ? 'on' : ''}" data-star="${esc(p.id)}" title="Coup de cœur">${icon('star')}</button><a class="a-icon" href="bien.html?id=${encodeURIComponent(p.id)}" target="_blank" title="Voir">${icon('eye')}</a><button class="a-icon" data-edit="${esc(p.id)}" title="Modifier">${icon('edit')}</button><button class="a-icon danger" data-del="${esc(p.id)}" title="Supprimer">${icon('trash')}</button></td></tr>`;
      }).join('')}</tbody></table></div>` : '<div class="a-empty">Aucun bien trouvé.</div>';
    };
    ['#pq', '#pt', '#ps'].forEach((s) => qs(s).addEventListener('input', render));
    C().onchange = ((e) => { const s = e.target.closest('[data-status]'); if (s) { DB.update('properties', s.dataset.status, { status: s.value }); s.className = 'a-status st-' + s.value; toast('Statut mis à jour'); } });
    C().onclick = ((e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.edit) editProperty(b.dataset.edit);
      if (b.dataset.del && confirmDel('ce bien')) { DB.remove('properties', b.dataset.del); render(); toast('Bien supprimé'); }
      if (b.dataset.star) { const p = DB.find('properties', b.dataset.star); DB.update('properties', p.id, { featured: !p.featured }); render(); }
    });
    render();
  }

  function compress(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1280 / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.72)); }; im.onerror = rej; im.src = r.result; };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }

  function editProperty(id) {
    const p = id ? DB.find('properties', id) : { transaction: 'vente', category: 'parcelle', status: 'disponible', lat: 6.45, lng: 2.35, images: [], features: [] };
    let uploaded = (p.images || []).filter((s) => s.startsWith('data:'));
    const data = Object.assign({}, p, { featuresTxt: (p.features || []).join('\n'), imagesTxt: (p.images || []).filter((s) => !s.startsWith('data:')).join('\n') });
    openModal(id ? 'Modifier le bien' : 'Nouveau bien', `<form class="a-form" id="pform">${fields(PROP_SPEC, data)}
      <div class="full"><span class="f-lbl">Photos importées depuis l'appareil</span><div class="up-grid" id="upg"></div><label class="a-btn a-sm up-btn">${icon('upload')} Importer des photos<input type="file" accept="image/*" multiple hidden id="upf"></label><p class="muted small">Les photos sont compressées automatiquement. Astuce : cliquez sur la carte ci-dessous pour placer le bien.</p></div>
      <div class="full"><span class="f-lbl">Position sur la carte</span><div id="pmap" class="a-map"></div></div>
      <div class="a-form-foot full"><button type="button" class="a-btn" data-close>Annuler</button><button class="a-btn a-primary">Enregistrer</button></div></form>`, (body) => {
      const drawUp = () => { qs('#upg', body).innerHTML = uploaded.map((s, i) => `<div class="up-item"><img src="${s}" alt=""><button type="button" data-rm="${i}">${icon('close')}</button></div>`).join(''); };
      drawUp();
      qs('#upg', body).addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { uploaded.splice(+b.dataset.rm, 1); drawUp(); } });
      qs('#upf', body).addEventListener('change', async (e) => { for (const f of e.target.files) { try { uploaded.push(await compress(f)); } catch (er) { toast('Image illisible', 'err'); } } drawUp(); e.target.value = ''; });
      qs('[data-close]', body).onclick = closeModal;
      if (window.L) {
        const lat = qs('[name=lat]', body), lng = qs('[name=lng]', body);
        const map = L.map(qs('#pmap', body)).setView([+lat.value || 6.45, +lng.value || 2.35], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        const mk = L.marker([+lat.value || 6.45, +lng.value || 2.35], { draggable: true }).addTo(map);
        const set = (ll) => { lat.value = ll.lat.toFixed(5); lng.value = ll.lng.toFixed(5); mk.setLatLng(ll); };
        map.on('click', (e) => set(e.latlng)); mk.on('dragend', () => set(mk.getLatLng()));
        setTimeout(() => map.invalidateSize(), 250);
      }
      qs('#pform', body).addEventListener('submit', (e) => {
        e.preventDefault();
        const o = readForm(e.target, PROP_SPEC);
        o.features = o.featuresTxt.split('\n').map((s) => s.trim()).filter(Boolean);
        o.images = o.imagesTxt.split('\n').map((s) => s.trim()).filter(Boolean).concat(uploaded);
        delete o.featuresTxt; delete o.imagesTxt;
        if (o.width && o.depth && !o.surface) o.surface = o.width * o.depth;
        if (id) DB.update('properties', id, o);
        else { o.createdAt = new Date().toISOString().slice(0, 10); o.ref = o.ref || 'DSI-' + (o.transaction === 'location' ? 'LO' : o.category === 'parcelle' ? 'PA' : 'VI') + '-' + String(Date.now()).slice(-4); DB.insert('properties', o, o.transaction === 'location' ? 'L' : 'P'); }
        closeModal(); toast(id ? 'Bien modifié' : 'Bien ajouté et publié sur le site'); go('biens');
      });
    });
  }

  /* ---------------- Demandes ---------------- */
  const LEAD_STATUS = ['nouveau', 'en cours', 'traité', 'perdu'];
  function demandes() {
    action(`<button class="a-btn">${icon('download')} Exporter (CSV)</button>`, () => csv('demandes', DB.all('leads'), ['date', 'name', 'phone', 'email', 'subject', 'propertyId', 'message', 'status']));
    C().innerHTML = `<div class="a-toolbar"><div class="tabs" id="ltabs">${['tous', ...LEAD_STATUS].map((s, i) => `<button data-s="${s}" class="${i ? '' : 'active'}">${s[0].toUpperCase() + s.slice(1)} <em>${s === 'tous' ? DB.all('leads').length : DB.all('leads').filter((l) => l.status === s).length}</em></button>`).join('')}</div></div><div id="llist" class="lead-list"></div>`;
    let filter = 'tous';
    const render = () => {
      const items = DB.all('leads').filter((l) => filter === 'tous' || l.status === filter).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      qs('#llist').innerHTML = items.length ? items.map((l) => {
        const p = l.propertyId && DB.find('properties', l.propertyId);
        const phone = (l.phone || '').replace(/\D/g, '');
        return `<article class="lead a-card"><div class="lead-head"><span class="avatar-s">${esc((l.name || '?')[0])}</span><div><b>${esc(l.name)}</b><small>${fdatetime(l.date)} · ${esc(l.subject)}</small></div>
          <select class="a-status st-${esc(l.status.replace(' ', '-'))}" data-ls="${esc(l.id)}">${LEAD_STATUS.map((s) => `<option ${s === l.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          ${p ? `<a class="lead-prop" href="bien.html?id=${encodeURIComponent(p.id)}" target="_blank">${img(p.images?.[0], '')}<span><b>${esc(p.title)}</b><small>${esc(p.ref)} · ${fcfa(p.price)}</small></span></a>` : ''}
          ${l.message ? `<p class="lead-msg">${esc(l.message)}</p>` : ''}
          ${l.preferredDate || l.budget ? `<p class="small muted">${l.budget ? 'Type : ' + esc(l.budget) + ' · ' : ''}${l.preferredDate ? 'Précision : ' + esc(l.preferredDate.includes('T') ? fdatetime(l.preferredDate) : l.preferredDate) : ''}</p>` : ''}
          <div class="lead-acts"><a class="a-btn a-sm a-wa" target="_blank" rel="noopener" href="https://wa.me/${esc(phone)}?text=${encodeURIComponent(`Bonjour ${l.name}, ici Shalom Immo suite à votre demande${p ? ' pour « ' + p.title + ' »' : ''}.`)}">${icon('whatsapp')} WhatsApp</a><a class="a-btn a-sm" href="tel:${esc(l.phone)}">${icon('phone')} ${esc(l.phone)}</a>${l.email ? `<a class="a-btn a-sm" href="mailto:${esc(l.email)}">${icon('mail')}</a>` : ''}
          <button class="a-btn a-sm" data-visit="${esc(l.id)}">${icon('calendar')} Planifier visite</button><button class="a-btn a-sm" data-client="${esc(l.id)}">${icon('users')} Ajouter aux clients</button><button class="a-icon danger" data-ldel="${esc(l.id)}">${icon('trash')}</button></div></article>`;
      }).join('') : '<div class="a-empty">Aucune demande dans cette catégorie.</div>';
    };
    qs('#ltabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.s; qsa('#ltabs button').forEach((x) => x.classList.toggle('active', x === b)); render(); });
    C().onchange = ((e) => { const s = e.target.closest('[data-ls]'); if (s) { DB.update('leads', s.dataset.ls, { status: s.value }); s.className = 'a-status st-' + s.value.replace(' ', '-'); counts(); toast('Statut mis à jour'); } });
    C().onclick = ((e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.ldel && confirmDel('cette demande')) { DB.remove('leads', b.dataset.ldel); render(); counts(); }
      if (b.dataset.client) { const l = DB.find('leads', b.dataset.client); if (DB.all('clients').some((c) => c.phone === l.phone)) { toast('Ce client existe déjà'); return; } DB.insert('clients', { name: l.name, phone: l.phone, email: l.email, type: l.subject === 'Confier un bien' || l.subject === 'Gestion locative' ? 'Propriétaire' : 'Prospect', city: '', notes: l.message, createdAt: new Date().toISOString().slice(0, 10) }, 'C'); if (l.status === 'nouveau') DB.update('leads', l.id, { status: 'en cours' }); toast('Client ajouté'); render(); counts(); }
      if (b.dataset.visit) { const l = DB.find('leads', b.dataset.visit); editVisit(null, { client: l.name, phone: l.phone, propertyId: l.propertyId, date: l.preferredDate || '' }); }
    });
    render();
  }

  /* ---------------- Clients ---------------- */
  const CLIENT_TYPES = ['Prospect', 'Acheteur', 'Vendeur', 'Propriétaire', 'Locataire'];
  const CLIENT_SPEC = [['name', 'Nom complet *', 'text', 'req'], ['phone', 'Téléphone *', 'tel', 'req'], ['email', 'E-mail', 'email'], ['type', 'Type', 'select', CLIENT_TYPES], ['city', 'Ville / pays', 'text'], ['notes', 'Notes', 'textarea', 3]];
  function clients() {
    action(`<button class="a-btn">${icon('download')} CSV</button>`, () => csv('clients', DB.all('clients'), ['name', 'phone', 'email', 'type', 'city', 'notes', 'createdAt']));
    action(`<button class="a-btn a-primary">${icon('plus')} Nouveau client</button>`, () => editClient());
    C().innerHTML = `<div class="a-toolbar"><input type="search" id="cq" placeholder="Rechercher un client…"><select id="ct"><option value="">Tous les types</option>${CLIENT_TYPES.map((t) => `<option>${t}</option>`).join('')}</select></div><div id="clist"></div>`;
    const render = () => {
      const q = qs('#cq').value.toLowerCase(), t = qs('#ct').value;
      const items = DB.all('clients').filter((c) => (!t || c.type === t) && (!q || [c.name, c.phone, c.email, c.city, c.notes].join(' ').toLowerCase().includes(q)));
      qs('#clist').innerHTML = items.length ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th>Client</th><th>Contact</th><th>Type</th><th>Notes</th><th></th></tr></thead><tbody>${items.map((c) => `<tr><td><div class="who"><span class="avatar-s">${esc(c.name[0])}</span><span><b>${esc(c.name)}</b><small>${esc(c.city || '')} · depuis ${fdate(c.createdAt)}</small></span></div></td><td>${esc(c.phone)}<small>${esc(c.email || '')}</small></td><td><span class="pill pill-${esc(c.type)}">${esc(c.type)}</span></td><td class="notes">${esc(c.notes || '')}</td><td class="acts"><a class="a-icon" target="_blank" rel="noopener" href="https://wa.me/${esc(c.phone.replace(/\D/g, ''))}">${icon('whatsapp')}</a><button class="a-icon" data-cedit="${esc(c.id)}">${icon('edit')}</button><button class="a-icon danger" data-cdel="${esc(c.id)}">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="a-empty">Aucun client.</div>';
    };
    ['#cq', '#ct'].forEach((s) => qs(s).addEventListener('input', render));
    C().onclick = ((e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.cedit) editClient(b.dataset.cedit); if (b.dataset.cdel && confirmDel('ce client')) { DB.remove('clients', b.dataset.cdel); render(); } });
    render();
  }
  function editClient(id) {
    const c = id ? DB.find('clients', id) : { type: 'Prospect' };
    openModal(id ? 'Modifier le client' : 'Nouveau client', `<form class="a-form" id="cform">${fields(CLIENT_SPEC, c)}<div class="a-form-foot full"><button type="button" class="a-btn" data-close>Annuler</button><button class="a-btn a-primary">Enregistrer</button></div></form>`, (body) => {
      qs('[data-close]', body).onclick = closeModal;
      qs('#cform', body).addEventListener('submit', (e) => { e.preventDefault(); const o = readForm(e.target, CLIENT_SPEC); if (id) DB.update('clients', id, o); else DB.insert('clients', Object.assign(o, { createdAt: new Date().toISOString().slice(0, 10) }), 'C'); closeModal(); toast('Client enregistré'); go(current); });
    });
  }

  /* ---------------- Gestion locative ---------------- */
  function gestion() {
    action(`<button class="a-btn a-primary">${icon('plus')} Nouveau contrat</button>`, () => editRental());
    const rentals = DB.all('rentals');
    const mk = monthKey();
    const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return monthKey(d); });
    const expected = rentals.reduce((s, r) => s + r.rent, 0);
    const collected = rentals.filter((r) => r.payments?.[mk]).reduce((s, r) => s + r.rent, 0);
    const arrears = unpaidList().reduce((s, x) => s + x.r.rent, 0);
    const comm = rentals.filter((r) => r.payments?.[mk]).reduce((s, r) => s + r.rent * (r.commission || 0) / 100, 0);
    C().innerHTML = `<div class="kpis">
        <div class="kpi"><span>${icon('key')} Contrats actifs</span><b>${rentals.length}</b></div>
        <div class="kpi"><span>${icon('money')} Encaissé ce mois</span><b>${shortMoney(collected)}</b><small>sur ${fcfa(expected)}</small></div>
        <div class="kpi warn"><span>${icon('clock')} Impayés cumulés</span><b>${shortMoney(arrears)}</b><small>${unpaidList().length} échéance(s)</small></div>
        <div class="kpi"><span>${icon('chart')} Commission du mois</span><b>${shortMoney(comm)}</b><small>À reverser : ${fcfa(collected - comm)}</small></div></div>
      ${rentals.length ? rentals.map((r) => {
        const o = DB.find('clients', r.ownerId), t = DB.find('clients', r.tenantId);
        return `<article class="a-card rental"><div class="rental-head"><div><b>${esc(r.label)}</b><small>Depuis le ${fdate(r.startDate)} · échéance le ${r.dueDay} du mois · commission ${r.commission} %</small></div><div class="rental-rent">${fcfa(r.rent)}<small>/ mois</small></div>
          <div class="acts"><button class="a-icon" data-redit="${esc(r.id)}">${icon('edit')}</button><button class="a-icon danger" data-rdel="${esc(r.id)}">${icon('trash')}</button></div></div>
          <div class="rental-people"><span>${icon('home')} Propriétaire : <b>${esc(o?.name || '—')}</b></span><span>${icon('users')} Locataire : <b>${esc(t?.name || '—')}</b> ${t ? `<a target="_blank" rel="noopener" href="https://wa.me/${esc(t.phone.replace(/\D/g, ''))}">${icon('whatsapp')}</a>` : ''}</span></div>
          <div class="months">${months.map((m) => { const st = r.payments?.[m]; const before = m < (r.startDate || '').slice(0, 7); return `<button class="month ${before ? 'na' : st ? 'paid' : m <= mk ? 'late' : 'future'}" ${before ? 'disabled' : ''} data-pay="${esc(r.id)}" data-m="${m}"><small>${new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}</small>${before ? '—' : st ? icon('check') + 'Payé' : m <= mk ? 'Impayé' : 'À venir'}</button>`; }).join('')}</div>
          <p class="small muted">Cliquez sur un mois pour le marquer payé / impayé.</p></article>`;
      }).join('') : '<div class="a-empty">Aucun contrat de gestion. Ajoutez votre premier bien en gestion.</div>'}`;
    C().onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.pay) { const r = DB.find('rentals', b.dataset.pay); r.payments = r.payments || {}; r.payments[b.dataset.m] = !r.payments[b.dataset.m]; DB.save(); toast(r.payments[b.dataset.m] ? 'Paiement enregistré' : 'Paiement annulé'); gestion(); counts(); }
      if (b.dataset.redit) editRental(b.dataset.redit);
      if (b.dataset.rdel && confirmDel('ce contrat')) { DB.remove('rentals', b.dataset.rdel); gestion(); counts(); }
    };
  }
  function editRental(id) {
    const r = id ? DB.find('rentals', id) : { commission: 10, dueDay: 5, startDate: new Date().toISOString().slice(0, 10) };
    const cl = DB.all('clients').map((c) => [c.id, `${c.name} (${c.type})`]);
    const pr = [['', '— Aucun / hors catalogue —'], ...DB.all('properties').filter((p) => p.transaction === 'location').map((p) => [p.id, `${p.ref} – ${p.title}`])];
    const spec = [['label', 'Nom du bien géré *', 'text', 'req', 'full'], ['propertyId', 'Annonce liée', 'select', pr, 'full'], ['ownerId', 'Propriétaire', 'select', [['', '—'], ...cl]], ['tenantId', 'Locataire', 'select', [['', '—'], ...cl]], ['rent', 'Loyer mensuel (FCFA) *', 'number', 'req'], ['commission', 'Commission agence (%)', 'number'], ['startDate', 'Début du bail', 'date'], ['dueDay', 'Jour d\'échéance', 'number']];
    openModal(id ? 'Modifier le contrat' : 'Nouveau contrat de gestion', `<form class="a-form" id="rform">${fields(spec, r)}<p class="small muted full">Le propriétaire et le locataire doivent d'abord être créés dans « Clients ».</p><div class="a-form-foot full"><button type="button" class="a-btn" data-close>Annuler</button><button class="a-btn a-primary">Enregistrer</button></div></form>`, (body) => {
      qs('[data-close]', body).onclick = closeModal;
      qs('#rform', body).addEventListener('submit', (e) => {
        e.preventDefault(); const o = readForm(e.target, spec);
        if (!id) { o.payments = {}; const d = new Date(o.startDate || Date.now()); d.setDate(1); const now = new Date(); while (monthKey(d) <= monthKey(now)) { o.payments[monthKey(d)] = false; d.setMonth(d.getMonth() + 1); } DB.insert('rentals', o, 'G'); }
        else DB.update('rentals', id, o);
        if (o.propertyId) DB.update('properties', o.propertyId, { status: 'loué' });
        closeModal(); toast('Contrat enregistré'); gestion(); counts();
      });
    });
  }

  /* ---------------- Visites ---------------- */
  const VISIT_STATUS = ['planifiée', 'effectuée', 'annulée'];
  function visites() {
    action(`<button class="a-btn a-primary">${icon('plus')} Planifier une visite</button>`, () => editVisit());
    const items = DB.all('visits').slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    C().innerHTML = items.length ? `<div class="a-table-wrap"><table class="a-table"><thead><tr><th>Date</th><th>Client</th><th>Bien</th><th>Agent</th><th>Statut</th><th></th></tr></thead><tbody>${items.map((v) => { const p = DB.find('properties', v.propertyId); return `<tr><td><b>${fdatetime(v.date)}</b></td><td>${esc(v.client)}<small>${esc(v.phone || '')}</small></td><td>${p ? `<a href="bien.html?id=${encodeURIComponent(p.id)}" target="_blank">${esc(p.title)}</a><small>${esc(p.district)}, ${esc(p.city)}</small>` : '—'}</td><td>${esc(v.agent || '')}</td><td><select class="a-status st-${esc(v.status)}" data-vs="${esc(v.id)}">${VISIT_STATUS.map((s) => `<option ${s === v.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td class="acts">${v.phone ? `<a class="a-icon" target="_blank" rel="noopener" href="https://wa.me/${esc(v.phone.replace(/\D/g, ''))}?text=${encodeURIComponent(`Bonjour ${v.client}, nous vous confirmons votre visite le ${fdatetime(v.date)}${p ? ' pour « ' + p.title + ' »' : ''}. – Shalom Immo`)}" title="Confirmer par WhatsApp">${icon('whatsapp')}</a>` : ''}<button class="a-icon" data-vedit="${esc(v.id)}">${icon('edit')}</button><button class="a-icon danger" data-vdel="${esc(v.id)}">${icon('trash')}</button></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="a-empty">Aucune visite planifiée.</div>';
    C().onchange = (e) => { const s = e.target.closest('[data-vs]'); if (s) { DB.update('visits', s.dataset.vs, { status: s.value }); s.className = 'a-status st-' + s.value; toast('Visite mise à jour'); } };
    C().onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.vedit) editVisit(b.dataset.vedit); if (b.dataset.vdel && confirmDel('cette visite')) { DB.remove('visits', b.dataset.vdel); visites(); } };
  }
  function editVisit(id, preset) {
    const v = id ? DB.find('visits', id) : Object.assign({ status: 'planifiée', agent: '' }, preset || {});
    const pr = [['', '—'], ...DB.all('properties').map((p) => [p.id, `${p.ref} – ${p.title}`])];
    const spec = [['date', 'Date et heure *', 'datetime-local', 'req'], ['propertyId', 'Bien', 'select', pr], ['client', 'Client *', 'text', 'req'], ['phone', 'Téléphone', 'tel'], ['agent', 'Agent', 'text'], ['status', 'Statut', 'select', VISIT_STATUS]];
    openModal(id ? 'Modifier la visite' : 'Planifier une visite', `<form class="a-form" id="vform">${fields(spec, v)}<div class="a-form-foot full"><button type="button" class="a-btn" data-close>Annuler</button><button class="a-btn a-primary">Enregistrer</button></div></form>`, (body) => {
      qs('[data-close]', body).onclick = closeModal;
      qs('#vform', body).addEventListener('submit', (e) => { e.preventDefault(); const o = readForm(e.target, spec); if (id) DB.update('visits', id, o); else DB.insert('visits', o, 'V'); closeModal(); toast('Visite enregistrée'); go('visites'); });
    });
  }

  /* ---------------- Paramètres ---------------- */
  function parametres() {
    const s = DB.settings();
    const spec = [['name', 'Nom de l\'agence', 'text', '', 'full'], ['slogan', 'Slogan', 'text', '', 'full'], ['phone', 'Téléphone affiché', 'text'], ['whatsapp', 'Numéro WhatsApp (chiffres, avec indicatif)', 'text'], ['email', 'E-mail', 'email'], ['address', 'Adresse', 'text'], ['hours', 'Horaires', 'text'], ['facebook', 'Lien Facebook', 'url'], ['instagram', 'Lien Instagram', 'url'], ['tiktok', 'Lien TikTok', 'url'], ['lat', 'Latitude de l\'agence', 'number'], ['lng', 'Longitude de l\'agence', 'number']];
    C().innerHTML = `<div class="a-grid">
      <section class="a-card wide"><h3>Informations de l'agence</h3><form class="a-form" id="sform">${fields(spec, s)}<div class="a-form-foot full"><button class="a-btn a-primary">Enregistrer</button></div></form></section>
      <section class="a-card"><h3>Sécurité</h3><form class="a-form one" id="pwform"><label>Identifiant<input name="user" value="${esc(s.adminUser || DEFAULT_USER)}" required></label><label>Nouveau mot de passe<input name="pass" type="password" minlength="6" required></label><button class="a-btn a-primary">Changer le mot de passe</button></form></section>
      <section class="a-card"><h3>Sauvegarde des données</h3><p class="muted small">Exportez régulièrement une copie de vos données. Vous pouvez la réimporter sur un autre appareil.</p>
        <div class="stack"><button class="a-btn" id="exp">${icon('download')} Exporter la sauvegarde (.json)</button><label class="a-btn">${icon('upload')} Importer une sauvegarde<input type="file" accept="application/json" hidden id="imp"></label><button class="a-btn danger" id="rst">${icon('trash')} Réinitialiser les données de démo</button></div></section></div>`;
    qs('#sform').addEventListener('submit', (e) => { e.preventDefault(); DB.saveSettings(readForm(e.target, spec)); toast('Paramètres enregistrés'); });
    qs('#pwform').addEventListener('submit', async (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target).entries()); DB.saveSettings({ adminUser: f.user, adminPassHash: await sha(f.pass) }); e.target.pass.value = ''; toast('Mot de passe modifié'); });
    qs('#exp').onclick = () => download(`sauvegarde-shalom-immo-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(DB.state, null, 2), 'application/json');
    qs('#imp').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.properties) throw 0; DB.replaceAll(d); toast('Sauvegarde importée'); go('dashboard'); } catch (er) { toast('Fichier invalide', 'err'); } }; r.readAsText(f); };
    qs('#rst').onclick = () => { if (confirm('Remettre toutes les données de démonstration ? Vos modifications seront perdues.')) { DB.reset(); toast('Données réinitialisées'); go('dashboard'); } };
  }

  /* ---------------- Export ---------------- */
  function download(name, content, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function csv(name, rows, cols) {
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    download(`${name}-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => q(r[c])).join(';'))].join('\n'), 'text/csv;charset=utf-8');
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !qs('.a-modal')?.hidden) closeModal(); });
  logged() ? shell() : login();
})();
