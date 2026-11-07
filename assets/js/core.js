/* =========================================================
   DJIDONOU SHALOM IMMO — Noyau commun (données + utilitaires)
   Stockage : localStorage du navigateur (version démo).
   Pour la production, remplacer DB.* par des appels API.
   ========================================================= */
(function () {
  const KEY = 'dsi_db_v2';
  const seed = window.DSI_SEED;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function load() {
    const raw = safeGet(KEY);
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    const fresh = JSON.parse(JSON.stringify({
      version: seed.version, properties: seed.properties, services: seed.services,
      testimonials: seed.testimonials, settings: seed.settings, clients: seed.clients,
      leads: seed.leads, rentals: seed.rentals, visits: seed.visits,
    }));
    safeSet(KEY, JSON.stringify(fresh));
    return fresh;
  }

  let state = load();
  // Remplace l'ancien numéro fictif par le vrai numéro chez les visiteurs ayant déjà ouvert le site
  if (state.settings && (state.settings.whatsapp === '22901000000000' || state.settings.phone === '+229 01 00 00 00 00')) {
    state.settings.whatsapp = seed.settings.whatsapp; state.settings.phone = seed.settings.phone;
    safeSet(KEY, JSON.stringify(state));
  }
  const save = () => {
    if (!safeSet(KEY, JSON.stringify(state))) {
      alert("Stockage plein : réduisez la taille ou le nombre des photos importées.");
    }
  };

  const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  const DB = {
    get state() { return state; },
    all(col) { return state[col] || []; },
    find(col, id) { return (state[col] || []).find((x) => x.id === id); },
    insert(col, item, prefix) { item.id = item.id || uid(prefix || col[0].toUpperCase()); state[col].unshift(item); save(); return item; },
    update(col, id, patch) { const it = DB.find(col, id); if (it) Object.assign(it, patch); save(); return it; },
    remove(col, id) { state[col] = state[col].filter((x) => x.id !== id); save(); },
    settings() { return state.settings; },
    saveSettings(s) { state.settings = Object.assign(state.settings, s); save(); },
    replaceAll(data) { state = data; save(); },
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} state = load(); },
    save,
    uid,
  };

  /* ---------- Formatage ---------- */
  const nf = new Intl.NumberFormat('fr-FR');
  const fcfa = (n) => nf.format(Math.round(n || 0)).replace(/ | /g, ' ') + ' FCFA';
  const shortMoney = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 ? 1 : 0).replace('.', ',') + ' Md';
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 ? 1 : 0).replace('.', ',') + ' M';
    if (n >= 1e3) return Math.round(n / 1e3) + ' k';
    return String(n);
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fdate = (d) => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return d; } };
  const fdatetime = (d) => { try { return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return d; } };

  const CATEGORIES = { parcelle: 'Parcelle', maison: 'Maison / Villa', appartement: 'Appartement', bureau: 'Bureau / Commerce' };
  const STATUS = { 'disponible': 'Disponible', 'réservé': 'Réservé', 'vendu': 'Vendu', 'loué': 'Loué' };

  /* ---------- Icônes ---------- */
  const P = {
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3m-3 3 3 3m-6 0 2 2"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 0 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 0 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a2 2 0 0 1-2.8-2.8L12 5h-2L3 12l2 2"/><path d="m21 3-4 4"/><path d="M3 3l4 4"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    build: '<path d="M2 20h20M4 20V9l6-4v15M10 9h8v11M14 13h2M14 16h2M6 12h2M6 15h2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    area: '<path d="M3 3h6M3 3v6M21 21h-6M21 21v-6M21 3h-6M21 3v6M3 21h6M3 21v-6"/>',
    bed: '<path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>',
    bath: '<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3ZM6 12V5a2 2 0 0 1 4 0"/>',
    doc: '<path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    whatsapp: '<path d="M20.5 3.5A11 11 0 0 0 3.2 16.7L2 22l5.4-1.4A11 11 0 0 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.2.8.9-3.1-.2-.3a9 9 0 1 1 7.4 4.1Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1l-.9 1.1c-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-3.6-3.2c-.3-.5.3-.4.8-1.4.1-.2 0-.3 0-.4l-.9-2.1c-.2-.6-.5-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.2-.2-.5-.3Z" fill="currentColor" stroke="none"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
  };
  const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;

  /* ---------- Plan de parcelle (SVG) — toujours disponible ---------- */
  function parcelPlan(p, opts = {}) {
    const w = p.width || Math.sqrt(p.surface || 400), d = p.depth || (p.surface || 400) / w;
    const max = Math.max(w, d), s = 150 / max;
    const W = w * s, H = d * s, x = (220 - W) / 2, y = (220 - H) / 2 + 6;
    return `<svg viewBox="0 0 220 240" class="plan ${opts.cls || ''}" role="img" aria-label="Plan de la parcelle ${esc(w)} m × ${esc(d)} m">
      <defs><pattern id="g${esc(p.id)}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="currentColor" stroke-opacity=".08"/></pattern></defs>
      <rect width="220" height="240" fill="url(#g${esc(p.id)})"/>
      <rect x="${x}" y="${y + H + 10}" width="${W}" height="12" rx="2" class="plan-road"/>
      <text x="110" y="${y + H + 19}" text-anchor="middle" class="plan-road-t">VOIE</text>
      <rect x="${x}" y="${y}" width="${W}" height="${H}" class="plan-lot"/>
      ${[[x, y], [x + W, y], [x, y + H], [x + W, y + H]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3.5" class="plan-borne"/>`).join('')}
      <text x="110" y="${y - 8}" text-anchor="middle" class="plan-dim">${esc(w)} m</text>
      <text x="${x + W + 8}" y="${y + H / 2}" class="plan-dim" transform="rotate(90 ${x + W + 8} ${y + H / 2})" text-anchor="middle">${esc(Math.round(d * 10) / 10)} m</text>
      <text x="110" y="${y + H / 2 - 2}" text-anchor="middle" class="plan-area">${esc(p.surface)} m²</text>
      <text x="110" y="${y + H / 2 + 14}" text-anchor="middle" class="plan-sub">${esc(p.ref || '')}</text>
      <g transform="translate(196 22)" class="plan-n"><path d="M0-11 5 5 0 1-5 5Z"/><text y="-14" text-anchor="middle">N</text></g>
    </svg>`;
  }

  /* ---------- Images avec repli ---------- */
  const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="a" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0f1222"/><stop offset="1" stop-color="#1d2240"/></linearGradient></defs><rect width="800" height="600" fill="url(#a)"/><g fill="none" stroke="#5b6bff" stroke-width="10" stroke-linejoin="round" opacity=".85"><path d="M260 330 400 220l140 110"/><path d="M290 310v110h220V310"/><path d="M375 420v-60h50v60"/></g><text x="400" y="490" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="600" font-size="30" fill="#e6e8f2" letter-spacing="6">DJIDONOU SHALOM IMMO</text></svg>');
  function onImgError(img) { if (img.dataset.fb) return; img.dataset.fb = 1; img.src = FALLBACK; }
  window.dsiImgErr = onImgError;
  const img = (src, alt, cls = '', extra = '') => `<img src="${esc(src || FALLBACK)}" alt="${esc(alt)}" class="${cls}" loading="lazy" decoding="async" onerror="dsiImgErr(this)" ${extra}>`;

  /* ---------- Favoris & vus récemment ---------- */
  const FAV = 'dsi_favs';
  const favs = () => { try { return JSON.parse(safeGet(FAV) || '[]'); } catch (e) { return []; } };
  const isFav = (id) => favs().includes(id);
  const toggleFav = (id) => {
    const f = favs(); const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    safeSet(FAV, JSON.stringify(f)); updateFavCount(); return i < 0;
  };
  function updateFavCount() { document.querySelectorAll('[data-fav-count]').forEach((el) => { const n = favs().length; el.textContent = n; el.hidden = !n; }); }

  /* ---------- Toast ---------- */
  function toast(msg, type = 'ok') {
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast toast-' + type; t.innerHTML = icon(type === 'ok' ? 'check' : 'close') + `<span>${esc(msg)}</span>`;
    box.appendChild(t); requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const priceLabel = (p) => fcfa(p.price) + (p.transaction === 'location' ? '<small> / mois</small>' : '');
  const waLink = (text) => `https://wa.me/${DB.settings().whatsapp}?text=${encodeURIComponent(text)}`;

  window.DSI = { DB, fcfa, shortMoney, esc, fdate, fdatetime, icon, img, parcelPlan, FALLBACK, CATEGORIES, STATUS, favs, isFav, toggleFav, updateFavCount, toast, qs, qsa, priceLabel, waLink };
})();
