/* =========================================================
   DJIDONOU SHALOM IMMO — Centre de pilotage (administration)
   Organise le travail : tâches du jour, suivi des clients,
   agenda des visites, biens, clients, gestion locative.
   Version démo : données dans le navigateur (voir README).
   ========================================================= */
(function () {
  const { DB, fcfa, shortMoney, esc, icon, img, CATEGORIES, STATUS, toast, qs, qsa, fdate, fdatetime } = window.DSI;
  const SESSION = 'dsi_admin_session';
  const app = qs('#admin');
  const DEFAULT_USER = 'admin', DEFAULT_PASS = 'shalom2026';

  /* ================= Données : migration ================= */
  const st = DB.state;
  st.tasks = st.tasks || [];
  st.activity = st.activity || [];
  const STAGES = [
    ['nouveau', 'Nouveau', 'inbox'],
    ['contacté', 'Contacté', 'phone'],
    ['visite', 'Visite prévue', 'calendar'],
    ['négociation', 'Négociation', 'handshake'],
    ['conclu', 'Conclu', 'check'],
    ['perdu', 'Perdu', 'close'],
  ];
  const STAGE_MAP = { 'en cours': 'contacté', 'traité': 'conclu' };
  st.leads.forEach((l) => { if (STAGE_MAP[l.status]) l.status = STAGE_MAP[l.status]; if (!STAGES.some((s) => s[0] === l.status)) l.status = 'nouveau'; });
  if (!st.activity.length) {
    st.activity = [
      { id: 'A-1', date: '2026-11-06T10:24', icon: 'inbox', text: 'Nouvelle demande de visite de Jean-Marc Dossou' },
      { id: 'A-2', date: '2026-11-05T16:02', icon: 'phone', text: 'Grace Ahouansou contactée au sujet de l\'appartement meublé' },
      { id: 'A-3', date: '2026-11-04T09:15', icon: 'key', text: 'Paul Zinsou souhaite confier une maison en gestion' },
    ];
  }
  DB.save();

  const log = (text, ic = 'check') => { st.activity.unshift({ id: DB.uid('A'), date: new Date().toISOString().slice(0, 16), icon: ic, text }); st.activity = st.activity.slice(0, 60); DB.save(); };

  /* ================= Utilitaires ================= */
  async function sha(s) {
    if (window.crypto && crypto.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
    return 'plain:' + s;
  }
  const logged = () => { try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } };
  const digits = (p) => String(p || '').replace(/\D/g, '');
  const wa = (phone, text = '') => `https://wa.me/${digits(phone)}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const todayKey = () => dayKey(new Date());
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const startOfWeek = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
  const timeOf = (s) => (s && s.includes('T') ? s.slice(11, 16) : '');
  const ago = (s) => {
    const diff = (Date.now() - new Date(s).getTime()) / 60000;
    if (isNaN(diff)) return '';
    if (diff < 1) return "à l'instant"; if (diff < 60) return `il y a ${Math.round(diff)} min`;
    if (diff < 1440) return `il y a ${Math.round(diff / 60)} h`; const d = Math.round(diff / 1440);
    return d === 1 ? 'hier' : d < 30 ? `il y a ${d} j` : fdate(s);
  };
  const monthName = (m, opt = { month: 'long' }) => new Date(m + '-01T12:00').toLocaleDateString('fr-FR', opt);
  const prop = (id) => id && DB.find('properties', id);
  const client = (id) => id && DB.find('clients', id);
  const initials = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const confirmDel = (what) => confirm(`Supprimer ${what} ? Cette action est définitive.`);
  const countUp = (root) => qsa('[data-to]', root).forEach((el) => {
    const to = +el.dataset.to, fmt = el.dataset.fmt, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 900), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = fmt === 'money' ? shortMoney(Math.round(v)) : Math.round(v).toLocaleString('fr-FR'); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  function unpaidList() {
    const mk = monthKey(), out = [];
    DB.all('rentals').forEach((r) => Object.entries(r.payments || {}).forEach(([m, paid]) => { if (!paid && m <= mk) out.push({ r, m }); }));
    return out;
  }

  /* ================= Connexion ================= */
  function login() {
    document.body.classList.remove('a-in');
    app.innerHTML = `<div class="login-wrap"><div class="blob b1"></div><div class="blob b2"></div>
      <form class="login-card" id="login">
        <img class="login-logo" src="assets/img/logo.png" alt="DJIDONOU SHALOM IMMO">
        <h1>Centre de pilotage</h1><p class="muted">Connectez-vous pour gérer l'agence</p>
        <label>Identifiant<input name="user" autocomplete="username" required></label>
        <label>Mot de passe<input name="pass" type="password" autocomplete="current-password" required></label>
        <button class="a-btn a-primary a-lg">Se connecter ${icon('arrow')}</button>
        <p class="login-hint">Démo : <b>admin</b> / <b>shalom2026</b></p>
        <a href="index.html" class="muted small">← Retour au site</a></form></div>`;
    qs('#login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target).entries()), s = DB.settings();
      const ok = f.user === (s.adminUser || DEFAULT_USER) && (s.adminPassHash ? (await sha(f.pass)) === s.adminPassHash : f.pass === DEFAULT_PASS);
      if (!ok) { qs('.login-card').classList.add('shake'); setTimeout(() => qs('.login-card')?.classList.remove('shake'), 500); toast('Identifiant ou mot de passe incorrect', 'err'); return; }
      try { sessionStorage.setItem(SESSION, '1'); } catch (er) {}
      shell();
    });
  }

  /* ================= Structure ================= */
  const VIEWS = [
    ['today', "Aujourd'hui", 'home'],
    ['pipeline', 'Suivi clients', 'users'],
    ['agenda', 'Agenda', 'calendar'],
    ['biens', 'Biens', 'map'],
    ['clients', 'Clients', 'users'],
    ['gestion', 'Gestion locative', 'key'],
    ['parametres', 'Paramètres', 'settings'],
  ];
  const TABS = ['today', 'pipeline', 'agenda', 'biens'];
  let current = 'today';

  function shell() {
    document.body.classList.add('a-in');
    app.innerHTML = `<div class="a-layout">
      <aside class="a-side">
        <a href="index.html" class="a-brand" title="Voir le site"><img src="assets/img/logo-light.png" alt="DJIDONOU SHALOM IMMO"></a>
        <span class="a-side-label">Pilotage</span>
        <nav>${VIEWS.map(([k, t, i]) => `<button data-view="${k}">${icon(i)}<span>${t}</span><em data-badge="${k}"></em></button>`).join('')}</nav>
        <div class="a-side-card"><b>Besoin d'aide ?</b><span>Exportez régulièrement vos données dans Paramètres.</span></div>
        <div class="a-side-foot"><a href="index.html" target="_blank">${icon('eye')}<span>Voir le site</span></a><button data-logout>${icon('logout')}<span>Déconnexion</span></button></div>
      </aside>
      <div class="a-main">
        <header class="a-top">
          <img class="a-top-logo" src="assets/img/logo.png" alt="DS Immobilier">
          <div class="a-top-title"><small id="a-crumb">Centre de pilotage</small><h1 id="a-title"></h1></div>
          <div class="a-top-actions">
            <button class="a-round" id="a-search-btn" title="Rechercher (Ctrl+K)">${icon('search')}</button>
            <button class="a-round" id="a-bell" title="Alertes">${icon('inbox')}<i class="a-dot" hidden></i></button>
            <button class="a-btn a-primary hide-sm" id="a-new">${icon('plus')} Nouveau</button>
          </div>
        </header>
        <div class="a-content" id="a-content"></div>
      </div>
      <nav class="a-tabbar">${TABS.map((k) => { const v = VIEWS.find((x) => x[0] === k); return `<button data-view="${k}">${icon(v[2])}<span>${v[1]}</span><em data-badge="${k}"></em></button>`; }).join('')}<button data-more>${icon('menu')}<span>Plus</span></button></nav>
      <button class="a-fab" id="a-fab" aria-label="Nouveau">${icon('plus')}</button>
    </div>
    <div class="a-sheet" hidden><div class="a-sheet-box"><div class="a-sheet-grip"></div><div class="a-sheet-body"></div></div></div>
    <div class="a-modal" hidden><div class="a-modal-box"><header><h2></h2><button class="a-x" aria-label="Fermer">${icon('close')}</button></header><div class="a-modal-body"></div></div></div>`;

    qsa('[data-view]').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
    qs('[data-logout]').onclick = () => { try { sessionStorage.removeItem(SESSION); } catch (e) {} login(); };
    qs('[data-more]').onclick = () => sheet(`<h3>Menu</h3><div class="sheet-grid">${VIEWS.map(([k, t, i]) => `<button data-sv="${k}">${icon(i)}<span>${t}</span></button>`).join('')}<a href="index.html" target="_blank">${icon('eye')}<span>Voir le site</span></a><button data-sl>${icon('logout')}<span>Déconnexion</span></button></div>`, (b) => {
      qsa('[data-sv]', b).forEach((x) => (x.onclick = () => { closeSheet(); go(x.dataset.sv); }));
      qs('[data-sl]', b).onclick = () => { closeSheet(); qs('[data-logout]').click(); };
    });
    qs('#a-new').onclick = quickAdd; qs('#a-fab').onclick = quickAdd;
    qs('#a-bell').onclick = alerts; qs('#a-search-btn').onclick = search;
    qs('.a-modal .a-x').onclick = closeModal;
    qs('.a-modal').addEventListener('click', (e) => { if (e.target.classList.contains('a-modal')) closeModal(); });
    qs('.a-sheet').addEventListener('click', (e) => { if (e.target.classList.contains('a-sheet')) closeSheet(); });
    const h = location.hash.slice(1);
    go(VIEWS.some((v) => v[0] === h) ? h : 'today');
  }

  function badges() {
    const n = DB.all('leads').filter((l) => l.status === 'nouveau').length;
    const u = unpaidList().length;
    const tv = DB.all('visits').filter((v) => v.status === 'planifiée' && (v.date || '').startsWith(todayKey())).length;
    const set = (k, v) => qsa(`[data-badge="${k}"]`).forEach((e) => (e.textContent = v || ''));
    set('pipeline', n); set('gestion', u); set('agenda', tv); set('today', autoTasks().length || '');
    const dot = qs('#a-bell .a-dot'); if (dot) dot.hidden = !(n + u + tv);
  }

  function go(v) {
    current = v;
    try { history.replaceState(null, '', '#' + v); } catch (e) {}
    qsa('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    const meta = VIEWS.find((x) => x[0] === v);
    qs('#a-title').textContent = meta[1];
    const C = qs('#a-content'); C.onclick = null; C.onchange = null; C.oninput = null;
    C.classList.remove('view-in'); void C.offsetWidth; C.classList.add('view-in');
    ({ today, pipeline, agenda, biens, clients, gestion, parametres })[v](C);
    badges(); countUp(C);
    window.scrollTo({ top: 0 });
  }
  const refresh = () => go(current);

  /* ================= Fenêtres ================= */
  function openModal(title, html, onReady) {
    const m = qs('.a-modal'); qs('h2', m).textContent = title; qs('.a-modal-body', m).innerHTML = html; m.hidden = false; document.body.classList.add('a-lock');
    requestAnimationFrame(() => m.classList.add('open'));
    onReady && onReady(qs('.a-modal-body', m));
  }
  function closeModal() { const m = qs('.a-modal'); if (!m) return; m.classList.remove('open'); m.hidden = true; document.body.classList.remove('a-lock'); }
  function sheet(html, onReady) {
    const s = qs('.a-sheet'); qs('.a-sheet-body', s).innerHTML = html; s.hidden = false; document.body.classList.add('a-lock');
    requestAnimationFrame(() => s.classList.add('open'));
    onReady && onReady(qs('.a-sheet-body', s));
  }
  function closeSheet() { const s = qs('.a-sheet'); if (!s) return; s.classList.remove('open'); document.body.classList.remove('a-lock'); setTimeout(() => (s.hidden = true), 250); }

  function quickAdd() {
    sheet(`<h3>Que voulez-vous ajouter ?</h3><div class="sheet-grid big">
      <button data-q="bien">${icon('home')}<span>Un bien</span></button>
      <button data-q="visite">${icon('calendar')}<span>Une visite</span></button>
      <button data-q="client">${icon('users')}<span>Un client</span></button>
      <button data-q="demande">${icon('inbox')}<span>Une demande</span></button>
      <button data-q="contrat">${icon('key')}<span>Un contrat de gestion</span></button>
      <button data-q="tache">${icon('check')}<span>Une tâche</span></button></div>`, (b) => {
      qsa('[data-q]', b).forEach((x) => (x.onclick = () => { closeSheet(); ({ bien: () => editProperty(), visite: () => editVisit(), client: () => editClient(), demande: () => editLead(), contrat: () => editRental(), tache: () => editTask() })[x.dataset.q](); }));
    });
  }

  function alerts() {
    const items = autoTasks();
    sheet(`<h3>Alertes <small class="muted">${items.length}</small></h3>${items.length ? `<div class="task-list compact">${items.slice(0, 8).map(taskHTML).join('')}</div>` : '<p class="muted">Rien à signaler, tout est à jour ✔</p>'}<button class="a-btn a-block" data-goto-today>Voir toutes les tâches</button>`, (b) => {
      bindTasks(b, () => { closeSheet(); refresh(); });
      qs('[data-goto-today]', b).onclick = () => { closeSheet(); go('today'); };
    });
  }

  function search() {
    sheet(`<div class="a-search"><span>${icon('search')}</span><input id="sq" placeholder="Rechercher un bien, un client, une demande…" autocomplete="off"></div><div id="sres" class="sres"></div>`, (b) => {
      const inp = qs('#sq', b), out = qs('#sres', b);
      const run = () => {
        const q = inp.value.trim().toLowerCase();
        if (q.length < 2) { out.innerHTML = '<p class="muted small">Tapez au moins 2 lettres.</p>'; return; }
        const m = (o, keys) => keys.some((k) => String(o[k] || '').toLowerCase().includes(q));
        const P = DB.all('properties').filter((p) => m(p, ['title', 'ref', 'city', 'district'])).slice(0, 5);
        const Cl = DB.all('clients').filter((c) => m(c, ['name', 'phone', 'email'])).slice(0, 5);
        const L = DB.all('leads').filter((l) => m(l, ['name', 'phone', 'message', 'subject'])).slice(0, 5);
        out.innerHTML = (P.length ? `<h4>Biens</h4>${P.map((p) => `<button class="sr" data-p="${esc(p.id)}">${img(p.images?.[0], '')}<span><b>${esc(p.title)}</b><small>${esc(p.ref)} · ${fcfa(p.price)}</small></span></button>`).join('')}` : '')
          + (Cl.length ? `<h4>Clients</h4>${Cl.map((c) => `<button class="sr" data-c="${esc(c.id)}"><i class="av">${esc(initials(c.name))}</i><span><b>${esc(c.name)}</b><small>${esc(c.type)} · ${esc(c.phone)}</small></span></button>`).join('')}` : '')
          + (L.length ? `<h4>Demandes</h4>${L.map((l) => `<button class="sr" data-l="${esc(l.id)}"><i class="av">${esc(initials(l.name))}</i><span><b>${esc(l.name)}</b><small>${esc(l.subject)} · ${ago(l.date)}</small></span></button>`).join('')}` : '')
          || '<p class="muted">Aucun résultat.</p>';
      };
      inp.addEventListener('input', run); run(); setTimeout(() => inp.focus(), 100);
      out.onclick = (e) => { const s = e.target.closest('.sr'); if (!s) return; closeSheet(); if (s.dataset.p) editProperty(s.dataset.p); if (s.dataset.c) editClient(s.dataset.c); if (s.dataset.l) leadDetail(s.dataset.l); };
    });
  }

  /* ================= Formulaires ================= */
  function fields(spec, data = {}) {
    return spec.map(([n, l, t = 'text', opts, cls = '']) => {
      const v = data[n] ?? '';
      if (t === 'section') return `<h3 class="f-sec">${esc(l)}</h3>`;
      if (t === 'select') return `<label class="${cls}">${esc(l)}<select name="${n}">${opts.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select></label>`;
      if (t === 'textarea') return `<label class="${cls || 'full'}">${esc(l)}<textarea name="${n}" rows="${opts || 3}">${esc(v)}</textarea></label>`;
      if (t === 'checkbox') return `<label class="a-check ${cls}"><input type="checkbox" name="${n}" ${v ? 'checked' : ''}> <span>${esc(l)}</span></label>`;
      return `<label class="${cls}">${esc(l)}<input name="${n}" type="${t}" value="${esc(v)}" ${t === 'number' ? 'step="any" inputmode="decimal"' : ''} ${opts === 'req' ? 'required' : ''}></label>`;
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
  const formFoot = (del) => `<div class="a-form-foot full">${del ? `<button type="button" class="a-btn danger" data-del>${icon('trash')} Supprimer</button>` : ''}<span class="grow"></span><button type="button" class="a-btn" data-close>Annuler</button><button class="a-btn a-primary">Enregistrer</button></div>`;
  function simpleForm(title, spec, data, onSave, onDelete) {
    openModal(title, `<form class="a-form">${fields(spec, data)}${formFoot(!!onDelete)}</form>`, (body) => {
      qs('[data-close]', body).onclick = closeModal;
      if (onDelete) qs('[data-del]', body).onclick = () => { if (confirmDel('cet élément')) { onDelete(); closeModal(); refresh(); } };
      qs('form', body).addEventListener('submit', (e) => { e.preventDefault(); onSave(readForm(e.target, spec)); closeModal(); refresh(); });
    });
  }

  /* ================= Tâches automatiques ================= */
  function autoTasks() {
    const out = [], now = Date.now(), tk = todayKey(), tomorrow = dayKey(addDays(new Date(), 1));
    DB.all('leads').filter((l) => l.status === 'nouveau').forEach((l) => {
      const old = (now - new Date(l.date).getTime()) / 3.6e6 > 24, p = prop(l.propertyId);
      out.push({ key: 'lead:' + l.id, prio: old ? 'urgent' : 'today', icon: 'phone', title: `Rappeler ${l.name}`, sub: `${l.subject}${p ? ' · ' + p.title : ''} · ${ago(l.date)}`, phone: l.phone, waText: `Bonjour ${l.name}, ici DJIDONOU SHALOM IMMO suite à votre demande${p ? ' pour « ' + p.title + ' »' : ''}.`, done: 'Marquer contacté', open: { lead: l.id } });
    });
    DB.all('visits').filter((v) => v.status === 'planifiée' && v.date).forEach((v) => {
      const d = v.date.slice(0, 10), p = prop(v.propertyId);
      if (d < tk) out.push({ key: 'visit:' + v.id, prio: 'urgent', icon: 'calendar', title: `Visite passée à clôturer : ${v.client}`, sub: `${fdatetime(v.date)}${p ? ' · ' + p.title : ''}`, phone: v.phone, done: 'Visite effectuée', open: { visit: v.id } });
      else if (d === tk || d === tomorrow) out.push({ key: 'visit:' + v.id, prio: 'today', icon: 'calendar', title: `${d === tk ? 'Aujourd\'hui' : 'Demain'} ${timeOf(v.date)} · visite avec ${v.client}`, sub: p ? `${p.title} · ${p.district}` : 'Bien à préciser', phone: v.phone, waText: `Bonjour ${v.client}, nous vous confirmons votre visite ${d === tk ? "aujourd'hui" : 'demain'} à ${timeOf(v.date)}${p ? ' pour « ' + p.title + ' »' : ''}. – DJIDONOU SHALOM IMMO`, done: 'Visite effectuée', open: { visit: v.id } });
    });
    unpaidList().forEach(({ r, m }) => {
      const t = client(r.tenantId), late = m < monthKey() || new Date().getDate() > (r.dueDay || 5);
      out.push({ key: `rent:${r.id}:${m}`, prio: late ? 'urgent' : 'week', icon: 'money', title: `Loyer ${monthName(m)} · ${r.label}`, sub: `${t ? t.name + ' · ' : ''}${fcfa(r.rent)}${late ? ' · en retard' : ''}`, phone: t?.phone, waText: t ? `Bonjour ${t.name}, petit rappel : le loyer de ${monthName(m)} (${fcfa(r.rent)}) pour « ${r.label} » est attendu. Merci. – DJIDONOU SHALOM IMMO` : '', done: 'Loyer reçu' });
    });
    DB.all('properties').filter((p) => p.status === 'disponible' && !(p.images || []).length).forEach((p) => out.push({ key: 'photo:' + p.id, prio: 'week', icon: 'upload', title: `Ajouter des photos : ${p.title}`, sub: 'Une annonce avec photos reçoit bien plus de demandes', done: null, open: { prop: p.id } }));
    DB.all('tasks').filter((t) => !t.done).forEach((t) => {
      const prio = t.due && t.due < tk ? 'urgent' : t.due === tk || !t.due ? 'today' : t.prio === 'urgent' ? 'urgent' : 'week';
      out.push({ key: 'task:' + t.id, prio: t.prio === 'urgent' ? 'urgent' : prio, icon: 'check', title: t.title, sub: `${t.due ? 'Échéance : ' + fdate(t.due) : 'Tâche'}${t.note ? ' · ' + t.note : ''}`, done: 'Terminé', manual: true });
    });
    const order = { urgent: 0, today: 1, week: 2 };
    return out.sort((a, b) => order[a.prio] - order[b.prio]);
  }
  const PRIO = { urgent: ['Urgent', 'red'], today: ["Aujourd'hui", 'blue'], week: ['Cette semaine', 'gray'] };
  function taskHTML(t) {
    return `<div class="task prio-${t.prio}" data-key="${esc(t.key)}">
      <button class="task-check" ${t.done ? `data-done title="${esc(t.done)}"` : 'disabled'} aria-label="${esc(t.done || '')}">${icon('check')}</button>
      <div class="task-ico">${icon(t.icon)}</div>
      <div class="task-txt"><b>${esc(t.title)}</b><small>${esc(t.sub)}</small></div>
      <div class="task-acts">${t.phone ? `<a class="a-round sm wa" target="_blank" rel="noopener" href="${wa(t.phone, t.waText)}" title="WhatsApp">${icon('whatsapp')}</a><a class="a-round sm" href="tel:${esc(digits(t.phone) ? '+' + digits(t.phone) : '')}" title="Appeler">${icon('phone')}</a>` : ''}${t.open ? `<button class="a-round sm" data-open title="Ouvrir">${icon('arrow')}</button>` : ''}</div></div>`;
  }
  function completeTask(key) {
    const [type, id, m] = key.split(':');
    if (type === 'lead') { DB.update('leads', id, { status: 'contacté' }); log(`${DB.find('leads', id)?.name} contacté(e)`, 'phone'); }
    if (type === 'visit') { DB.update('visits', id, { status: 'effectuée' }); log(`Visite avec ${DB.find('visits', id)?.client} effectuée`, 'calendar'); }
    if (type === 'rent') { const r = DB.find('rentals', id); r.payments[m] = true; DB.save(); log(`Loyer ${monthName(m)} reçu · ${r.label}`, 'money'); }
    if (type === 'task') { DB.update('tasks', id, { done: true }); log(`Tâche terminée : ${DB.find('tasks', id)?.title}`, 'check'); }
  }
  function bindTasks(root, after) {
    root.addEventListener('click', (e) => {
      const tEl = e.target.closest('.task'); if (!tEl) return;
      const key = tEl.dataset.key;
      if (e.target.closest('[data-done]')) { tEl.classList.add('done'); setTimeout(() => { completeTask(key); toast('Bien joué ! Tâche terminée'); after(); }, 450); }
      if (e.target.closest('[data-open]')) { const t = autoTasks().find((x) => x.key === key); if (!t) return; if (t.open.lead) leadDetail(t.open.lead); if (t.open.visit) editVisit(t.open.visit); if (t.open.prop) editProperty(t.open.prop); }
    });
  }

  /* ================= Vue : Aujourd'hui ================= */
  function today(C) {
    const s = DB.settings(), now = new Date(), h = now.getHours();
    const leads = DB.all('leads'), visits = DB.all('visits'), props = DB.all('properties'), rentals = DB.all('rentals');
    const tasks = autoTasks(), urgent = tasks.filter((t) => t.prio === 'urgent').length;
    const pending = leads.filter((l) => ['nouveau', 'contacté', 'visite', 'négociation'].includes(l.status)).length;
    const wk0 = startOfWeek(now), wk1 = addDays(wk0, 7);
    const weekVisits = visits.filter((v) => v.status !== 'annulée' && v.date && new Date(v.date) >= wk0 && new Date(v.date) < wk1).length;
    const mk = monthKey(), expected = rentals.reduce((a, r) => a + r.rent, 0), collected = rentals.filter((r) => r.payments?.[mk]).reduce((a, r) => a + r.rent, 0);
    const pct = expected ? Math.round(collected / expected * 100) : 0;
    const avail = props.filter((p) => p.status === 'disponible').length;
    const todayVisits = visits.filter((v) => v.status === 'planifiée' && (v.date || '').startsWith(todayKey())).length;
    const hello = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';

    // Services de l'agence
    const parcels = props.filter((p) => p.category === 'parcelle');
    const svc = [
      ['key', 'Gestion locative', `${rentals.length} contrat${rentals.length > 1 ? 's' : ''}`, `${fcfa(expected)} / mois`, 'gestion'],
      ['map', 'Vente de parcelles', `${parcels.filter((p) => p.status === 'disponible').length} disponibles`, `${parcels.filter((p) => p.status === 'vendu').length} vendue(s)`, 'biens'],
      ['handshake', 'Achat & vente', `${leads.filter((l) => ['Offre', 'Mise en vente', 'Estimation'].includes(l.subject)).length} dossier(s)`, `${props.filter((p) => p.transaction === 'vente' && p.category !== 'parcelle').length} maison(s) en vente`, 'pipeline'],
      ['home', 'Locations', `${props.filter((p) => p.transaction === 'location' && p.status === 'disponible').length} à louer`, `${props.filter((p) => p.status === 'loué').length} loué(s)`, 'biens'],
    ];
    // Entonnoir
    const funnel = STAGES.map(([k, t]) => [k, t, leads.filter((l) => l.status === k).length]);
    const maxF = Math.max(1, ...funnel.map((f) => f[2]));

    C.innerHTML = `
      <section class="hello">
        <div class="hello-txt"><span class="hello-date">${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · <b id="clock">${pad(h)}:${pad(now.getMinutes())}</b></span>
          <h2>${hello} 👋</h2>
          <p>${tasks.length ? `Vous avez <b>${tasks.length} tâche${tasks.length > 1 ? 's' : ''}</b> à traiter${urgent ? `, dont <b class="red">${urgent} urgente${urgent > 1 ? 's' : ''}</b>` : ''}.` : 'Tout est à jour. Belle journée !'} ${todayVisits ? `${todayVisits} visite${todayVisits > 1 ? 's' : ''} aujourd'hui.` : ''}</p></div>
        <div class="hello-acts">
          <button class="qa" data-qa="visite">${icon('calendar')}<span>Visite</span></button>
          <button class="qa" data-qa="client">${icon('users')}<span>Client</span></button>
          <button class="qa" data-qa="bien">${icon('home')}<span>Bien</span></button>
          <button class="qa" data-qa="tache">${icon('check')}<span>Tâche</span></button>
        </div>
      </section>

      <section class="kpis">
        <button class="kpi k1" data-go="pipeline"><span class="kpi-ico">${icon('users')}</span><b data-to="${pending}">0</b><span>Clients en attente</span><small>${leads.filter((l) => l.status === 'nouveau').length} nouveaux</small></button>
        <button class="kpi k2" data-go="agenda"><span class="kpi-ico">${icon('calendar')}</span><b data-to="${weekVisits}">0</b><span>Visites cette semaine</span><small>${todayVisits} aujourd'hui</small></button>
        <button class="kpi k3" data-go="gestion"><span class="ring" style="--p:${pct}"><i>${pct}%</i></span><b data-to="${collected}" data-fmt="money">0</b><span>Loyers encaissés</span><small>sur ${shortMoney(expected)} attendus</small></button>
        <button class="kpi k4" data-go="biens"><span class="kpi-ico">${icon('home')}</span><b data-to="${avail}">0</b><span>Biens disponibles</span><small>${props.length} au total</small></button>
      </section>

      <div class="dash">
        <section class="a-card tasks-card">
          <div class="card-head"><h3>${icon('check')} À faire</h3><div class="seg-f" id="tfilter"><button class="on" data-f="all">Tout <em>${tasks.length}</em></button><button data-f="urgent">Urgent <em>${urgent}</em></button><button data-f="today">Aujourd'hui</button><button data-f="week">Semaine</button></div></div>
          <div class="task-list" id="tlist">${tasks.length ? ['urgent', 'today', 'week'].map((p) => { const g = tasks.filter((t) => t.prio === p); return g.length ? `<div class="tgroup" data-g="${p}"><span class="tg-label ${PRIO[p][1]}">${PRIO[p][0]}</span>${g.map(taskHTML).join('')}</div>` : ''; }).join('') : `<div class="empty-mini">${icon('check')}<b>Tout est fait !</b><span>Aucune tâche en attente.</span></div>`}</div>
          <button class="a-btn a-ghost a-block" data-qa="tache">${icon('plus')} Ajouter une tâche</button>
        </section>

        <section class="a-card agenda-card">
          <div class="card-head"><h3>${icon('calendar')} Cette semaine</h3><button class="a-link" data-go="agenda">Agenda complet</button></div>
          <div class="week-strip" id="wstrip"></div>
          <div class="day-events" id="dayev"></div>
        </section>

        <section class="a-card">
          <div class="card-head"><h3>${icon('users')} Suivi des clients</h3><button class="a-link" data-go="pipeline">Ouvrir</button></div>
          <div class="funnel">${funnel.map(([k, t, n]) => `<button class="fn st-${esc(k)}" data-go="pipeline"><span>${t}</span><div class="fn-bar"><i style="width:${n / maxF * 100}%"></i></div><b>${n}</b></button>`).join('')}</div>
        </section>

        <section class="a-card">
          <div class="card-head"><h3>${icon('chart')} Nos services</h3></div>
          <div class="svc-grid">${svc.map(([i, t, a, b, g]) => `<button class="svc" data-go="${g}"><span class="svc-ico">${icon(i)}</span><b>${t}</b><span>${a}</span><small>${b}</small></button>`).join('')}</div>
        </section>

        <section class="a-card feed-card">
          <div class="card-head"><h3>${icon('clock')} Activité récente</h3></div>
          <div class="feed">${st.activity.slice(0, 7).map((a) => `<div class="fd"><span class="fd-ico">${icon(a.icon)}</span><div><b>${esc(a.text)}</b><small>${ago(a.date)}</small></div></div>`).join('') || '<p class="muted">Aucune activité.</p>'}</div>
        </section>
      </div>`;

    // Horloge
    const tick = () => { const c = qs('#clock'); if (!c) return clearInterval(clockT); const d = new Date(); c.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
    clearInterval(window.__clockT); const clockT = window.__clockT = setInterval(tick, 20000);

    // Semaine
    const events = weekEvents(wk0);
    let sel = todayKey();
    const drawWeek = () => {
      qs('#wstrip').innerHTML = [...Array(7)].map((_, i) => { const d = addDays(wk0, i), k = dayKey(d), n = events.filter((e) => e.day === k).length; return `<button class="wd ${k === sel ? 'sel' : ''} ${k === todayKey() ? 'today' : ''}" data-day="${k}"><small>${d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</small><b>${d.getDate()}</b><i>${'<u></u>'.repeat(Math.min(n, 3))}</i></button>`; }).join('');
      const ev = events.filter((e) => e.day === sel).sort((a, b) => a.time.localeCompare(b.time));
      qs('#dayev').innerHTML = ev.length ? ev.map(evHTML).join('') : `<div class="empty-mini sm">${icon('calendar')}<span>Aucun rendez-vous ce jour.</span><button class="a-link" data-qa="visite">Planifier une visite</button></div>`;
    };
    drawWeek();

    C.onclick = (e) => {
      const go2 = e.target.closest('[data-go]'); if (go2) return go(go2.dataset.go);
      const qa = e.target.closest('[data-qa]'); if (qa) return ({ visite: () => editVisit(), client: () => editClient(), bien: () => editProperty(), tache: () => editTask() })[qa.dataset.qa]();
      const d = e.target.closest('[data-day]'); if (d) { sel = d.dataset.day; drawWeek(); return; }
      const f = e.target.closest('#tfilter button'); if (f) { qsa('#tfilter button').forEach((x) => x.classList.toggle('on', x === f)); qsa('.tgroup').forEach((g) => (g.hidden = f.dataset.f !== 'all' && g.dataset.g !== f.dataset.f)); return; }
      const evb = e.target.closest('[data-ev]'); if (evb) { const [t, id] = evb.dataset.ev.split(':'); if (t === 'visit') editVisit(id); if (t === 'rent') go('gestion'); }
    };
    bindTasks(qs('#tlist'), refresh);
  }

  function weekEvents(wk0) {
    const wk1 = addDays(wk0, 7), out = [];
    DB.all('visits').filter((v) => v.date && v.status !== 'annulée').forEach((v) => {
      const d = new Date(v.date); if (d < wk0 || d >= wk1) return; const p = prop(v.propertyId);
      out.push({ day: v.date.slice(0, 10), time: timeOf(v.date), type: 'visit', id: v.id, title: `Visite · ${v.client}`, sub: p ? `${p.title}` : '', status: v.status, phone: v.phone });
    });
    DB.all('rentals').forEach((r) => {
      for (let i = 0; i < 7; i++) { const d = addDays(wk0, i); if (d.getDate() === (r.dueDay || 5)) { const m = monthKey(d), paid = r.payments?.[m]; out.push({ day: dayKey(d), time: '', type: 'rent', id: r.id, title: `Échéance loyer · ${r.label}`, sub: `${fcfa(r.rent)} · ${paid ? 'payé' : 'à encaisser'}`, status: paid ? 'effectuée' : 'rent' }); } }
    });
    DB.all('tasks').filter((t) => t.due && !t.done).forEach((t) => { const d = new Date(t.due + 'T09:00'); if (d >= wk0 && d < wk1) out.push({ day: t.due, time: '', type: 'task', id: t.id, title: t.title, sub: 'Tâche', status: 'task' }); });
    return out;
  }
  const evHTML = (e) => `<button class="ev ev-${e.type} ${e.status === 'effectuée' ? 'done' : ''}" data-ev="${e.type}:${esc(e.id)}"><span class="ev-time">${e.time || '—'}</span><span class="ev-txt"><b>${esc(e.title)}</b><small>${esc(e.sub)}</small></span>${e.phone ? `<a class="a-round sm wa" target="_blank" rel="noopener" href="${wa(e.phone)}" onclick="event.stopPropagation()">${icon('whatsapp')}</a>` : ''}</button>`;

  /* ================= Vue : Suivi des clients (pipeline) ================= */
  function pipeline(C) {
    const leads = DB.all('leads');
    C.innerHTML = `<div class="a-toolbar"><div class="a-searchbar">${icon('search')}<input type="search" id="lq" placeholder="Rechercher un client…"></div>
      <button class="a-btn a-primary" data-new-lead>${icon('plus')} Nouvelle demande</button><button class="a-btn" data-csv>${icon('download')} <span class="hide-sm">Exporter</span></button></div>
      <p class="hint">${icon('arrow')} Faites glisser une carte d'une colonne à l'autre (ou utilisez le menu « Étape » sur mobile).</p>
      <div class="board" id="board">${STAGES.map(([k, t, i]) => `<section class="col st-${esc(k)}" data-stage="${esc(k)}"><header><span class="col-ico">${icon(i)}</span><b>${t}</b><em>${leads.filter((l) => l.status === k).length}</em></header><div class="col-body" data-drop="${esc(k)}"></div></section>`).join('')}</div>`;
    const draw = () => {
      const q = qs('#lq').value.trim().toLowerCase();
      STAGES.forEach(([k]) => {
        const items = leads.filter((l) => l.status === k && (!q || [l.name, l.phone, l.message, l.subject].join(' ').toLowerCase().includes(q))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        qs(`[data-drop="${k}"]`).innerHTML = items.map(leadCard).join('') || '<div class="col-empty">Aucun client</div>';
        qs(`[data-stage="${k}"] header em`).textContent = items.length;
      });
    };
    draw();
    qs('#lq').addEventListener('input', draw);
    // Glisser-déposer
    const board = qs('#board');
    board.addEventListener('dragstart', (e) => { const c = e.target.closest('.lead-card'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.id); c.classList.add('dragging'); });
    board.addEventListener('dragend', (e) => { e.target.closest?.('.lead-card')?.classList.remove('dragging'); qsa('.col-body.over').forEach((x) => x.classList.remove('over')); });
    board.addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); qsa('.col-body.over').forEach((x) => x !== z && x.classList.remove('over')); z.classList.add('over'); });
    board.addEventListener('drop', (e) => { const z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); moveLead(e.dataTransfer.getData('text/plain'), z.dataset.drop); draw(); badges(); });
    C.onchange = (e) => { const s = e.target.closest('[data-stage-sel]'); if (s) { moveLead(s.dataset.stageSel, s.value); draw(); badges(); } };
    C.onclick = (e) => {
      if (e.target.closest('[data-new-lead]')) return editLead();
      if (e.target.closest('[data-csv]')) return csv('demandes', DB.all('leads'), ['date', 'name', 'phone', 'email', 'subject', 'propertyId', 'message', 'status']);
      if (e.target.closest('a, select')) return;
      const c = e.target.closest('.lead-card'); if (c) leadDetail(c.dataset.id);
    };
  }
  function moveLead(id, stage) {
    const l = DB.find('leads', id); if (!l || l.status === stage) return;
    DB.update('leads', id, { status: stage });
    log(`${l.name} → ${STAGES.find((s) => s[0] === stage)[1]}`, STAGES.find((s) => s[0] === stage)[2]);
    toast(`${l.name} : ${STAGES.find((s) => s[0] === stage)[1]}`);
    if (stage === 'visite' && !DB.all('visits').some((v) => v.client === l.name && v.status === 'planifiée')) setTimeout(() => { if (confirm(`Planifier maintenant la visite avec ${l.name} ?`)) editVisit(null, { client: l.name, phone: l.phone, propertyId: l.propertyId, date: l.preferredDate || '' }); }, 200);
  }
  function leadCard(l) {
    const p = prop(l.propertyId);
    return `<article class="lead-card" draggable="true" data-id="${esc(l.id)}">
      <div class="lc-top"><i class="av">${esc(initials(l.name))}</i><div><b>${esc(l.name)}</b><small>${esc(l.subject || 'Demande')} · ${ago(l.date)}</small></div></div>
      ${p ? `<div class="lc-prop">${img(p.images?.[0], '')}<span>${esc(p.title)}</span></div>` : ''}
      ${l.message ? `<p class="lc-msg">${esc(l.message)}</p>` : ''}
      <div class="lc-foot"><a class="a-round sm wa" target="_blank" rel="noopener" href="${wa(l.phone, `Bonjour ${l.name}, ici DJIDONOU SHALOM IMMO suite à votre demande${p ? ' pour « ' + p.title + ' »' : ''}.`)}" title="WhatsApp">${icon('whatsapp')}</a><a class="a-round sm" href="tel:${esc(l.phone)}" title="Appeler">${icon('phone')}</a>
        <select class="stage-sel" data-stage-sel="${esc(l.id)}" aria-label="Étape">${STAGES.map(([k, t]) => `<option value="${esc(k)}" ${k === l.status ? 'selected' : ''}>${t}</option>`).join('')}</select></div></article>`;
  }
  function leadDetail(id) {
    const l = DB.find('leads', id); if (!l) return;
    const p = prop(l.propertyId), stage = STAGES.find((s) => s[0] === l.status);
    openModal(l.name, `<div class="ld">
      <div class="ld-head"><i class="av lg">${esc(initials(l.name))}</i><div><b>${esc(l.name)}</b><small>${esc(l.phone)}${l.email ? ' · ' + esc(l.email) : ''}</small><span class="pill st-${esc(l.status)}">${stage[1]}</span></div></div>
      <div class="ld-acts"><a class="a-btn a-wa" target="_blank" rel="noopener" href="${wa(l.phone, `Bonjour ${l.name}, ici DJIDONOU SHALOM IMMO.`)}">${icon('whatsapp')} WhatsApp</a><a class="a-btn" href="tel:${esc(l.phone)}">${icon('phone')} Appeler</a>${l.email ? `<a class="a-btn" href="mailto:${esc(l.email)}">${icon('mail')} E-mail</a>` : ''}</div>
      <div class="ld-stages">${STAGES.map(([k, t, i]) => `<button class="${k === l.status ? 'on' : ''} st-${esc(k)}" data-st="${esc(k)}">${icon(i)}<span>${t}</span></button>`).join('')}</div>
      <dl class="ld-info"><dt>Demande</dt><dd>${esc(l.subject || '—')} · reçue ${ago(l.date)}</dd>
        ${p ? `<dt>Bien</dt><dd><a href="bien.html?id=${encodeURIComponent(p.id)}" target="_blank">${esc(p.title)}</a> · ${fcfa(p.price)}</dd>` : ''}
        ${l.preferredDate ? `<dt>Précision</dt><dd>${esc(l.preferredDate.includes('T') ? fdatetime(l.preferredDate) : l.preferredDate)}</dd>` : ''}
        ${l.budget ? `<dt>Type</dt><dd>${esc(l.budget)}</dd>` : ''}
        ${l.message ? `<dt>Message</dt><dd>${esc(l.message)}</dd>` : ''}</dl>
      <label class="ld-note">Notes internes<textarea id="ldnote" rows="3" placeholder="Ex. : budget, préférences, prochain rappel…">${esc(l.note || '')}</textarea></label>
      <div class="a-form-foot"><button class="a-btn danger" data-del>${icon('trash')}</button><span class="grow"></span><button class="a-btn" data-visit>${icon('calendar')} Planifier une visite</button><button class="a-btn" data-client>${icon('users')} Ajouter aux clients</button></div></div>`, (b) => {
      qsa('[data-st]', b).forEach((x) => (x.onclick = () => { moveLead(id, x.dataset.st); closeModal(); refresh(); }));
      qs('#ldnote', b).addEventListener('change', (e) => { DB.update('leads', id, { note: e.target.value }); toast('Note enregistrée'); });
      qs('[data-del]', b).onclick = () => { if (confirmDel('cette demande')) { DB.remove('leads', id); closeModal(); refresh(); } };
      qs('[data-visit]', b).onclick = () => { closeModal(); if (l.status === 'nouveau' || l.status === 'contacté') DB.update('leads', id, { status: 'visite' }); editVisit(null, { client: l.name, phone: l.phone, propertyId: l.propertyId, date: l.preferredDate || '' }); };
      qs('[data-client]', b).onclick = () => {
        if (DB.all('clients').some((c) => digits(c.phone) === digits(l.phone))) { toast('Ce client existe déjà'); return; }
        DB.insert('clients', { name: l.name, phone: l.phone, email: l.email, type: /Confier|Gestion|Mise en vente|Estimation/.test(l.subject) ? 'Propriétaire' : 'Prospect', city: '', notes: l.message, createdAt: todayKey() }, 'C');
        log(`${l.name} ajouté(e) aux clients`, 'users'); toast('Client ajouté'); closeModal(); refresh();
      };
    });
  }
  function editLead() {
    const pr = [['', '— Aucun —'], ...DB.all('properties').map((p) => [p.id, `${p.ref} – ${p.title}`])];
    const spec = [['name', 'Nom *', 'text', 'req'], ['phone', 'Téléphone *', 'tel', 'req'], ['email', 'E-mail', 'email'], ['subject', 'Objet', 'select', ['Information', 'Visite', 'Offre', 'Confier un bien', 'Mise en vente', 'Estimation', 'Recherche']], ['propertyId', 'Bien concerné', 'select', pr, 'full'], ['message', 'Message / besoin', 'textarea', 3]];
    simpleForm('Nouvelle demande', spec, {}, (o) => { DB.insert('leads', Object.assign(o, { date: new Date().toISOString().slice(0, 16), status: 'nouveau' }), 'D'); log(`Nouvelle demande : ${o.name}`, 'inbox'); toast('Demande ajoutée'); });
  }

  /* ================= Vue : Agenda ================= */
  let agendaWeek = null;
  function agenda(C) {
    if (!agendaWeek) agendaWeek = startOfWeek(new Date());
    const wk0 = agendaWeek, events = weekEvents(wk0), tk = todayKey();
    const label = `${wk0.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${addDays(wk0, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    C.innerHTML = `<div class="a-toolbar"><div class="wk-nav"><button class="a-round" data-w="-1">‹</button><b>${label}</b><button class="a-round" data-w="1">›</button><button class="a-btn a-sm" data-w="0">Aujourd'hui</button></div><span class="grow"></span><button class="a-btn a-primary" data-add>${icon('plus')} Planifier une visite</button></div>
      <div class="legend-a"><span><i class="ev-visit"></i>Visites</span><span><i class="ev-rent"></i>Échéances de loyer</span><span><i class="ev-task"></i>Tâches</span></div>
      <div class="week">${[...Array(7)].map((_, i) => { const d = addDays(wk0, i), k = dayKey(d), ev = events.filter((e) => e.day === k).sort((a, b) => a.time.localeCompare(b.time)); return `<section class="wday ${k === tk ? 'is-today' : ''} ${k < tk ? 'past' : ''} ${ev.length ? '' : 'empty'}"><header><small>${d.toLocaleDateString('fr-FR', { weekday: 'long' })}</small><b>${d.getDate()}</b>${k === tk ? '<em>Aujourd\'hui</em>' : ''}</header><div class="wday-body">${ev.map(evHTML).join('') || '<span class="free">Libre</span>'}</div><button class="wday-add" data-addday="${k}">${icon('plus')}</button></section>`; }).join('')}</div>
      <section class="a-card"><div class="card-head"><h3>${icon('list')} Toutes les visites à venir</h3></div><div class="vlist">${DB.all('visits').filter((v) => v.status === 'planifiée' && v.date >= tk).sort((a, b) => a.date.localeCompare(b.date)).map((v) => { const p = prop(v.propertyId); return `<button class="vrow" data-vid="${esc(v.id)}"><span class="date-chip"><b>${new Date(v.date).getDate()}</b>${new Date(v.date).toLocaleDateString('fr-FR', { month: 'short' })}</span><span class="grow"><b>${esc(v.client)}</b><small>${timeOf(v.date)} · ${esc(p ? p.title : 'Bien à préciser')}${v.agent ? ' · ' + esc(v.agent) : ''}</small></span>${v.phone ? `<a class="a-round sm wa" target="_blank" rel="noopener" href="${wa(v.phone, `Bonjour ${v.client}, nous vous confirmons votre visite le ${fdatetime(v.date)}${p ? ' pour « ' + p.title + ' »' : ''}. – DJIDONOU SHALOM IMMO`)}" onclick="event.stopPropagation()">${icon('whatsapp')}</a>` : ''}</button>`; }).join('') || '<p class="muted">Aucune visite à venir.</p>'}</div></section>`;
    C.onclick = (e) => {
      const w = e.target.closest('[data-w]'); if (w) { agendaWeek = +w.dataset.w === 0 ? startOfWeek(new Date()) : addDays(agendaWeek, 7 * +w.dataset.w); return agenda(C); }
      if (e.target.closest('[data-add]')) return editVisit();
      const ad = e.target.closest('[data-addday]'); if (ad) return editVisit(null, { date: ad.dataset.addday + 'T10:00' });
      const ev = e.target.closest('[data-ev]'); if (ev) { const [t, id] = ev.dataset.ev.split(':'); if (t === 'visit') editVisit(id); if (t === 'rent') go('gestion'); if (t === 'task') editTask(id); return; }
      const vr = e.target.closest('[data-vid]'); if (vr) editVisit(vr.dataset.vid);
    };
  }
  const VISIT_STATUS = ['planifiée', 'effectuée', 'annulée'];
  function editVisit(id, preset) {
    const v = id ? DB.find('visits', id) : Object.assign({ status: 'planifiée', agent: '' }, preset || {});
    const pr = [['', '— Bien à préciser —'], ...DB.all('properties').map((p) => [p.id, `${p.ref} – ${p.title}`])];
    const spec = [['date', 'Date et heure *', 'datetime-local', 'req'], ['status', 'Statut', 'select', VISIT_STATUS], ['propertyId', 'Bien', 'select', pr, 'full'], ['client', 'Client *', 'text', 'req'], ['phone', 'Téléphone', 'tel'], ['agent', 'Agent', 'text', '', 'full']];
    simpleForm(id ? 'Modifier la visite' : 'Planifier une visite', spec, v, (o) => {
      if (id) { DB.update('visits', id, o); log(`Visite ${o.status} · ${o.client}`, 'calendar'); }
      else { DB.insert('visits', o, 'V'); log(`Visite planifiée avec ${o.client} le ${fdatetime(o.date)}`, 'calendar'); }
      toast('Visite enregistrée');
    }, id ? () => DB.remove('visits', id) : null);
  }

  /* ================= Vue : Biens ================= */
  const PROP_SPEC = [
    ['', 'Informations principales', 'section'],
    ['title', "Titre de l'annonce *", 'text', 'req', 'full'],
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
  let bFilter = 'tous';
  function biens(C) {
    const all = DB.all('properties');
    const F = [['tous', 'Tous', () => true], ['parcelle', 'Parcelles', (p) => p.category === 'parcelle'], ['vente', 'À vendre', (p) => p.transaction === 'vente'], ['location', 'À louer', (p) => p.transaction === 'location'], ['disponible', 'Disponibles', (p) => p.status === 'disponible'], ['clos', 'Vendus / loués', (p) => p.status === 'vendu' || p.status === 'loué']];
    C.innerHTML = `<div class="a-toolbar"><div class="a-searchbar">${icon('search')}<input type="search" id="pq" placeholder="Titre, référence, quartier…"></div><button class="a-btn a-primary" data-addp>${icon('plus')} Ajouter un bien</button></div>
      <div class="chips-a" id="pchips">${F.map(([k, t, f]) => `<button data-f="${k}" class="${k === bFilter ? 'on' : ''}">${t} <em>${all.filter(f).length}</em></button>`).join('')}</div>
      <div class="pgrid" id="pgrid"></div>`;
    const draw = () => {
      const q = qs('#pq').value.toLowerCase(), f = F.find((x) => x[0] === bFilter)[2];
      const items = DB.all('properties').filter((p) => f(p) && (!q || [p.title, p.ref, p.city, p.district].join(' ').toLowerCase().includes(q)));
      qs('#pgrid').innerHTML = items.map((p) => {
        const nl = DB.all('leads').filter((l) => l.propertyId === p.id).length;
        return `<article class="pc st-${esc(p.status)}" data-id="${esc(p.id)}">
          <div class="pc-img">${img(p.images?.[0], '')}<span class="pc-tag">${p.transaction === 'vente' ? 'Vente' : 'Location'} · ${esc(CATEGORIES[p.category])}</span><button class="pc-star ${p.featured ? 'on' : ''}" data-star title="Coup de cœur">${icon('star')}</button></div>
          <div class="pc-body"><b class="pc-price">${fcfa(p.price)}${p.transaction === 'location' ? '<small>/mois</small>' : ''}</b><h4>${esc(p.title)}</h4><small class="muted">${esc(p.ref)} · ${esc(p.district)}, ${esc(p.city)}</small>
            <div class="pc-foot"><select class="pill-sel st-${esc(p.status)}" data-status>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${p.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select><span class="pc-leads" title="Demandes">${icon('inbox')} ${nl}</span>
            <a class="a-round sm" href="bien.html?id=${encodeURIComponent(p.id)}" target="_blank" title="Voir">${icon('eye')}</a><button class="a-round sm" data-edit title="Modifier">${icon('edit')}</button></div></div></article>`;
      }).join('') || '<div class="a-empty">Aucun bien.</div>';
    };
    draw();
    qs('#pq').addEventListener('input', draw);
    C.onchange = (e) => { const s = e.target.closest('[data-status]'); if (s) { const id = s.closest('.pc').dataset.id; DB.update('properties', id, { status: s.value }); log(`${DB.find('properties', id).title} → ${STATUS[s.value]}`, 'home'); toast('Statut mis à jour'); draw(); } };
    C.onclick = (e) => {
      if (e.target.closest('[data-addp]')) return editProperty();
      const ch = e.target.closest('#pchips button'); if (ch) { bFilter = ch.dataset.f; qsa('#pchips button').forEach((x) => x.classList.toggle('on', x === ch)); return draw(); }
      if (e.target.closest('a, select')) return;
      const c = e.target.closest('.pc'); if (!c) return;
      if (e.target.closest('[data-star]')) { const p = DB.find('properties', c.dataset.id); DB.update('properties', p.id, { featured: !p.featured }); return draw(); }
      editProperty(c.dataset.id);
    };
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
    const uploaded = (p.images || []).filter((s) => s.startsWith('data:'));
    const data = Object.assign({}, p, { featuresTxt: (p.features || []).join('\n'), imagesTxt: (p.images || []).filter((s) => !s.startsWith('data:')).join('\n') });
    openModal(id ? 'Modifier le bien' : 'Nouveau bien', `<form class="a-form" id="pform">${fields(PROP_SPEC, data)}
      <div class="full"><span class="f-lbl">Photos depuis le téléphone ou l'ordinateur</span><div class="up-grid" id="upg"></div><label class="a-btn up-btn">${icon('upload')} Importer des photos<input type="file" accept="image/*" multiple hidden id="upf"></label><p class="muted small">Les photos sont réduites automatiquement.</p></div>
      <div class="full"><span class="f-lbl">Position sur la carte (touchez la carte pour placer le bien)</span><div id="pmap" class="a-map"></div></div>
      ${formFoot(!!id)}</form>`, (body) => {
      const drawUp = () => { qs('#upg', body).innerHTML = uploaded.map((s, i) => `<div class="up-item"><img src="${s}" alt=""><button type="button" data-rm="${i}">${icon('close')}</button></div>`).join(''); };
      drawUp();
      qs('#upg', body).addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { uploaded.splice(+b.dataset.rm, 1); drawUp(); } });
      qs('#upf', body).addEventListener('change', async (e) => { for (const f of e.target.files) { try { uploaded.push(await compress(f)); } catch (er) { toast('Image illisible', 'err'); } } drawUp(); e.target.value = ''; });
      qs('[data-close]', body).onclick = closeModal;
      if (id) qs('[data-del]', body).onclick = () => { if (confirmDel('ce bien')) { const t = p.title; DB.remove('properties', id); log(`Bien supprimé : ${t}`, 'trash'); closeModal(); refresh(); } };
      if (window.L) {
        const lat = qs('[name=lat]', body), lng = qs('[name=lng]', body);
        const map = L.map(qs('#pmap', body)).setView([+lat.value || 6.45, +lng.value || 2.35], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        const mk = L.marker([+lat.value || 6.45, +lng.value || 2.35], { draggable: true }).addTo(map);
        const set = (ll) => { lat.value = ll.lat.toFixed(5); lng.value = ll.lng.toFixed(5); mk.setLatLng(ll); };
        map.on('click', (e) => set(e.latlng)); mk.on('dragend', () => set(mk.getLatLng()));
        setTimeout(() => map.invalidateSize(), 300);
      }
      qs('#pform', body).addEventListener('submit', (e) => {
        e.preventDefault();
        const o = readForm(e.target, PROP_SPEC);
        o.features = o.featuresTxt.split('\n').map((s) => s.trim()).filter(Boolean);
        o.images = o.imagesTxt.split('\n').map((s) => s.trim()).filter(Boolean).concat(uploaded);
        delete o.featuresTxt; delete o.imagesTxt;
        if (o.width && o.depth && !o.surface) o.surface = o.width * o.depth;
        if (id) { DB.update('properties', id, o); log(`Bien modifié : ${o.title}`, 'edit'); }
        else { o.createdAt = todayKey(); o.ref = o.ref || 'DSI-' + (o.transaction === 'location' ? 'LO' : o.category === 'parcelle' ? 'PA' : 'VI') + '-' + String(Date.now()).slice(-4); DB.insert('properties', o, o.transaction === 'location' ? 'L' : 'P'); log(`Nouveau bien publié : ${o.title}`, 'home'); }
        closeModal(); toast(id ? 'Bien modifié' : 'Bien ajouté et publié sur le site'); refresh();
      });
    });
  }

  /* ================= Vue : Clients ================= */
  const CLIENT_TYPES = ['Prospect', 'Acheteur', 'Vendeur', 'Propriétaire', 'Locataire'];
  const CLIENT_SPEC = [['name', 'Nom complet *', 'text', 'req'], ['phone', 'Téléphone *', 'tel', 'req'], ['email', 'E-mail', 'email'], ['type', 'Type', 'select', CLIENT_TYPES], ['city', 'Ville / pays', 'text', '', 'full'], ['notes', 'Notes', 'textarea', 3]];
  let cFilter = '';
  function clients(C) {
    const all = DB.all('clients');
    C.innerHTML = `<div class="a-toolbar"><div class="a-searchbar">${icon('search')}<input type="search" id="cq" placeholder="Nom, téléphone, e-mail…"></div><button class="a-btn a-primary" data-addc>${icon('plus')} Nouveau client</button><button class="a-btn" data-csv>${icon('download')} <span class="hide-sm">Exporter</span></button></div>
      <div class="chips-a" id="cchips"><button data-t="" class="${!cFilter ? 'on' : ''}">Tous <em>${all.length}</em></button>${CLIENT_TYPES.map((t) => `<button data-t="${t}" class="${cFilter === t ? 'on' : ''}">${t}s <em>${all.filter((c) => c.type === t).length}</em></button>`).join('')}</div>
      <div class="cgrid" id="cgrid"></div>`;
    const draw = () => {
      const q = qs('#cq').value.toLowerCase();
      const items = DB.all('clients').filter((c) => (!cFilter || c.type === cFilter) && (!q || [c.name, c.phone, c.email, c.city, c.notes].join(' ').toLowerCase().includes(q)));
      qs('#cgrid').innerHTML = items.map((c) => {
        const rent = DB.all('rentals').filter((r) => r.ownerId === c.id || r.tenantId === c.id).length;
        return `<article class="cc" data-id="${esc(c.id)}"><div class="cc-top"><i class="av lg t-${esc(c.type)}">${esc(initials(c.name))}</i><div><b>${esc(c.name)}</b><span class="pill t-${esc(c.type)}">${esc(c.type)}</span></div></div>
          <p class="cc-info">${icon('phone')} ${esc(c.phone)}${c.email ? `<br>${icon('mail')} ${esc(c.email)}` : ''}${c.city ? `<br>${icon('pin')} ${esc(c.city)}` : ''}</p>
          ${c.notes ? `<p class="cc-notes">${esc(c.notes)}</p>` : ''}
          <div class="cc-foot"><small class="muted">Client depuis ${fdate(c.createdAt)}${rent ? ` · ${rent} contrat(s)` : ''}</small><span class="grow"></span><a class="a-round sm wa" target="_blank" rel="noopener" href="${wa(c.phone)}">${icon('whatsapp')}</a><a class="a-round sm" href="tel:${esc(c.phone)}">${icon('phone')}</a></div></article>`;
      }).join('') || '<div class="a-empty">Aucun client.</div>';
    };
    draw();
    qs('#cq').addEventListener('input', draw);
    C.onclick = (e) => {
      if (e.target.closest('[data-addc]')) return editClient();
      if (e.target.closest('[data-csv]')) return csv('clients', DB.all('clients'), ['name', 'phone', 'email', 'type', 'city', 'notes', 'createdAt']);
      const ch = e.target.closest('#cchips button'); if (ch) { cFilter = ch.dataset.t; qsa('#cchips button').forEach((x) => x.classList.toggle('on', x === ch)); return draw(); }
      if (e.target.closest('a')) return;
      const c = e.target.closest('.cc'); if (c) editClient(c.dataset.id);
    };
  }
  function editClient(id) {
    const c = id ? DB.find('clients', id) : { type: 'Prospect' };
    simpleForm(id ? 'Modifier le client' : 'Nouveau client', CLIENT_SPEC, c, (o) => {
      if (id) DB.update('clients', id, o); else { DB.insert('clients', Object.assign(o, { createdAt: todayKey() }), 'C'); log(`Nouveau client : ${o.name}`, 'users'); }
      toast('Client enregistré');
    }, id ? () => DB.remove('clients', id) : null);
  }

  /* ================= Vue : Gestion locative ================= */
  function gestion(C) {
    const rentals = DB.all('rentals'), mk = monthKey();
    const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return monthKey(d); });
    const expected = rentals.reduce((s, r) => s + r.rent, 0);
    const collected = rentals.filter((r) => r.payments?.[mk]).reduce((s, r) => s + r.rent, 0);
    const unpaid = unpaidList(), arrears = unpaid.reduce((s, x) => s + x.r.rent, 0);
    const comm = rentals.filter((r) => r.payments?.[mk]).reduce((s, r) => s + r.rent * (r.commission || 0) / 100, 0);
    const pct = expected ? Math.round(collected / expected * 100) : 0;
    C.innerHTML = `<div class="a-toolbar"><span class="grow"></span><button class="a-btn a-primary" data-addr>${icon('plus')} Nouveau contrat</button></div>
      <section class="kpis">
        <div class="kpi k1"><span class="kpi-ico">${icon('key')}</span><b data-to="${rentals.length}">0</b><span>Contrats actifs</span></div>
        <div class="kpi k3"><span class="ring" style="--p:${pct}"><i>${pct}%</i></span><b data-to="${collected}" data-fmt="money">0</b><span>Encaissé ce mois</span><small>sur ${fcfa(expected)}</small></div>
        <div class="kpi k5"><span class="kpi-ico">${icon('clock')}</span><b data-to="${arrears}" data-fmt="money">0</b><span>Impayés cumulés</span><small>${unpaid.length} échéance(s)</small></div>
        <div class="kpi k4"><span class="kpi-ico">${icon('chart')}</span><b data-to="${comm}" data-fmt="money">0</b><span>Commission du mois</span><small>À reverser : ${fcfa(collected - comm)}</small></div>
      </section>
      <div class="rgrid">${rentals.map((r) => {
        const o = client(r.ownerId), t = client(r.tenantId), late = unpaid.filter((x) => x.r.id === r.id).length;
        return `<article class="a-card rental ${late ? 'has-late' : ''}"><div class="rental-head"><div class="grow"><b>${esc(r.label)}</b><small>Depuis le ${fdate(r.startDate)} · échéance le ${r.dueDay} · commission ${r.commission} %</small></div><div class="rental-rent">${fcfa(r.rent)}<small>/mois</small></div><button class="a-round sm" data-redit="${esc(r.id)}">${icon('edit')}</button></div>
          <div class="rental-people"><span>${icon('home')} Propriétaire : <b>${esc(o?.name || '—')}</b></span><span>${icon('users')} Locataire : <b>${esc(t?.name || '—')}</b>${t ? ` <a target="_blank" rel="noopener" href="${wa(t.phone)}">${icon('whatsapp')}</a>` : ''}</span>${late ? `<span class="pill red">${late} impayé(s)</span>` : '<span class="pill green">À jour</span>'}</div>
          <div class="months">${months.map((m) => { const s2 = r.payments?.[m], before = m < (r.startDate || '').slice(0, 7); return `<button class="month ${before ? 'na' : s2 ? 'paid' : m <= mk ? 'late' : 'future'}" ${before ? 'disabled' : ''} data-pay="${esc(r.id)}" data-m="${m}"><small>${monthName(m, { month: 'short' })}</small>${before ? '—' : s2 ? icon('check') : m <= mk ? 'Impayé' : 'À venir'}</button>`; }).join('')}</div>
          ${late && t ? `<a class="a-btn a-wa a-sm" target="_blank" rel="noopener" href="${wa(t.phone, `Bonjour ${t.name}, petit rappel : ${late > 1 ? late + ' loyers sont' : 'le loyer est'} en attente pour « ${r.label} ». Merci. – DJIDONOU SHALOM IMMO`)}">${icon('whatsapp')} Relancer le locataire</a>` : ''}</article>`;
      }).join('') || '<div class="a-empty">Aucun contrat. Ajoutez votre premier bien en gestion.</div>'}</div>
      <p class="hint">${icon('check')} Touchez un mois pour le marquer payé ou impayé.</p>`;
    C.onclick = (e) => {
      if (e.target.closest('[data-addr]')) return editRental();
      const b = e.target.closest('[data-pay]'); if (b) { const r = DB.find('rentals', b.dataset.pay); r.payments = r.payments || {}; r.payments[b.dataset.m] = !r.payments[b.dataset.m]; DB.save(); if (r.payments[b.dataset.m]) log(`Loyer ${monthName(b.dataset.m)} reçu · ${r.label}`, 'money'); toast(r.payments[b.dataset.m] ? 'Paiement enregistré' : 'Paiement annulé'); return refresh(); }
      const ed = e.target.closest('[data-redit]'); if (ed) editRental(ed.dataset.redit);
    };
  }
  function editRental(id) {
    const r = id ? DB.find('rentals', id) : { commission: 10, dueDay: 5, startDate: todayKey() };
    const cl = DB.all('clients').map((c) => [c.id, `${c.name} (${c.type})`]);
    const pr = [['', '— Aucune annonce —'], ...DB.all('properties').filter((p) => p.transaction === 'location').map((p) => [p.id, `${p.ref} – ${p.title}`])];
    const spec = [['label', 'Nom du bien géré *', 'text', 'req', 'full'], ['propertyId', 'Annonce liée', 'select', pr, 'full'], ['ownerId', 'Propriétaire', 'select', [['', '—'], ...cl]], ['tenantId', 'Locataire', 'select', [['', '—'], ...cl]], ['rent', 'Loyer mensuel (FCFA) *', 'number', 'req'], ['commission', 'Commission (%)', 'number'], ['startDate', 'Début du bail', 'date'], ['dueDay', "Jour d'échéance", 'number']];
    simpleForm(id ? 'Modifier le contrat' : 'Nouveau contrat de gestion', spec, r, (o) => {
      if (!id) { o.payments = {}; const d = new Date((o.startDate || todayKey()) + 'T12:00'); d.setDate(1); while (monthKey(d) <= monthKey()) { o.payments[monthKey(d)] = false; d.setMonth(d.getMonth() + 1); } DB.insert('rentals', o, 'G'); log(`Nouveau contrat de gestion : ${o.label}`, 'key'); }
      else DB.update('rentals', id, o);
      if (o.propertyId) DB.update('properties', o.propertyId, { status: 'loué' });
      toast('Contrat enregistré');
    }, id ? () => DB.remove('rentals', id) : null);
  }

  /* ================= Tâches manuelles ================= */
  function editTask(id) {
    const t = id ? DB.find('tasks', id) : { prio: 'normal', due: todayKey() };
    const spec = [['title', 'Tâche *', 'text', 'req', 'full'], ['due', 'Échéance', 'date'], ['prio', 'Priorité', 'select', [['normal', 'Normale'], ['urgent', 'Urgente']]], ['note', 'Détail', 'textarea', 2]];
    simpleForm(id ? 'Modifier la tâche' : 'Nouvelle tâche', spec, t, (o) => { if (id) DB.update('tasks', id, o); else { DB.insert('tasks', Object.assign(o, { done: false }), 'T'); log(`Tâche ajoutée : ${o.title}`, 'check'); } toast('Tâche enregistrée'); }, id ? () => DB.remove('tasks', id) : null);
  }

  /* ================= Vue : Paramètres ================= */
  function parametres(C) {
    const s = DB.settings();
    const spec = [['name', "Nom de l'agence", 'text', '', 'full'], ['slogan', 'Slogan', 'text', '', 'full'], ['phone', 'Téléphone affiché', 'text'], ['whatsapp', 'Numéro WhatsApp (chiffres, avec 229)', 'text'], ['email', 'E-mail', 'email'], ['hours', 'Horaires', 'text'], ['address', 'Adresse', 'text', '', 'full'], ['facebook', 'Lien Facebook', 'url'], ['tiktok', 'Lien TikTok', 'url'], ['instagram', 'Lien Instagram', 'url'], ['lat', "Latitude de l'agence", 'number'], ['lng', "Longitude de l'agence", 'number']];
    C.innerHTML = `<div class="set-grid">
      <section class="a-card"><div class="card-head"><h3>${icon('home')} Informations de l'agence</h3></div><form class="a-form" id="sform">${fields(spec, s)}<div class="a-form-foot full"><span class="grow"></span><button class="a-btn a-primary">Enregistrer</button></div></form></section>
      <div class="set-side">
        <section class="a-card"><div class="card-head"><h3>${icon('shield')} Sécurité</h3></div><form class="a-form one" id="pwform"><label>Identifiant<input name="user" value="${esc(s.adminUser || DEFAULT_USER)}" required></label><label>Nouveau mot de passe<input name="pass" type="password" minlength="6" required></label><button class="a-btn a-primary">Changer le mot de passe</button></form></section>
        <section class="a-card"><div class="card-head"><h3>${icon('download')} Sauvegarde</h3></div><p class="muted small">Exportez régulièrement une copie de vos données. Vous pourrez la réimporter sur un autre appareil.</p>
          <div class="stack"><button class="a-btn" id="exp">${icon('download')} Exporter la sauvegarde</button><label class="a-btn">${icon('upload')} Importer une sauvegarde<input type="file" accept="application/json" hidden id="imp"></label><button class="a-btn danger" id="rst">${icon('trash')} Remettre les données de démo</button></div></section>
      </div></div>`;
    qs('#sform').addEventListener('submit', (e) => { e.preventDefault(); DB.saveSettings(readForm(e.target, spec)); log('Informations de l\'agence mises à jour', 'settings'); toast('Paramètres enregistrés'); });
    qs('#pwform').addEventListener('submit', async (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target).entries()); DB.saveSettings({ adminUser: f.user, adminPassHash: await sha(f.pass) }); e.target.pass.value = ''; toast('Mot de passe modifié'); });
    qs('#exp').onclick = () => download(`sauvegarde-shalom-immo-${todayKey()}.json`, JSON.stringify(DB.state, null, 2), 'application/json');
    qs('#imp').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.properties) throw 0; DB.replaceAll(d); toast('Sauvegarde importée'); location.reload(); } catch (er) { toast('Fichier invalide', 'err'); } }; r.readAsText(f); };
    qs('#rst').onclick = () => { if (confirm('Remettre toutes les données de démonstration ? Vos modifications seront perdues.')) { DB.reset(); location.reload(); } };
  }

  /* ================= Export ================= */
  function download(name, content, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function csv(name, rows, cols) {
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    download(`${name}-${todayKey()}.csv`, '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => q(r[c])).join(';'))].join('\n'), 'text/csv;charset=utf-8');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!qs('.a-modal')?.hidden) closeModal(); else closeSheet(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && logged() && qs('#a-search-btn')) { e.preventDefault(); search(); }
  });
  logged() ? shell() : login();
})();
