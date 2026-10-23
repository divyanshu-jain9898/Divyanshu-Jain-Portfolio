/* Divyanshu Jain — portfolio interactions */
(() => {
  "use strict";
  const D = window.PORTFOLIO || { projects: [], gallery: {} };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("js-off");

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"/></svg>',
    img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
    cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- render data-driven sections ---------- */
  const MINI = {
    holo: '<path d="M12 3c-3 0-5 2-5 5 0 2 1 3.5 2.5 4.3L9 16h6l-.5-3.7C16 11.5 17 10 17 8c0-3-2-5-5-5Z"/><path d="M5 20c2-1.3 4.4-2 7-2s5 .7 7 2"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
    check: '<path d="M4 6h10M4 12h7M4 18h10"/><path d="m15 15 2.5 2.5L22 13"/>',
    sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  };
  const svgI = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[k] || MINI.spark}</svg>`;

  const tabsEl = $("#skill-tabs"), panelsEl = $("#skill-panels");
  if (tabsEl && D.skills) {
    tabsEl.innerHTML = D.skills.map((s, i) => `
      <button class="skill-tab" role="tab" id="tab-${s.id}" aria-controls="panel-${s.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
        ${s.icon}<span><b>${esc(s.label)}</b><span>${esc(s.sub)}</span></span>
      </button>`).join("");
    panelsEl.innerHTML = D.skills.map((s, i) => `
      <div class="skill-panel reveal" role="tabpanel" id="panel-${s.id}" aria-labelledby="tab-${s.id}" ${i ? "hidden" : ""} tabindex="0">
        <h3>${esc(s.title)}</h3><p>${esc(s.intro)}</p>
        <div class="skill-items">${s.items.map((it, k) => `<div class="skill-item" style="animation-delay:${k * 0.04}s"><b>${esc(it.name)}</b><span>${esc(it.desc)}</span></div>`).join("")}</div>
      </div>`).join("");
  }

  const otherEl = $("#other-grid");
  if (otherEl && D.other) {
    otherEl.innerHTML = D.other.map((o, i) => o.media ? `
      <article class="mini has-media reveal">
        <button class="mini-media" data-project="${esc(o.id)}" aria-label="Play ${esc(o.title)} video">
          <video data-autoloop data-src="${esc(o.media.preview)}" muted loop playsinline preload="none" poster="${esc(o.media.poster)}" aria-hidden="true"></video>
          <span class="play-btn">${'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"/></svg>'}</span>
        </button>
        <div style="display:grid;gap:10px">
          <span class="where">${o.where ? esc(o.where) + " · " : ""}${esc(o.cat)}</span>
          <h3>${esc(o.title)}</h3>
          <p>${esc(o.tagline)}</p>
          <div class="card-tags">${o.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
          <div><button class="btn btn--ghost btn--sm" data-project="${esc(o.id)}">Watch the demo</button></div>
        </div>
      </article>` : `
      <article class="mini reveal" style="--d:${(i % 3) * 0.05}s">
        <span class="mini-ico">${svgI(o.icon)}</span>
        <span class="where">${o.where ? esc(o.where) + " · " : ""}${esc(o.cat)}</span>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.tagline)}</p>
        <div class="card-tags">${(o.stack || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
      </article>`).join("");
  }

  const iotEl = $("#iot-grid");
  if (iotEl && D.iot) {
    iotEl.innerHTML = D.iot.map((o, i) => `
      <article class="iot-card reveal" style="--d:${i * 0.06}s">
        <button class="iot-media" data-project="${esc(o.id)}" aria-label="View photos of ${esc(o.title)}">
          <img src="${esc(o.media.poster)}" alt="${esc(o.title)} — project photos" loading="lazy" width="1600" height="1000">
          <span class="media-type">${ICON.img}${(o.media.gallery || []).length - 1} photos</span>
        </button>
        <div class="iot-body">
          <span class="where">${esc(o.cat)}</span>
          <h3>${esc(o.title)}</h3>
          <p>${esc(o.tagline)}</p>
          <div class="card-tags">${o.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
          <div><button class="btn btn--ghost btn--sm" data-project="${esc(o.id)}">View the build</button></div>
        </div>
      </article>`).join("") + (D.otherNote ? `<div class="note-card reveal"><span>${esc(D.otherNote)}</span><a class="btn btn--ghost btn--sm" href="#contact">Ask for a walkthrough</a></div>` : "");
  }

  const simEl = $("#sim-tabs");
  if (simEl && D.sims) {
    simEl.innerHTML = D.sims.map((s, i) => `<button class="sim reveal" style="--d:${i * 0.04}s" data-gallery="web3d" data-start="${s.start}" aria-label="Open ${esc(s.label)} screenshot"><img src="${esc(s.img)}" alt="" loading="lazy"><span>${esc(s.label)}</span></button>`).join("");
  }
  const lpEl = $("#live-points");
  if (lpEl && D.livePoints) lpEl.innerHTML = D.livePoints.map((p) => `<li>${esc(p)}</li>`).join("");

  /* ---------- header, progress, active nav ---------- */
  const header = $(".site-header");
  const progress = $(".progress");
  const toTop = $(".to-top");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 12);
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      toTop.classList.toggle("is-on", y > innerHeight * 1.2);
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav-links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => navIO.observe(s));

  const nav = $(".nav");
  const menuBtn = $(".menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navLinks.forEach((a) => a.addEventListener("click", () => { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); }));
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---------- hero word rotator ---------- */
  const rot = $(".rotator");
  if (rot) {
    const words = $$("span", rot);
    let i = 0;
    words[0].classList.add("is-on");
    if (!reduce && words.length > 1) {
      setInterval(() => {
        const cur = words[i];
        cur.classList.remove("is-on"); cur.classList.add("is-off");
        setTimeout(() => cur.classList.remove("is-off"), 650);
        i = (i + 1) % words.length;
        words[i].classList.add("is-on");
      }, 2600);
    }
  }

  /* ---------- reveal + counters ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  function observeReveals(root = document) { $$(".reveal:not(.is-in)", root).forEach((el) => revealIO.observe(el)); }
  observeReveals();

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const end = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split(".")[1] || "").length;
      const dur = reduce ? 1 : 1400;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = (end * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- magnetic buttons + tilt ---------- */
  function magnet(el) {
    if (!finePointer || reduce) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }
  $$(".btn--primary, .btn--ghost").forEach(magnet);

  function tilt(card) {
    if (!finePointer || reduce) return;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
      card.style.setProperty("--ry", (px - 0.5) * 6 + "deg");
      card.style.setProperty("--rx", (0.5 - py) * 6 + "deg");
    });
    card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
  }

  /* ---------- projects ---------- */
  const grid = $("#project-grid");
  const filtersEl = $("#filters");
  const cats = D.categories || [];
  function cardHTML(p, i) {
    const m = p.media || {};
    const kind = m.video ? "Video demo" : m.live ? "Live 3D" : "Screens";
    const kindIcon = m.video ? ICON.play : m.live ? ICON.cube : ICON.img;
    return `
      <button class="card reveal ${p.feature ? "is-feature" : ""}" style="--d:${(i % 3) * 0.06}s" data-id="${esc(p.id)}" data-cat="${esc(p.cat)}" aria-label="Open project: ${esc(p.title)}">
        <div class="card-media">
          <img src="${esc(m.poster)}" alt="" loading="lazy" decoding="async" width="640" height="360">
          ${m.preview ? `<video muted loop playsinline preload="none" data-src="${esc(m.preview)}" aria-hidden="true"></video>` : ""}
          <span class="badge">${esc(p.badge)}</span>
          <span class="media-type">${kindIcon}${kind}</span>
        </div>
        <div class="card-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.tagline)}</p>
          <div class="card-tags">${(p.stack || []).slice(0, 4).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        </div>
        <div class="card-foot"><span>${esc(p.kicker || "")}</span><span class="go">Details ${ICON.arrow}</span></div>
      </button>`;
  }
  if (grid) {
    grid.innerHTML = D.projects.map(cardHTML).join("");
    const LIMIT = D.collapseAfter || 14;
    const moreWrap = $("#more-wrap"), moreBtn = $("#more-btn");
    let expanded = false;
    const applyCollapse = (f) => {
      const cards = $$(".card", grid);
      cards.forEach((c, i) => c.classList.toggle("is-collapsed", f === "all" && !expanded && i >= LIMIT));
      const hidden = cards.filter((c) => c.classList.contains("is-collapsed")).length;
      if (moreWrap) { moreWrap.hidden = !hidden; moreBtn.textContent = `Show ${hidden} more tools`; }
    };
    applyCollapse("all");
    if (moreBtn) moreBtn.addEventListener("click", () => { expanded = true; applyCollapse("all"); observeReveals(grid); });
    observeReveals(grid);
    $$(".card", grid).forEach((card) => {
      tilt(card);
      card.addEventListener("click", () => openProject(card.dataset.id, card));
      const v = $("video", card);
      if (v && finePointer) {
        card.addEventListener("pointerenter", () => {
          if (!v.src) v.src = v.dataset.src;
          v.play().then(() => card.classList.add("is-playing")).catch(() => {});
        });
        card.addEventListener("pointerleave", () => { v.pause(); card.classList.remove("is-playing"); });
      }
    });
    // filters
    const counts = { all: D.projects.length };
    D.projects.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    filtersEl.innerHTML = [{ id: "all", label: "All work" }, ...cats]
      .filter((c) => counts[c.id])
      .map((c, i) => `<button class="filter ${i === 0 ? "is-active" : ""}" data-filter="${c.id}" aria-pressed="${i === 0}">${esc(c.label)} <span>${counts[c.id]}</span></button>`).join("");
    filtersEl.addEventListener("click", (e) => {
      const b = e.target.closest(".filter");
      if (!b) return;
      $$(".filter", filtersEl).forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      const f = b.dataset.filter;
      const cards = $$(".card", grid);
      const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
      cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
      grid.classList.toggle("is-filtered", f !== "all");
      applyCollapse(f);
      cards.forEach((c) => { if (!c.classList.contains("is-hidden")) c.classList.add("is-in"); });
      if (reduce) return;
      cards.forEach((c) => {
        if (c.classList.contains("is-hidden")) return;
        const a = first.get(c), z = c.getBoundingClientRect();
        if (!a.width) { c.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.22,1,.36,1)" }); return; }
        const dx = a.left - z.left, dy = a.top - z.top;
        if (dx || dy) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 480, easing: "cubic-bezier(.22,1,.36,1)" });
      });
    });
  }

  /* ---------- modal ---------- */
  const modal = $("#modal");
  const mMedia = $(".modal-media", modal);
  const mThumbs = $(".modal-thumbs", modal);
  const mBody = $(".modal-body", modal);
  let lastFocus = null;
  let items = [];

  function showItem(k) {
    const it = items[k];
    if (!it) return;
    $$(".thumb", mThumbs).forEach((t, j) => t.classList.toggle("is-active", j === k));
    mMedia.classList.toggle("is-portrait", !!it.portrait);
    if (it.type === "video") {
      mMedia.innerHTML = `<video controls playsinline preload="metadata" poster="${esc(it.poster || "")}" src="${esc(it.src)}"></video>`;
      const v = $("video", mMedia);
      v.play().catch(() => {});
    } else {
      mMedia.innerHTML = `<img src="${esc(it.src)}" alt="${esc(it.alt || "")}">`;
    }
  }
  function openModal(html, list, opener) {
    lastFocus = opener || document.activeElement;
    items = list || [];
    mThumbs.innerHTML = items.length > 1 ? items.map((it, k) => `
      <button class="thumb" data-k="${k}" aria-label="Show ${it.type === "video" ? "video" : "image"} ${k + 1}">
        <img src="${esc(it.thumb || it.poster || it.src)}" alt="" loading="lazy">${it.type === "video" ? `<span class="vid">${ICON.play}</span>` : ""}
      </button>`).join("") : "";
    mBody.innerHTML = html;
    mMedia.hidden = !items.length;
    if (items.length) showItem(0);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus({ preventScroll: true });
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    $$("video", mMedia).forEach((v) => v.pause());
    setTimeout(() => { if (!modal.classList.contains("is-open")) { modal.hidden = true; mMedia.innerHTML = ""; } }, 400);
    if (location.hash.startsWith("#project=")) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  mThumbs.addEventListener("click", (e) => { const t = e.target.closest(".thumb"); if (t) showItem(+t.dataset.k); });
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      const f = $$('button, a[href], video, input, [tabindex]:not([tabindex="-1"])', modal).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function projectHTML(p) {
    const facts = (p.facts || []).map((f) => `<div class="fact"><small>${esc(f.label)}</small>${f.value ? `<b>${esc(f.value)}</b>` : ""}${f.text ? `<p>${esc(f.text)}</p>` : ""}</div>`).join("");
    return `
      <div>
        <span class="badge">${esc(p.badge || p.cat || "")}</span>
        <h3 id="modal-title">${esc(p.title)}</h3>
        <p class="lead">${esc(p.summary || p.tagline || "")}</p>
        <h4>What it does</h4>
        <ul class="feature-list">${(p.features || []).map((f) => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join("")}</ul>
        ${p.how ? `<h4>How it works</h4><ul class="feature-list">${p.how.map((f) => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join("")}</ul>` : ""}
        ${p.cta ? `<div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:10px">${p.cta.map((c) => `<a class="btn btn--${c.primary ? "primary" : "ghost"} btn--sm" href="${esc(c.href)}" ${c.external ? 'target="_blank" rel="noopener"' : ""}>${esc(c.label)}</a>`).join("")}</div>` : ""}
      </div>
      <aside class="facts">
        ${facts}
        <div class="fact"><small>Stack</small><div class="card-tags">${(p.stack || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div></div>
      </aside>`;
  }
  function mediaList(p) {
    const m = p.media || {};
    const list = [];
    if (m.video) list.push({ type: "video", src: m.video, poster: m.poster, thumb: m.poster, portrait: !!m.portrait });
    (m.gallery || []).forEach((g) => list.push(typeof g === "string" ? { type: "img", src: g, alt: p.title } : { type: "img", ...g }));
    if (!list.length && m.poster) list.push({ type: "img", src: m.poster, alt: p.title });
    return list;
  }
  function openProject(id, opener) {
    const p = D.projects.find((x) => x.id === id) || (D.other || []).find((x) => x.id === id) || (D.iot || []).find((x) => x.id === id);
    if (!p) return;
    history.replaceState(null, "", "#project=" + id);
    openModal(projectHTML(p), mediaList(p), opener);
  }
  window.openProject = openProject;
  $$("[data-project]").forEach((b) => b.addEventListener("click", () => openProject(b.dataset.project, b)));
  $$("[data-gallery]").forEach((b) => b.addEventListener("click", () => {
    const g = D.gallery[b.dataset.gallery];
    if (!g) return;
    const start = +(b.dataset.start || 0);
    const list = g.items.slice(start).concat(g.items.slice(0, start));
    openModal(`<div><span class="badge">${esc(g.badge)}</span><h3 id="modal-title">${esc(g.title)}</h3><p class="lead">${esc(g.summary)}</p></div><aside class="facts">${(g.facts || []).map((f) => `<div class="fact"><small>${esc(f.label)}</small><p>${esc(f.text)}</p></div>`).join("")}</aside>`, list, b);
  }));
  if (location.hash.startsWith("#project=")) {
    const id = decodeURIComponent(location.hash.slice(9));
    setTimeout(() => openProject(id), 300);
  }

  /* ---------- inline video players ---------- */
  $$("[data-player]").forEach((wrap) => {
    const btn = $(".play-overlay", wrap);
    btn.addEventListener("click", () => {
      const v = document.createElement("video");
      v.src = wrap.dataset.player;
      v.controls = true; v.playsInline = true; v.autoplay = true;
      if (wrap.dataset.poster) v.poster = wrap.dataset.poster;
      const holder = $(".player-holder", wrap);
      holder.innerHTML = ""; holder.appendChild(v);
      btn.remove();
      v.play().catch(() => {});
    });
  });
  // autoplaying muted loops (phone mockup etc.)
  const loopIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (!reduce) v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: 0.25 });
  $$("video[data-autoloop]").forEach((v) => loopIO.observe(v));

  /* ---------- skills tabs ---------- */
  const tabs = $$(".skill-tab");
  function selectTab(t, focus) {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      $("#" + x.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      const k = e.key;
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(k)) return;
      e.preventDefault();
      let n = i;
      if (k === "ArrowDown" || k === "ArrowRight") n = (i + 1) % tabs.length;
      if (k === "ArrowUp" || k === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      if (k === "Home") n = 0;
      if (k === "End") n = tabs.length - 1;
      selectTab(tabs[n], true);
    });
  });

  /* ---------- live 3D viewer ---------- */
  const launch = $("#launch-viewer");
  if (launch) {
    launch.addEventListener("click", () => {
      const stage = $(".browser-stage");
      const f = document.createElement("iframe");
      f.src = launch.dataset.src;
      f.title = "SP3D to Web3D — live plant viewer";
      f.loading = "lazy";
      f.allow = "fullscreen";
      f.setAttribute("allowfullscreen", "");
      stage.innerHTML = "";
      stage.appendChild(f);
    });
  }

  /* ---------- contact ---------- */
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const org = (fd.get("company") || "").toString().trim();
      const topic = (fd.get("topic") || "").toString();
      const msg = (fd.get("message") || "").toString().trim();
      if (!name || !msg) { form.reportValidity(); return; }
      const subject = `${topic} — ${name}${org ? " (" + org + ")" : ""}`;
      const body = `${msg}\n\n— ${name}${org ? "\n" + org : ""}${fd.get("email") ? "\n" + fd.get("email") : ""}`;
      location.href = `mailto:${D.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      const old = b.getAttribute("aria-label");
      b.setAttribute("aria-label", "Copied");
      b.innerHTML = ICON.check;
      setTimeout(() => { b.setAttribute("aria-label", old); b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'; }, 1600);
    } catch { location.href = "mailto:" + b.dataset.copy; }
  }));

  /* ---------- headings: word-by-word reveal ---------- */
  if (!reduce) {
    $$(".section-head h2, .about-copy h2, .spot-copy h2, .contact h2").forEach((h) => {
      let i = 0;
      const wrap = (node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const w = document.createElement("span"); w.className = "w";
              const inner = document.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) wrap(n);
        });
      };
      wrap(h);
      h.classList.add("split");
    });
  }

  /* ---------- experience timeline fills as you scroll ---------- */
  const tl = $(".timeline");
  if (tl) {
    const fill = document.createElement("span"); fill.className = "tl-fill"; fill.setAttribute("aria-hidden", "true"); tl.appendChild(fill);
    const upd = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      fill.style.transform = `scaleY(${p})`;
    };
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* ---------- cursor spotlight (desktop) ---------- */
  if (finePointer && !reduce) {
    const glow = document.createElement("div"); glow.className = "cursor-glow"; glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    let gx = 0, gy = 0, raf = 0;
    addEventListener("pointermove", (e) => {
      gx = e.clientX; gy = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => { glow.style.transform = `translate(${gx}px, ${gy}px)`; raf = 0; });
    }, { passive: true });
  }

  /* ---------- touch: play card previews when centred on screen ---------- */
  if (!finePointer && !reduce && "IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const card = en.target, v = $("video", card);
        if (!v) return;
        if (en.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().then(() => card.classList.add("is-playing")).catch(() => {}); }
        else { v.pause(); card.classList.remove("is-playing"); }
      });
    }, { threshold: 0.8 });
    $$(".card").forEach((c) => { if ($("video", c)) vio.observe(c); });
  }

  /* ---------- quick search (⌘K / Ctrl+K) ---------- */
  const cmd = $("#cmdk");
  if (cmd) {
    const input = $("input", cmd), list = $(".cmdk-list", cmd);
    const go = (sel) => () => { const el = $(sel); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
    const entries = [
      ...[["About", "#about"], ["SP3D AI Assistant", "#ai"], ["SP3D work", "#projects"], ["Live 3D viewer", "#live"], ["Skills", "#skills"], ["Experience", "#experience"], ["Other work & IoT", "#other"], ["Contact", "#contact"]]
        .map(([label, sel]) => ({ label, kind: "Section", run: go(sel) })),
      ...D.projects.map((p) => ({ label: p.title, kind: "SP3D project", run: () => openProject(p.id) })),
      ...(D.other || []).filter((o) => o.media).map((o) => ({ label: o.title, kind: "Project", run: () => openProject(o.id) })),
      ...(D.iot || []).map((o) => ({ label: o.title, kind: "IoT", run: () => openProject(o.id) })),
      { label: "Email Divyanshu", kind: "Action", run: () => { location.href = "mailto:" + D.email; } },
      { label: "Call Divyanshu", kind: "Action", run: () => { location.href = "tel:" + (D.phone || "").replace(/\s/g, ""); } },
      { label: "Open LinkedIn", kind: "Action", run: () => window.open("https://www.linkedin.com/in/divyanshu-00", "_blank", "noopener") },
      { label: "Open the live 3D viewer", kind: "Action", run: () => window.open("demos/sp3d-to-web3d/", "_blank", "noopener") },
    ];
    let shown = [], sel = 0, opener = null;
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = entries.filter((e) => !q || e.label.toLowerCase().includes(q) || e.kind.toLowerCase().includes(q)).slice(0, 12);
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length ? shown.map((e, k) => `<li role="option" id="cmdk-${k}" aria-selected="${k === sel}" data-k="${k}"><span>${esc(e.label)}</span><small>${esc(e.kind)}</small></li>`).join("") : `<li class="cmdk-empty">No matches</li>`;
      input.setAttribute("aria-activedescendant", shown.length ? "cmdk-" + sel : "");
      const cur = $(`[data-k="${sel}"]`, list); if (cur) cur.scrollIntoView({ block: "nearest" });
    };
    const open = () => { opener = document.activeElement; cmd.hidden = false; requestAnimationFrame(() => cmd.classList.add("is-open")); input.value = ""; sel = 0; render(); input.focus(); };
    const close = () => { cmd.classList.remove("is-open"); setTimeout(() => { cmd.hidden = true; }, 200); if (opener) opener.focus({ preventScroll: true }); };
    const pick = (k) => { const e = shown[k]; if (!e) return; close(); setTimeout(e.run, 60); };
    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === "Enter") { e.preventDefault(); pick(sel); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
    });
    list.addEventListener("click", (e) => { const li = e.target.closest("[data-k]"); if (li) pick(+li.dataset.k); });
    cmd.addEventListener("click", (e) => { if (e.target === cmd) close(); });
    document.addEventListener("keydown", (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); cmd.hidden ? open() : close(); }
      else if (e.key === "/" && !typing && cmd.hidden && modal.hidden) { e.preventDefault(); open(); }
    });
    $$("[data-cmdk]").forEach((b) => b.addEventListener("click", open));
  }

  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
