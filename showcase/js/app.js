/* =====================================================================
   Divyanshu Jain — Interactive Showcase · presentation engine
   Full-screen chapters, cinematic transitions, input handling and the
   interactive pieces inside each chapter. Content: js/data.js.
   The particle background (js/scene.js) is driven through window.Stage.
   ===================================================================== */
(function () {
  "use strict";

  const D = window.SHOWCASE || {};
  const G = window.gsap;
  const root = document.documentElement;
  if (!G) { root.classList.replace("js", "no-js"); return; }

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, "0");
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ""} aria-hidden="true"><use href="#${id}"/></svg>`;
  const glyph = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isSmall = () => innerWidth <= 820;
  const TEXTY = "p, .kicker, .eyebrow, .lede, .role, .hint, .clients, .legal, .conv-also, .conv-detail, .cf-caption";

  /* ---------- particle stage bridge (scene.js is a module and loads after this file) ---------- */
  const stage = (() => {
    const pending = new Map();
    let ready = false;
    const flush = () => {
      ready = true;
      ["setPalette", "setLayout", "morph", "loop"].forEach((m) => {
        if (pending.has(m) && window.Stage && window.Stage[m]) window.Stage[m](...pending.get(m));
      });
      pending.clear();
    };
    if (window.Stage) ready = true;
    else document.addEventListener("stage:ready", flush, { once: true });
    return (m, ...a) => {
      if (ready && window.Stage) { if (typeof window.Stage[m] === "function") window.Stage[m](...a); return; }
      if (m === "stopLoop") pending.delete("loop");
      else if (m === "setPalette" || m === "setLayout" || m === "morph" || m === "loop") pending.set(m, a);
    };
  })();

  /* ---------- pages + chrome ---------- */
  const pages = $$("#deck > .page");
  const N = pages.length;
  const ids = pages.map((p) => p.id);
  const pageIndex = (id) => ids.indexOf(id);
  let cur = -1;
  let busy = false;
  let queued = null;
  let queuedDir = 0;
  let navTl = null;

  const btnPrev = $("#btn-prev");
  const btnNext = $("#btn-next");
  const btnAuto = $("#btn-auto");
  const btnFull = $("#btn-full");
  const ctrNum = $("#ctr-num");
  const ctrTitle = $("#ctr-title");
  const nextTitle = $("#next-title");
  const nextSmall = $(".next-label small");
  const segNav = $("#segments");
  const bottomBar = $(".bottom");
  const ring = $(".auto-ring");
  const announcer = $("#announcer");
  const tc = $(".titlecard");
  const tcNum = $("#tc-num");
  const tcTitle = $("#tc-title");
  const sweepBand = $(".sweep span");
  const baseTitle = document.title;

  function renderChrome() {
    $("#ctr-total").textContent = pad(N);
    segNav.innerHTML = pages.map((p, i) =>
      `<button class="seg" data-go="${i}" aria-label="Chapter ${i + 1}: ${esc(p.dataset.title)}"><span class="seg-tip">${pad(i + 1)} · ${esc(p.dataset.title)}</span></button>`).join("");
    $("#ch-grid").innerHTML = pages.map((p, i) => {
      const c = (p.dataset.pal || "#5be3ff").split(",")[0].trim();
      const tag = (D.chapterTags || {})[p.id];
      return `<li><button class="ch" data-ch="${i}" style="--c:${esc(c)}"><small>${pad(i + 1)}</small><b>${esc(p.dataset.title)}</b><span>${esc(p.dataset.sub || "")}</span>${tag ? `<em>${esc(tag)}</em>` : ""}</button></li>`;
    }).join("");
  }

  function updateChrome(i, dir) {
    const p = pages[i];
    const last = i === N - 1;
    ctrNum.textContent = pad(i + 1);
    ctrTitle.textContent = p.dataset.title;
    if (!reduce) G.fromTo([ctrNum, ctrTitle], { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.05, overwrite: true });
    btnPrev.disabled = i === 0;
    nextSmall.textContent = last ? "Restart" : "Next";
    nextTitle.textContent = last ? pages[0].dataset.title : pages[i + 1].dataset.title;
    btnNext.setAttribute("aria-label", last ? "Restart the tour from the introduction" : `Next chapter: ${pages[i + 1].dataset.title}`);
    $$(".seg", segNav).forEach((s, k) => {
      s.classList.toggle("on", k === i);
      s.classList.toggle("done", k < i);
      if (k === i) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current");
    });
    $$(".ch").forEach((c, k) => c.setAttribute("aria-current", String(k === i)));
    bottomBar.style.setProperty("--prog", ((i + 1) / N).toFixed(4));
    document.title = i === 0 ? baseTitle : `${p.dataset.title} · Divyanshu Jain — SP3D Developer`;
    announcer.textContent = `Chapter ${i + 1} of ${N}: ${p.dataset.title} — ${p.dataset.sub || ""}`;
    const hash = i === 0 ? "" : "#/" + p.id;
    if ((location.hash || "") !== hash) {
      try { history.replaceState(null, "", location.pathname + location.search + hash); } catch (e) { /* ignore */ }
    }
  }

  function palette(p) {
    const [a, b] = (p.dataset.pal || "#5be3ff,#ff8f4d").split(",").map((s) => s.trim());
    root.style.setProperty("--acc", a);
    root.style.setProperty("--acc2", b);
    return [a, b];
  }
  function layoutOf(p) {
    try { return JSON.parse(p.dataset.layout || "{}"); } catch (e) { return {}; }
  }
  function stageFor(p, dir, first) {
    const [a, b] = palette(p);
    stage("stopLoop");
    stage("setPalette", a, b);
    stage("setLayout", layoutOf(p));
    stage("morph", p.dataset.shape || "scatter", { dir, duration: first ? 2.8 : 2.1 });
  }

  /* ---------- split headings into animatable letters ---------- */
  function splitText(el) {
    if (el.dataset.splitReady) return;
    el.dataset.splitReady = "1";
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const conv = (n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
          if (!part) return;
          if (/^[ \t\n\r]+$/.test(part)) { f.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "w";
          w.setAttribute("aria-hidden", "true");
          for (const ch of part) {
            const c = document.createElement("span");
            c.className = "c";
            c.textContent = ch;
            w.appendChild(c);
          }
          f.appendChild(w);
        });
        return f;
      }
      if (n.nodeType === 1) {
        if (n.tagName === "BR") return n.cloneNode(false);
        const e = n.cloneNode(false);
        Array.from(n.childNodes).forEach((ch) => e.appendChild(conv(ch)));
        return e;
      }
      return document.createTextNode("");
    };
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach((n) => frag.appendChild(conv(n)));
    el.textContent = "";
    el.appendChild(frag);
  }

  function countUp(el) {
    const end = parseFloat(el.dataset.count) || 0;
    const comma = el.dataset.format === "comma";
    const fmt = (v) => (comma ? Math.round(v).toLocaleString("en-US") : String(Math.round(v)));
    if (reduce) { el.textContent = fmt(end); return G.to({}, { duration: 0.01 }); }
    const o = { v: 0 };
    el.textContent = "0";
    return G.to(o, { v: end, duration: 1.7, ease: "power3.out", onUpdate: () => { el.textContent = fmt(o.v); } });
  }

  /* =====================================================================
     Transitions
     ===================================================================== */
  function leaveTl(p, dir) {
    const items = $$("[data-a], [data-split]", p);
    if (!items.length) return G.timeline();
    return G.timeline().to(items, {
      y: -28 * dir, opacity: 0, duration: reduce ? 0.12 : 0.38, ease: "power2.in", overwrite: "auto",
      stagger: { each: reduce ? 0 : 0.016, from: dir > 0 ? "start" : "end" },
    });
  }

  function sweepTl(dir) {
    const w = innerWidth;
    return G.timeline()
      .set(sweepBand, { opacity: 1, skewX: -14, x: dir > 0 ? -0.45 * w : 1.1 * w })
      .to(sweepBand, { x: dir > 0 ? 1.1 * w : -0.45 * w, duration: 0.95, ease: "power2.inOut" })
      .set(sweepBand, { opacity: 0 });
  }

  function titleTl(i) {
    tcNum.textContent = `${pad(i + 1)} / ${pad(N)}`;
    tcTitle.textContent = pages[i].dataset.title;
    return G.timeline()
      .fromTo(tc, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.out" })
      .fromTo(tcNum, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "power3.out" }, 0)
      .fromTo(tcTitle, { y: 34, opacity: 0, scale: 0.94, filter: "blur(14px)" }, { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }, "<0.04")
      .to([tcNum, tcTitle], { y: -26, opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power2.in", stagger: 0.03 }, "+=0.08")
      .to(tc, { opacity: 0, duration: 0.22, ease: "power1.in" }, "<0.1");
  }

  function enterTl(p, dir, first) {
    const tl = G.timeline();
    const heads = $$("[data-split]", p);
    const items = $$("[data-a]", p);
    const handled = new Set();
    G.set(heads, { opacity: 1, y: 0 });
    const fx = FX[p.id];
    if (fx && !reduce) fx(p, tl, dir, handled, first);

    heads.forEach((h, k) => {
      const chars = $$(".c", h);
      if (!chars.length) return;
      tl.fromTo(chars,
        { yPercent: 100 * dir, rotateX: -75 * dir, opacity: 0, transformPerspective: 600, transformOrigin: "50% 100%" },
        {
          yPercent: 0, rotateX: 0, opacity: 1, duration: reduce ? 0.25 : 1.0, ease: "expo.out",
          stagger: reduce ? 0 : { each: Math.min(0.024, 0.6 / chars.length), from: dir > 0 ? "start" : "end" },
        }, (first ? 0.25 : 0.05) + k * 0.08);
    });

    const blur = !reduce && !isSmall();
    let k = 0;
    items.forEach((el) => {
      if (handled.has(el)) return;
      const from = { y: 36 * dir, opacity: 0 };
      const to = { y: 0, opacity: 1, duration: reduce ? 0.25 : 0.95, ease: "expo.out" };
      if (blur && el.matches(TEXTY)) { from.filter = "blur(8px)"; to.filter = "blur(0px)"; to.clearProps = "filter"; }
      tl.fromTo(el, from, to, (first ? 0.35 : 0.14) + (k++) * (reduce ? 0.012 : 0.055));
    });

    $$("[data-count]", p).forEach((el, j) => tl.add(countUp(el), 0.45 + j * 0.1));
    return tl;
  }

  function go(target, opts = {}) {
    if (!(target >= 0 && target < N) || target === cur) return;
    if (busy) { queued = target; queuedDir = opts.dir || 0; return; }
    const from = cur;
    const first = from < 0;
    const dir = opts.dir || (first ? 1 : target > from ? 1 : -1);
    const out = first ? null : pages[from];
    const inn = pages[target];
    busy = true;
    cur = target;
    killAuto();
    if (navTl) navTl.kill();
    if (out) { const h = HOOKS[out.id]; if (h && h.leave) h.leave(out); }
    updateChrome(target, dir);

    const tl = G.timeline();
    navTl = tl;
    if (out) tl.add(leaveTl(out, dir), 0);
    tl.call(stageFor, [inn, dir, first], first ? 0 : 0.08);
    const swap = first ? 0 : reduce ? 0.2 : 0.6;
    if (!first && !reduce) {
      tl.add(sweepTl(dir), 0.1);
      tl.add(titleTl(target), 0.14);
    }
    tl.call(() => {
      pages.forEach((p) => p.classList.toggle("is-active", p === inn));
      inn.scrollTop = 0;
    }, null, swap);
    tl.add(enterTl(inn, dir, first), swap + 0.02);
    tl.call(() => {
      const h = HOOKS[inn.id];
      if (h && h.enter) h.enter(inn);
      warm(target);
    }, null, swap + 0.1);
    tl.call(() => {
      busy = false;
      if (queued !== null) {
        const q = queued, qd = queuedDir;
        queued = null; queuedDir = 0;
        if (q !== cur) { setTimeout(() => go(q, qd ? { dir: qd } : {}), 0); return; }
      }
      armAuto();
    }, null, swap + (reduce ? 0.3 : 0.75));
  }

  const head = () => (queued !== null ? queued : cur);
  function next() { const h = head(); go(h >= N - 1 ? 0 : h + 1, { dir: 1 }); }
  function prev() { const h = head(); if (h > 0) go(h - 1, { dir: -1 }); }

  /* load images for the chapters around the current one */
  function warm(i) {
    [i + 1, i - 1, i + 2].forEach((k) => {
      const p = pages[k];
      if (p) $$('img[loading="lazy"]', p).forEach((img) => { img.loading = "eager"; });
    });
  }

  /* =====================================================================
     Per-chapter entrance effects (added to the generic entrance)
     ===================================================================== */
  const FX = {
    intro(p, tl, dir, handled, first) {
      const t0 = first ? 0.3 : 0.05;
      tl.fromTo($(".arch", p),
        { clipPath: "inset(100% 0% 0% 0% round 999px 999px 32px 32px)" },
        { clipPath: "inset(0% 0% 0% 0% round 999px 999px 32px 32px)", duration: 1.5, ease: "expo.inOut", clearProps: "clipPath" }, t0);
      tl.fromTo($(".arch img", p), { scale: 1.18, yPercent: 10 }, { scale: 1, yPercent: 0, duration: 1.8, ease: "expo.out" }, t0 + 0.3);
      tl.fromTo($$(".float-tag", p), { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(2.2)", stagger: 0.12 }, t0 + 0.9);
    },
    about(p, tl, dir, handled) {
      const holo = $(".holo", p);
      handled.add(holo);
      tl.fromTo(holo,
        { clipPath: "inset(0% 0% 100% 0% round 26px)", opacity: 1, y: 0 },
        { clipPath: "inset(0% 0% 0% 0% round 26px)", duration: 1.4, ease: "power4.inOut", clearProps: "clipPath" }, 0.05);
      tl.fromTo($$(".focus-card", p), { rotateY: 35, transformPerspective: 900, transformOrigin: "0% 50%" }, { rotateY: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 0.55);
    },
    skills(p, tl, dir, handled) {
      tl.fromTo($(".orbit-rings", p), { scale: 0.4, rotate: -120, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, rotate: 0, opacity: 1, duration: 1.6, ease: "expo.out" }, 0.05);
      tl.fromTo($(".orbit-core", p), { scale: 0 }, { scale: 1, duration: 1.1, ease: "elastic.out(1, 0.55)" }, 0.25);
      tl.fromTo($$(".on-pill", p), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)", stagger: 0.09 }, 0.55);
      const panel = $("#skill-panel", p);
      handled.add(panel);
      tl.fromTo(panel, { x: 60 * dir, y: 0, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "expo.out" }, 0.45);
    },
    experience(p, tl, dir, handled) {
      const cards = $$(".xp-card", p);
      cards.forEach((c) => { setFlip(c, false); handled.add(c); });
      tl.fromTo(cards,
        { y: 180, rotation: (k) => (k - 1) * 10, rotateY: -30 * dir, opacity: 0, transformPerspective: 1400 },
        { y: 0, rotation: 0, rotateY: 0, opacity: 1, duration: 1.3, ease: "expo.out", stagger: 0.12 }, 0.2);
    },
    ai(p, tl, dir, handled) {
      const chatBox = $(".chat", p);
      handled.add(chatBox);
      tl.fromTo(chatBox,
        { x: 90 * dir, y: 0, rotateY: -22 * dir, opacity: 0, transformPerspective: 1600, transformOrigin: "100% 50%" },
        { x: 0, rotateY: 0, opacity: 1, duration: 1.4, ease: "expo.out" }, 0.2);
      tl.fromTo($$(".fact", p), { scale: 0.85 }, { scale: 1, duration: 0.9, ease: "back.out(1.8)", stagger: 0.08 }, 0.5);
    },
    mobile(p, tl, dir, handled) {
      const ph = $(".phone-stage", p);
      handled.add(ph);
      tl.fromTo(ph,
        { y: 140, rotateY: -35 * dir, rotateX: 12, opacity: 0, transformPerspective: 1400 },
        { y: 0, rotateY: 0, rotateX: 0, opacity: 1, duration: 1.5, ease: "expo.out" }, 0.1);
      tl.fromTo($$(".flow-node", p), { x: -40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.1 }, 0.6);
    },
    web3d(p, tl, dir, handled) {
      const br = $(".browser", p);
      const film = $(".filmstrip", p);
      handled.add(br);
      handled.add(film);
      tl.fromTo(br, { scale: 0.82, y: 30, rotateX: 14, opacity: 0, transformPerspective: 1600 }, { scale: 1, y: 0, rotateX: 0, opacity: 1, duration: 1.4, ease: "expo.out" }, 0.15);
      tl.fromTo(film, { x: 240 * dir, y: 0, opacity: 0 }, { x: 0, opacity: 1, duration: 1.4, ease: "expo.out" }, 0.45);
    },
    conversion(p, tl, dir, handled) {
      const cmp = $(".compare", p);
      handled.add(cmp);
      tl.fromTo(cmp,
        { x: 80 * dir, y: 0, rotateY: 18 * dir, opacity: 0, transformPerspective: 1600, transformOrigin: "0% 50%" },
        { x: 0, rotateY: 0, opacity: 1, duration: 1.4, ease: "expo.out" }, 0.2);
    },
    tools(p, tl, dir, handled) {
      const win = $("#tool-window", p);
      handled.add(win);
      tl.fromTo($$(".launch", p), { x: -50 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 0.3);
      tl.fromTo(win, { scale: 0.9, y: 40, opacity: 0, transformOrigin: "0% 50%" }, { scale: 1, y: 0, opacity: 1, duration: 1.3, ease: "expo.out" }, 0.35);
    },
    data(p, tl) {
      tl.fromTo($$(".pl-node", p), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.8)", stagger: 0.18 }, 0.4);
      const vertical = isSmall();
      tl.fromTo($$(".pl-wire", p),
        vertical ? { scaleY: 0, transformOrigin: "50% 0%" } : { scaleX: 0, transformOrigin: "0% 50%" },
        vertical ? { scaleY: 1, duration: 0.6, ease: "power2.out", stagger: 0.18 } : { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.18 }, 0.55);
      tl.fromTo($$(".d-card", p),
        { y: 70, rotateX: -24, opacity: 0, transformPerspective: 1000, transformOrigin: "50% 0%" },
        { y: 0, rotateX: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08 }, 0.6);
    },
    symbols(p, tl, dir, handled) {
      const fd = $(".flange-demo", p);
      handled.add(fd);
      tl.fromTo(fd, { scale: 0.86, rotate: -6 * dir, y: 0, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.3, ease: "expo.out" }, 0.15);
      tl.call(() => drawBolts(true), null, 0.55);
      tl.fromTo($$(".sb-tile", p), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.05 }, 0.7);
      tl.fromTo($$(".sb-art", p), { scale: 0.6, transformOrigin: "50% 60%" }, { scale: 1, duration: 0.8, ease: "back.out(2)", stagger: 0.05 }, 0.7);
    },
    theater(p, tl) {
      tl.call(fanCoverflow, null, 0.3);
    },
    beyond(p, tl, dir, handled) {
      const hf = $(".holo-feature", p);
      handled.add(hf);
      tl.fromTo(hf,
        { y: 60, rotateX: 16, opacity: 0, transformPerspective: 1400, transformOrigin: "50% 100%" },
        { y: 0, rotateX: 0, opacity: 1, duration: 1.3, ease: "expo.out" }, 0.2);
      tl.fromTo($$(".b-tile", p),
        { x: () => G.utils.random(-260, 260), y: () => G.utils.random(-160, 160), rotate: () => G.utils.random(-30, 30), scale: 0.5, opacity: 0 },
        { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1.4, ease: "expo.out", stagger: { each: 0.05, from: "random" } }, 0.35);
    },
    motion(p, tl) {
      tl.fromTo($$(".m-card", p),
        { y: 120, rotateY: (k) => (k - 1) * -24, rotateX: 16, opacity: 0, transformPerspective: 1400, transformOrigin: "50% 100%" },
        { y: 0, rotateY: 0, rotateX: 0, opacity: 1, duration: 1.3, ease: "expo.out", stagger: 0.12 }, 0.3);
    },
    iot(p, tl) {
      tl.fromTo($$(".iot-card", p),
        { y: 90, rotateX: -14, opacity: 0, transformPerspective: 1200 },
        { y: 0, rotateX: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.14 }, 0.35);
    },
    contact(p, tl, dir, handled) {
      const rows = $$(".c-row", p);
      rows.forEach((r) => handled.add(r));
      tl.fromTo(rows, { x: -70 * dir, y: 0, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.1 }, 0.5);
    },
  };

  /* =====================================================================
     Media helpers
     ===================================================================== */
  function playVideo(v) {
    if (!v || reduce) return;
    if (!v.getAttribute("src") && v.dataset.src) v.src = v.dataset.src;
    v.dataset.playing = "1";
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => {});
  }
  function pauseVideo(v) {
    if (!v) return;
    v.pause();
    delete v.dataset.playing;
  }
  function pausePageMedia() { $$("#deck video").forEach((v) => { if (!v.paused) { v.pause(); v.dataset.resume = "1"; } }); }
  function resumePageMedia() {
    $$("#deck video[data-resume]").forEach((v) => {
      delete v.dataset.resume;
      if (v.closest(".page") === pages[cur]) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
    });
  }

  /* =====================================================================
     03 · Skills orbit
     ===================================================================== */
  function rovingTabs(box, sel, onSelect) {
    box.addEventListener("keydown", (e) => {
      const items = $$(sel, box);
      const i = items.indexOf(document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % items.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + items.length) % items.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = items.length - 1;
      if (j === null) return;
      e.preventDefault();
      e.stopPropagation();
      items[j].focus();
      onSelect(j);
    });
  }

  function skillHTML(s) {
    return `<div class="sp-head"><span class="ico">${s.icon}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.sub)}</p></div></div>
      <p class="sp-intro">${esc(s.intro)}</p>
      <ul class="sp-items">${s.items.map((it) => `<li><b>${esc(it.name)}</b><span>${esc(it.desc)}</span></li>`).join("")}</ul>`;
  }
  function setSkill(i, user) {
    const s = (D.skills || [])[i];
    if (!s) return;
    $$("#orbit-nodes .orbit-node").forEach((b, k) => {
      b.setAttribute("aria-selected", String(k === i));
      b.tabIndex = k === i ? 0 : -1;
    });
    const panel = $("#skill-panel");
    panel.setAttribute("aria-labelledby", "sk-" + s.id);
    if (!user || reduce || !panel.children.length) { panel.innerHTML = skillHTML(s); return; }
    G.to(panel.children, {
      opacity: 0, y: -10, duration: 0.18, stagger: 0.02, overwrite: true,
      onComplete: () => {
        panel.innerHTML = skillHTML(s);
        G.fromTo($$(".sp-head, .sp-intro, .sp-items li", panel), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: "expo.out", stagger: 0.04 });
      },
    });
    stage("pulse");
  }
  function renderSkills() {
    const nodes = $("#orbit-nodes");
    if (!nodes || !D.skills) return;
    nodes.innerHTML = D.skills.map((s, i) =>
      `<button class="orbit-node" role="tab" id="sk-${s.id}" aria-controls="skill-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" style="--x:${s.x}%;--y:${s.y}%" data-skill="${i}"><span class="on-rot"><span class="on-pill"><span class="ico">${s.icon}</span><span>${esc(s.label)}<small>${esc(s.sub)}</small></span></span></span></button>`).join("");
    nodes.addEventListener("click", (e) => {
      const b = e.target.closest(".orbit-node");
      if (b) setSkill(+b.dataset.skill, true);
    });
    rovingTabs(nodes, ".orbit-node", (i) => setSkill(i, true));
    setSkill(0, false);
  }

  /* =====================================================================
     04 · Experience flip cards
     ===================================================================== */
  function setFlip(card, on) {
    card.classList.toggle("is-flipped", on);
    const front = $(".xp-front", card);
    const back = $(".xp-back", card);
    front.inert = on;
    back.inert = !on;
    front.setAttribute("aria-hidden", String(on));
    back.setAttribute("aria-hidden", String(!on));
  }
  function bindExperience() {
    $$(".xp-card").forEach((card) => {
      setFlip(card, false);
      $$(".xp-flip", card).forEach((b) => b.addEventListener("click", () => {
        const on = !card.classList.contains("is-flipped");
        setFlip(card, on);
        const target = $(on ? ".xp-back .xp-flip" : ".xp-front .xp-flip", card);
        setTimeout(() => target.focus({ preventScroll: true }), 50);
      }));
      bindTilt(card, 5);
    });
  }

  /* =====================================================================
     05 · AI Assistant chat simulation
     ===================================================================== */
  const SCRIPTS = {
    valve: {
      prompt: 'Add a gate valve with flanges on the selected 10" line',
      steps: [
        { tool: "sp3d_environment", note: "plant · model connection", ms: 650 },
        { tool: "sp3d_active_selection", note: '1 pipe run selected · 10"', ms: 850 },
        { tool: "sp3d_discover_tools", note: "piping placement tools", ms: 750 },
        { bot: 'I\'ll insert a <b>10" gate valve</b> with a flange pair at the selected point. Here is the preview — nothing is written until you approve.' },
        {
          approval: { title: "Place valve on the selected run", cols: ["Item", "Size", "Qty"], rows: [["Gate valve", '10"', "1"], ["Weld-neck flange", '10"', "2"], ["Gasket", '10"', "2"], ["Bolt set", '10"', "2"]], ok: "Approve & commit" },
          yes: [{ tool: "sp3d_action_run", note: "commit prepared changes", ms: 1100 }, { result: "Committed · 7 objects added to the model", pulse: true }],
          no: [{ result: "Discarded — nothing was written to the model", warn: true }],
        },
      ],
    },
    count: {
      prompt: "How many pipe runs are in this model?",
      steps: [
        { tool: "sp3d_environment", note: "connected plant", ms: 650 },
        { tool: "sp3d_discover_tools", note: "read-only query tools", ms: 800 },
        { bot: "In this sample plant: <b>312 pipe runs</b> across <b>58 pipelines</b>. Largest specs — <code>A1</code> 141 · <code>B2</code> 97 · <code>C3</code> 74." },
        { result: "Read-only — answered without an approval" },
      ],
    },
    sync: {
      prompt: "Sync the model with the catalog",
      steps: [
        { tool: "sp3d_capabilities", note: "saved actions", ms: 800 },
        { bot: "That's the <b>Synchronize Model with Catalog</b> operation in Project Management — a live UI task that updates out-of-date symbol occurrences and regenerates views. I'll run the saved action <code>ui_pm_sync_model</code>." },
        {
          approval: { title: "Run a saved Smart 3D action", cols: ["Step", "Value"], rows: [["Action", "ui_pm_sync_model"], ["Plant", "Open in Smart 3D"], ["Updates", "Out-of-date occurrences"]], ok: "Approve & run" },
          yes: [{ tool: "sp3d_action_run", note: "Synchronize Model with Catalog", ms: 1600 }, { result: "Done · model synchronized with the catalog", pulse: true }],
          no: [{ result: "Cancelled — the action was not run", warn: true }],
        },
      ],
    },
  };
  const chat = { log: $("#chat-log"), timers: [], touched: false, autoStart: null };
  const chatLater = (ms, fn) => { chat.timers.push(setTimeout(fn, ms)); };
  function chatStop() {
    chat.timers.forEach(clearTimeout);
    chat.timers = [];
    clearTimeout(chat.autoStart);
  }
  function chatAdd(html, cls) {
    const el = document.createElement("div");
    el.className = cls;
    el.innerHTML = html;
    chat.log.appendChild(el);
    if (!reduce) G.fromTo(el, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    chat.log.scrollTop = chat.log.scrollHeight;
    return el;
  }
  function chatPrompts(disabled, active) {
    $$(".prompt").forEach((b) => {
      b.disabled = disabled;
      if (active !== undefined) b.classList.toggle("is-on", b.dataset.script === active);
    });
  }
  function chatEmpty() {
    chatStop();
    chat.log.innerHTML = `<div class="chat-empty">${icon("i-cube")}Pick a prompt below. The assistant plans the work, calls Smart&nbsp;3D tools over MCP and asks before it writes anything.</div>`;
    chatPrompts(false, "");
  }
  function chatRun(name) {
    const sc = SCRIPTS[name];
    if (!sc) return;
    chatStop();
    chat.log.innerHTML = "";
    chatPrompts(true, name);
    chatAdd(esc(sc.prompt), "msg user");
    chatSeq(sc.steps, 0, 500);
  }
  function chatSeq(list, i, wait) {
    chatLater(wait, () => {
      if (i >= list.length) { chatPrompts(false); return; }
      const s = list[i];
      if (s.tool) {
        const el = chatAdd(`<span class="spin"></span><span><code>${esc(s.tool)}</code> <small>${esc(s.note)}</small></span>`, "tool");
        chatLater(s.ms || 800, () => { el.classList.add("done"); chatSeq(list, i + 1, 220); });
      } else if (s.bot) {
        const typing = chatAdd("<i></i><i></i><i></i>", "typing");
        chatLater(850, () => { typing.remove(); chatAdd(s.bot, "msg bot"); chatSeq(list, i + 1, 450); });
      } else if (s.approval) {
        const a = s.approval;
        const card = chatAdd(
          `<h4>${icon("i-check")}${esc(a.title)}<small>Needs approval</small></h4>
           <table><thead><tr>${a.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
           <tbody>${a.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
           <div class="acts"><button class="ok nudge" type="button">${esc(a.ok)}</button><button class="no" type="button">Discard</button></div>`, "approval");
        const ok = $(".ok", card);
        const no = $(".no", card);
        chatPrompts(false);
        let decided = false;
        const decide = (yes) => {
          if (decided) return;
          decided = true;
          ok.disabled = true;
          no.disabled = true;
          ok.classList.remove("nudge");
          chatPrompts(true);
          chatSeq(yes ? s.yes : s.no, 0, 250);
        };
        ok.addEventListener("click", () => decide(true));
        no.addEventListener("click", () => decide(false));
        if (auto) chatLater(2400, () => decide(true));
      } else if (s.result) {
        chatAdd(`${icon(s.warn ? "i-close" : "i-check")}<span>${esc(s.result)}</span>`, "result" + (s.warn ? " warn" : ""));
        if (s.pulse) stage("pulse");
        chatSeq(list, i + 1, 300);
      }
    });
  }
  function bindChat() {
    if (!chat.log) return;
    $$(".prompt").forEach((b) => b.addEventListener("click", () => { chat.touched = true; chatRun(b.dataset.script); }));
    chatEmpty();
  }
  function aiEnter() {
    chatEmpty();
    chat.touched = false;
    chat.autoStart = setTimeout(() => { if (pages[cur].id === "ai" && !chat.touched) chatRun("valve"); }, 1400);
  }
  function aiLeave() { chatStop(); }

  /* =====================================================================
     06 · Mobile
     ===================================================================== */
  let flowTimer = null;
  function mobileEnter(p) {
    playVideo($(".phone video", p));
    const nodes = $$(".flow-node", p);
    let k = 0;
    clearInterval(flowTimer);
    if (reduce) return;
    flowTimer = setInterval(() => {
      nodes.forEach((n, j) => n.classList.toggle("lit", j === k));
      k = (k + 1) % (nodes.length + 1);
    }, 850);
  }
  function mobileLeave(p) {
    clearInterval(flowTimer);
    pauseVideo($(".phone video", p));
    $$(".flow-node", p).forEach((n) => n.classList.remove("lit"));
  }

  /* =====================================================================
     07 · Web3D filmstrip
     ===================================================================== */
  function renderFilm() {
    const t = $("#film-track");
    if (!t || !D.sims) return;
    const item = (s, i, dup) =>
      `<button class="film-item" data-sim="${i}"${dup ? ' tabindex="-1" aria-hidden="true"' : ""} aria-label="${esc(s.label)} — enlarge"><img src="${esc(s.thumb || s.src)}" alt="" loading="lazy" width="448" height="252"><span>${esc(s.label)}</span></button>`;
    t.innerHTML = D.sims.map((s, i) => item(s, i, false)).join("") + D.sims.map((s, i) => item(s, i, true)).join("");
    t.addEventListener("click", (e) => {
      const b = e.target.closest(".film-item");
      if (b) openLightbox("SP3D → Web3D · simulations & renders", D.sims.map((s) => ({ src: s.src, cap: s.label })), +b.dataset.sim, b);
    });
  }

  /* =====================================================================
     08 · Conversion compare slider
     ===================================================================== */
  const cmpStage = $("#compare");
  const cmpRange = $(".cmp-range");
  let convKind = "plant3d";
  let convTween = null;
  function setCmp(v) {
    v = Math.max(0, Math.min(100, v));
    cmpStage.style.setProperty("--pos", v.toFixed(2) + "%");
    cmpRange.value = String(Math.round(v));
    const c = D.conv[convKind];
    cmpRange.setAttribute("aria-valuetext", `${Math.round(v)}% ${c ? c.source : "source"}, ${100 - Math.round(v)}% Smart 3D`);
  }
  function killConvSweep() { if (convTween) { convTween.kill(); convTween = null; } }
  function convSweep(delay) {
    killConvSweep();
    if (reduce) { setCmp(50); return; }
    const o = { v: parseFloat(cmpStage.style.getPropertyValue("--pos")) || 50 };
    const upd = () => setCmp(o.v);
    convTween = G.timeline({ delay: delay || 0 })
      .to(o, { v: 10, duration: 1.2, ease: "power2.inOut", onUpdate: upd })
      .to(o, { v: 90, duration: 1.8, ease: "power2.inOut", onUpdate: upd })
      .to(o, { v: 50, duration: 1.2, ease: "power2.inOut", onUpdate: upd });
  }
  function convHTML(c) {
    return `<p>${esc(c.summary)}</p>
      <ul class="checks">${c.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <ul class="chips">${c.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      <button class="btn btn-ghost magnetic" data-video="${esc(c.video)}">${icon("i-play")}Watch ${esc(c.source)} → SP3D · ${esc(c.dur)}</button>`;
  }
  function setConv(kind, user) {
    const c = (D.conv || {})[kind];
    if (!c) return;
    convKind = kind;
    $$(".p-conv [data-conv]").forEach((b) => {
      const on = b.dataset.conv === kind;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const det = $("#conv-detail");
    const swap = () => {
      const before = $(".cmp-before", cmpStage);
      const after = $(".cmp-after", cmpStage);
      before.src = c.before; before.alt = c.beforeAlt;
      after.src = c.after; after.alt = c.afterAlt;
      $(".cmp-l", cmpStage).textContent = c.source;
      det.innerHTML = convHTML(c);
      $$(".magnetic", det).forEach(bindMagnet);
      setCmp(parseFloat(cmpStage.style.getPropertyValue("--pos")) || 50);
    };
    if (!user || reduce) { swap(); return; }
    killConvSweep();
    G.timeline()
      .to([cmpStage, det], { opacity: 0, duration: 0.22, ease: "power2.in" })
      .call(swap)
      .to([cmpStage, det], { opacity: 1, duration: 0.5, ease: "power2.out" })
      .call(() => {
        G.fromTo($$("#conv-detail > *"), { y: 14 }, { y: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 });
        convSweep(0.2);
      });
    if (pages[cur] && pages[cur].id === "conversion") stage("morph", c.shape, { dir: kind === "revit" ? 1 : -1, duration: 2.2 });
  }
  function bindConversion() {
    if (!cmpStage) return;
    const tabs = $(".p-conv .tabs");
    tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-conv]"); if (b && b.dataset.conv !== convKind) setConv(b.dataset.conv, true); });
    rovingTabs(tabs, "[data-conv]", (i) => { const b = $$("[data-conv]", tabs)[i]; if (b.dataset.conv !== convKind) setConv(b.dataset.conv, true); });
    let dragging = false;
    const pct = (e) => { const r = cmpStage.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    cmpStage.addEventListener("pointerdown", (e) => {
      dragging = true;
      killConvSweep();
      try { cmpStage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      setCmp(pct(e));
    });
    cmpStage.addEventListener("pointermove", (e) => { if (dragging) setCmp(pct(e)); });
    const stop = () => { dragging = false; };
    cmpStage.addEventListener("pointerup", stop);
    cmpStage.addEventListener("pointercancel", stop);
    cmpRange.addEventListener("input", () => { killConvSweep(); setCmp(+cmpRange.value); });
    setConv("plant3d", false);
    setCmp(50);
  }

  /* =====================================================================
     09 · Tools launcher + window
     ===================================================================== */
  let toolIdx = 0;
  let toolTween = null;
  let toolAuto = true;
  function toolHTML(t, i) {
    const shot = t.shots[0];
    const watch = t.video ? `<button class="wb-video" data-video="${esc(t.video)}">${icon("i-play")}Watch · ${esc(t.dur)}</button>` : "";
    return `<div class="win-bar"><i></i><i></i><i></i><span>SP3D Tools — ${esc(t.title)}</span></div>
      <button class="win-shot" data-gallery="tool:${i}" aria-label="Enlarge the ${esc(t.title)} screenshots"><img src="${esc(shot.src)}" alt="${esc(shot.cap)}"><span class="zoom">${t.shots.length > 1 ? `${t.shots.length} screens · ` : ""}Enlarge</span></button>
      <div class="win-body">
        <div class="wb-head"><div><span class="wb-tag">${esc(t.tag)}</span><h3>${esc(t.title)}</h3></div>${watch}</div>
        <p>${esc(t.tagline)}</p>
        <ul class="checks">${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <ul class="chips">${t.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      </div>`;
  }
  function setTool(i, animate) {
    const t = (D.tools || [])[i];
    if (!t) return;
    toolIdx = i;
    $$("#launcher .launch").forEach((b, k) => {
      b.setAttribute("aria-selected", String(k === i));
      b.tabIndex = k === i ? 0 : -1;
      G.set($(".bar", b), { scaleX: 0 });
    });
    const win = $("#tool-window");
    win.setAttribute("aria-labelledby", "tl-" + t.id);
    if (!animate || reduce || !win.children.length) {
      win.innerHTML = toolHTML(t, i);
    } else {
      G.to(win.children, {
        opacity: 0, duration: 0.18, ease: "power2.in", overwrite: true,
        onComplete: () => {
          win.innerHTML = toolHTML(t, i);
          G.fromTo($(".win-shot img", win), { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" });
          G.fromTo($$(".win-body > *", win), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.04 });
        },
      });
      stage("pulse");
    }
    armToolCycle();
  }
  function armToolCycle() {
    if (toolTween) { toolTween.kill(); toolTween = null; }
    if (!toolAuto || reduce || !pages[cur] || pages[cur].id !== "tools") return;
    const bar = $(`#launcher .launch[data-tool="${toolIdx}"] .bar`);
    if (!bar) return;
    toolTween = G.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 6.5, ease: "none", onComplete: () => setTool((toolIdx + 1) % D.tools.length, true) });
  }
  function renderTools() {
    const L = $("#launcher");
    if (!L || !D.tools) return;
    L.innerHTML = D.tools.map((t, i) =>
      `<button class="launch spot" role="tab" id="tl-${t.id}" aria-controls="tool-window" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tool="${i}"><span class="ico">${esc(t.mono)}</span><span><b>${esc(t.title)}</b><small>${esc(t.tag)}</small></span>${icon("i-next", "go")}<span class="bar"></span></button>`).join("");
    L.addEventListener("click", (e) => {
      const b = e.target.closest(".launch");
      if (!b) return;
      toolAuto = false;
      if (+b.dataset.tool !== toolIdx) setTool(+b.dataset.tool, true); else armToolCycle();
    });
    rovingTabs(L, ".launch", (i) => { toolAuto = false; setTool(i, true); });
    setTool(0, false);
  }

  /* =====================================================================
     10 · Data cards
     ===================================================================== */
  function renderData() {
    const box = $("#data-cards");
    if (!box || !D.data) return;
    box.innerHTML = D.data.map((d, i) =>
      `<button class="d-card glass" data-gallery="data:${i}" aria-label="${esc(d.title)} — view screenshots"><span class="thumb"><img src="${esc(d.shots[0].src)}" alt="" loading="lazy">${d.shots.length > 1 ? `<em>${d.shots.length} screens</em>` : ""}</span><span class="body"><small>${esc(d.tag)}</small><strong class="dc-title">${esc(d.title)}</strong><span class="dc-text">${esc(d.tagline)}</span></span></button>`).join("");
  }

  /* =====================================================================
     11 · Flange bolts + support library
     ===================================================================== */
  /* NPS 10 · ASME B16.5 — flange OD, bolt circle and hole size drawn to scale (12.8 units per inch of radius) */
  const FLANGE = {
    150: { n: 12, dia: '7/8"', od: 102.4, bc: 91.2, hole: 6.4 },
    300: { n: 16, dia: '1"', od: 112, bc: 97.6, hole: 7.2 },
    600: { n: 16, dia: '1-1/4"', od: 128, bc: 108.8, hole: 8.8 },
  };
  let rating = 150;
  function drawBolts(animate) {
    const f = FLANGE[rating];
    const g = $("#fd-bolts");
    if (!g) return;
    const dur = animate && !reduce ? 0.8 : 0;
    G.to(".fd-face", { attr: { r: f.od }, duration: dur, ease: "expo.out" });
    G.to(".fd-bc", { attr: { r: f.bc }, duration: dur, ease: "expo.out" });
    const hex = (r) => Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI / 3) * k + Math.PI / 6;
      return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
    }).join(" ");
    g.innerHTML = Array.from({ length: f.n }, (_, k) => {
      const a = ((k + 0.5) / f.n) * Math.PI * 2 - Math.PI / 2;
      const x = 150 + Math.cos(a) * f.bc;
      const y = 150 + Math.sin(a) * f.bc;
      return `<g class="fd-bolt" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><g class="fd-b"><circle r="${f.hole}"/><polygon points="${hex(f.hole * 1.3)}"/><circle r="${(f.hole * 0.45).toFixed(2)}"/></g></g>`;
    }).join("");
    $("#fd-count").textContent = f.n;
    $("#fd-dia").textContent = f.dia;
    if (animate && !reduce) {
      G.fromTo($$(".fd-b", g), { scale: 0, rotation: -140, transformOrigin: "50% 50%" }, { scale: 1, rotation: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.035, delay: 0.15 });
    }
  }
  function bindSymbols() {
    $$(".fd-ctrl [data-rating]").forEach((b) => b.addEventListener("click", () => {
      if (+b.dataset.rating === rating) return;
      rating = +b.dataset.rating;
      $$(".fd-ctrl [data-rating]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      drawBolts(true);
      stage("pulse");
      if (!reduce) G.fromTo(["#fd-count", "#fd-dia"], { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out", stagger: 0.06 });
    }));
    drawBolts(false);

    const board = $("#sup-board");
    if (!board || !D.supports) return;
    renderSupportBoard();
    board.addEventListener("click", (e) => {
      const t = e.target.closest(".sb-tile");
      if (t) setSupport(+t.dataset.sup, true);
    });
    board.addEventListener("keydown", (e) => {
      const t = e.target.closest(".sb-tile");
      if (!t) return;
      const i = +t.dataset.sup;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSupport(i, true); return; }
      const n = D.supports.length;
      let j = null;
      if (e.key === "ArrowRight") j = (i + 1) % n;
      else if (e.key === "ArrowLeft") j = (i - 1 + n) % n;
      else if (e.key === "ArrowDown") j = Math.min(n - 1, i + supCols);
      else if (e.key === "ArrowUp") j = Math.max(0, i - supCols);
      if (j === null) return;
      e.preventDefault();
      e.stopPropagation();
      $(`#sup-board .sb-tile[data-sup="${j}"]`).focus();
      setSupport(j, true);
    });
  }

  /* support library board: eight clickable SVG tiles — 4 x 2 on wide screens, 2 x 4 on phones */
  let supIdx = 0;
  let supCols = 0;
  function renderSupportBoard() {
    const box = $("#sup-board");
    if (!box || !D.supports) return;
    const cols = isSmall() ? 2 : 4;
    if (cols === supCols && box.firstChild) return;
    supCols = cols;
    const TW = 272, TH = 240, GAP = 24;
    const rows = Math.ceil(D.supports.length / cols);
    const W = cols * TW + (cols - 1) * GAP;
    const H = rows * TH + (rows - 1) * GAP;
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${D.supports.map((sp, i) => {
      const x = (i % cols) * (TW + GAP);
      const y = Math.floor(i / cols) * (TH + GAP);
      return `<g class="sb-tile" data-sup="${i}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(sp.name)}"><rect class="sb-bg" width="${TW}" height="${TH}" rx="18"/><g class="sb-art">${sp.art}</g><text x="22" y="226">${esc(sp.name)}</text></g>`;
    }).join("")}</svg>`;
    setSupport(supIdx, false);
  }
  function setSupport(i, user) {
    const sp = (D.supports || [])[i];
    if (!sp) return;
    supIdx = i;
    $$("#sup-board .sb-tile").forEach((t, k) => {
      t.classList.toggle("on", k === i);
      t.setAttribute("aria-pressed", String(k === i));
    });
    $("#sup-note").innerHTML = `<b>${esc(sp.name)}</b> — ${esc(sp.note)}`;
    if (user) {
      stage("pulse");
      if (!reduce) G.fromTo(`#sup-board .sb-tile[data-sup="${i}"] .sb-art`, { scale: 0.86, transformOrigin: "50% 60%" }, { scale: 1, duration: 0.7, ease: "back.out(2.4)" });
    }
  }

  /* =====================================================================
     12 · Demo theater coverflow
     ===================================================================== */
  let cfIdx = 0;
  let cfDragged = false;
  function renderCoverflow() {
    const track = $("#cf-track");
    if (!track || !D.videos) return;
    track.innerHTML = D.videos.map((v, i) =>
      `<button class="cf-card${v.portrait ? " portrait" : ""}" data-cf="${i}" aria-label="${esc(v.title)} — ${v.live ? "open the live 3D viewer" : `play the demo, ${esc(v.dur)}`}">${v.portrait ? `<img class="bg" src="${esc(v.poster)}" alt="" loading="lazy">` : ""}<img class="fg" src="${esc(v.poster)}" alt="" loading="lazy">${v.preview ? `<video muted loop playsinline preload="none" data-src="${esc(v.preview)}" aria-hidden="true"></video>` : ""}<span class="cf-play">${icon(v.live ? "i-cube" : "i-play")}</span><span class="meta"><span><small>${esc(v.kicker)}</small><b>${esc(v.title)}</b></span><em>${esc(v.dur)}</em></span></button>`).join("");
    $$("video", track).forEach((vid) => vid.addEventListener("playing", () => vid.closest(".cf-card").classList.add("playing")));

    track.addEventListener("click", (e) => {
      const c = e.target.closest(".cf-card");
      if (!c || cfDragged) return;
      const i = +c.dataset.cf;
      if (i !== cfIdx) { setCF(i); return; }
      const v = D.videos[i];
      if (v.live) openViewer(c); else openVideo(v.id, c);
    });
    track.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      e.stopPropagation();
      setCF(cfIdx + (e.key === "ArrowRight" ? 1 : -1), true);
    });
    $(".cf-prev").addEventListener("click", () => setCF(cfIdx - 1));
    $(".cf-next").addEventListener("click", () => setCF(cfIdx + 1));

    const cf = $("#coverflow");
    let x0 = null;
    cf.addEventListener("pointerdown", (e) => { if (e.target.closest(".cf-arrow")) return; x0 = e.clientX; cfDragged = false; });
    cf.addEventListener("pointermove", (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 8) cfDragged = true; });
    const end = (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) setCF(cfIdx + (dx < 0 ? 1 : -1));
      setTimeout(() => { cfDragged = false; }, 0);
    };
    cf.addEventListener("pointerup", end);
    cf.addEventListener("pointercancel", () => { x0 = null; cfDragged = false; });
    setCF(0);
  }
  function setCF(i, focus) {
    const cards = $$("#cf-track .cf-card");
    if (!cards.length) return;
    cfIdx = Math.max(0, Math.min(cards.length - 1, i));
    const live = pages[cur] && pages[cur].id === "theater";
    cards.forEach((c, k) => {
      const o = k - cfIdx;
      const ao = Math.abs(o);
      c.style.setProperty("--o", o);
      c.style.setProperty("--ao", ao);
      c.style.zIndex = String(20 - ao);
      c.style.opacity = ao > 2 ? "0" : "";
      c.style.pointerEvents = ao > 2 ? "none" : "";
      c.classList.toggle("on", o === 0);
      c.tabIndex = o === 0 ? 0 : -1;
      if (o === 0) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
      const vid = $("video", c);
      if (vid) {
        if (o === 0 && live) playVideo(vid);
        else { pauseVideo(vid); c.classList.remove("playing"); }
      }
    });
    if (focus) cards[cfIdx].focus({ preventScroll: true });
    const v = D.videos[cfIdx];
    $("#cf-caption").innerHTML = `<h3>${esc(v.title)}</h3><p>${esc(v.desc)}</p><div class="cf-dots" aria-hidden="true">${D.videos.map((_, k) => `<i class="${k === cfIdx ? "on" : ""}"></i>`).join("")}</div>`;
    $(".cf-prev").disabled = cfIdx === 0;
    $(".cf-next").disabled = cfIdx === cards.length - 1;
  }
  function fanCoverflow() {
    const cards = $$("#cf-track .cf-card");
    cards.forEach((c) => { c.style.transition = "none"; c.style.setProperty("--o", 0); c.style.setProperty("--ao", 0); });
    void document.body.offsetWidth;
    cards.forEach((c) => { c.style.transition = ""; });
    requestAnimationFrame(() => setCF(cfIdx));
  }
  function theaterEnter() { if (reduce) setCF(cfIdx); }
  function theaterLeave() { $$("#cf-track video").forEach((v) => { pauseVideo(v); v.closest(".cf-card").classList.remove("playing"); }); }

  /* =====================================================================
     13 · Beyond · 14 · IoT
     ===================================================================== */
  function renderBeyond() {
    const box = $("#beyond-tiles");
    if (!box || !D.beyond) return;
    box.innerHTML = D.beyond.map((b) => `<div class="b-tile glass tilt"><span class="ico">${glyph(b.icon)}</span><small>${esc(b.cat)}</small><b>${esc(b.title)}</b><span>${esc(b.text)}</span></div>`).join("");
  }
  function renderIot() {
    const box = $("#iot-cards");
    if (!box || !D.iot) return;
    box.innerHTML = D.iot.map((d, i) =>
      `<article class="iot-card glass"><button class="iot-media" data-gallery="iot:${i}" aria-label="${esc(d.title)} — open the photo gallery"><img src="${esc(d.poster)}" alt="${esc(d.title)}" loading="lazy"><span class="zoom">${d.gallery.length} photos</span></button><div class="iot-body"><small>${esc(d.cat)}</small><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p><ul class="chips">${d.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div></article>`).join("");
  }
  function renderMotion() {
    const box = $("#motion-cards");
    if (!box || !D.motion) return;
    box.innerHTML = D.motion.map((m, i) => {
      const v = (D.videos || []).find((x) => x.id === m.video) || {};
      return `<article class="m-card glass tilt" data-i="${i}">
          <button class="m-media" data-video="${esc(m.video)}" aria-label="Play ${esc(m.title)} — ${esc(v.dur || "")}, muted">
            <img src="${esc(v.poster)}" alt="" loading="lazy">
            <video muted loop playsinline preload="none" data-src="${esc(v.preview)}" aria-hidden="true"></video>
            <span class="play-dot">${icon("i-play")}</span><span class="dur">${esc(v.dur || "")}</span>
          </button>
          <div class="m-body"><small>${esc(m.cat)}</small><h3>${esc(m.title)}</h3><p>${esc(m.text)}</p><ul class="chips">${m.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
        </article>`;
    }).join("");
    $$("video", box).forEach((vid) => vid.addEventListener("playing", () => vid.closest(".m-card").classList.add("playing")));
  }
  function motionEnter(p) {
    $$("#motion-cards video", p).forEach(playVideo);
    if (!reduce) stage("loop", ["skeleton", "skeleton2"], 2400, { dir: 0, turb: 0.1, duration: 1.4 });
  }
  function motionLeave(p) {
    $$("#motion-cards video", p).forEach((v) => { pauseVideo(v); v.closest(".m-card").classList.remove("playing"); });
  }

  let powerTimer = null;
  function setPower(on, user) {
    const p = $("#iot");
    const b = $("#power");
    if (!p || !b) return;
    p.classList.toggle("powered", on);
    b.setAttribute("aria-pressed", String(on));
    $("span", b).textContent = on ? "Powered on" : "Power on";
    $$(".iot-card", p).forEach((c, k) => {
      c.classList.remove("flicker");
      if (on && !reduce) setTimeout(() => { void c.offsetWidth; c.classList.add("flicker"); }, k * 160);
    });
    if (on && user !== false) stage("pulse");
  }
  function bindIot() {
    const b = $("#power");
    if (!b) return;
    b.addEventListener("click", () => {
      clearTimeout(powerTimer);
      setPower(!$("#iot").classList.contains("powered"), true);
    });
  }
  function iotEnter() {
    setPower(false, false);
    clearTimeout(powerTimer);
    powerTimer = setTimeout(() => { if (pages[cur].id === "iot") setPower(true); }, 1900);
  }
  function iotLeave() { clearTimeout(powerTimer); }

  const HOOKS = {
    ai: { enter: aiEnter, leave: aiLeave },
    mobile: { enter: mobileEnter, leave: mobileLeave },
    conversion: { enter: () => convSweep(1.1), leave: killConvSweep },
    tools: { enter: () => { toolAuto = true; armToolCycle(); }, leave: () => { if (toolTween) { toolTween.kill(); toolTween = null; } } },
    theater: { enter: theaterEnter, leave: theaterLeave },
    beyond: { enter: (p) => playVideo($(".hf-media video", p)), leave: (p) => pauseVideo($(".hf-media video", p)) },
    motion: { enter: motionEnter, leave: motionLeave },
    iot: { enter: iotEnter, leave: iotLeave },
  };

  /* =====================================================================
     Overlays: chapters, video, lightbox, live viewer
     ===================================================================== */
  let openOv = null;
  let lastFocus = null;
  const CLEAN = {
    "ov-video": () => {
      const v = $("#ov-video-stage video");
      if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
      $("#ov-video-stage").innerHTML = "";
    },
    "ov-viewer": () => { $("#viewer-stage").innerHTML = ""; },
    "ov-lightbox": () => { $("#lb-img").removeAttribute("src"); },
  };
  function openOverlay(ov, opener) {
    if (openOv) closeOverlay(true, true);
    lastFocus = opener || document.activeElement;
    ov.hidden = false;
    openOv = ov;
    pauseAuto();
    pausePageMedia();
    if (!reduce) {
      G.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      G.fromTo(ov.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.06 });
    }
    const f = ov.id === "ov-chapters" ? ($('.ch[aria-current="true"]', ov) || $("[data-close]", ov)) : $("[data-close]", ov);
    if (f) f.focus({ preventScroll: true });
  }
  function closeOverlay(instant, keepState) {
    const ov = openOv;
    if (!ov) return;
    openOv = null;
    const done = () => {
      ov.hidden = true;
      G.set([ov, ...ov.children], { clearProps: "opacity,transform" });
      const c = CLEAN[ov.id];
      if (c) c(ov);
    };
    if (instant || reduce) done();
    else G.to(ov, { opacity: 0, duration: 0.25, ease: "power2.in", onComplete: done });
    if (keepState) return;
    stage("setPaused", false);
    resumePageMedia();
    if (lastFocus && document.contains(lastFocus) && lastFocus.offsetParent !== null) lastFocus.focus({ preventScroll: true });
    resumeAuto();
  }
  function openChapters(opener) { openOverlay($("#ov-chapters"), opener); }
  function openVideo(id, opener) {
    const v = (D.videos || []).find((x) => x.id === id);
    if (!v) return;
    if (v.live) { openViewer(opener); return; }
    $("#ov-video-title").textContent = `${v.title} · ${v.dur}`;
    $("#ov-video-caption").textContent = v.desc || "";
    const st = $("#ov-video-stage");
    st.innerHTML = `<video controls autoplay playsinline${v.muted ? " muted" : ""} preload="auto" poster="${esc(v.poster)}" src="${esc(v.src)}" aria-label="${esc(v.title)} — demo video${v.muted ? " (muted)" : ""}"></video>`;
    openOverlay($("#ov-video"), opener);
    stage("setPaused", true);
    const vid = $("video", st);
    const pr = vid.play();
    if (pr && pr.catch) pr.catch(() => {});
  }
  function openViewer(opener) {
    const st = $("#viewer-stage");
    st.innerHTML = `<div class="viewer-loading"><i></i><span>Loading the sample plant · ≈16 MB</span></div>`;
    const f = document.createElement("iframe");
    f.src = "demo/sp3d-to-web3d/";
    f.title = "SP3D to Web3D — live 3D viewer of a sample plant";
    f.allow = "fullscreen";
    f.style.opacity = "0";
    f.addEventListener("load", () => { const l = $(".viewer-loading", st); if (l) l.remove(); f.style.opacity = "1"; }, { once: true });
    st.appendChild(f);
    openOverlay($("#ov-viewer"), opener);
    stage("setPaused", true);
  }

  const lb = { items: [], i: 0 };
  function showLb(d) {
    const n = lb.items.length;
    if (!n) return;
    lb.i = (lb.i + d + n) % n;
    const it = lb.items[lb.i];
    const img = $("#lb-img");
    img.src = it.src;
    img.alt = it.alt || it.cap || "";
    $("#lb-caption").textContent = (n > 1 ? `${lb.i + 1} / ${n} · ` : "") + (it.cap || "");
    if (d && !reduce) G.fromTo(img, { x: 50 * d, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
  }
  function openLightbox(title, items, start, opener) {
    if (!items || !items.length) return;
    lb.items = items;
    lb.i = start || 0;
    $("#lb-title").textContent = title;
    $$(".lb-arrow").forEach((a) => { a.hidden = items.length < 2; });
    showLb(0);
    openOverlay($("#ov-lightbox"), opener);
  }
  function openGallery(key, opener) {
    const [kind, idx] = String(key).split(":");
    if (idx === undefined) {
      const g = (D.galleries || {})[kind];
      if (g) openLightbox(g.title, g.items, 0, opener);
      return;
    }
    const i = +idx;
    if (kind === "tool") { const t = D.tools[i]; openLightbox(t.title, t.shots, 0, opener); }
    else if (kind === "data") { const d = D.data[i]; openLightbox(d.title, d.shots, 0, opener); }
    else if (kind === "iot") { const d = D.iot[i]; openLightbox(d.title, d.gallery, 0, opener); }
  }
  function trapFocus(e) {
    const f = $$('button:not([disabled]), [href], input, video[controls], iframe, [tabindex]:not([tabindex="-1"])', openOv)
      .filter((el) => !el.hidden && el.offsetParent !== null);
    if (!f.length) return;
    const a = f[0];
    const z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }

  /* =====================================================================
     Auto-play
     ===================================================================== */
  let auto = false;
  let autoTween = null;
  function setAuto(on) {
    auto = on;
    btnAuto.setAttribute("aria-pressed", String(on));
    $("use", btnAuto).setAttribute("href", on ? "#i-pause" : "#i-play");
    $("span", btnAuto).textContent = on ? "Pause" : "Auto-play";
    btnAuto.setAttribute("aria-label", on ? "Pause the automatic tour" : "Play the tour automatically");
    if (on) { armAuto(); toast("Auto-play on — sit back"); } else killAuto();
  }
  function armAuto() {
    killAuto();
    if (!auto || openOv || busy || cur < 0) return;
    const ms = ((D.autoplay || {})[pages[cur].id]) || 10000;
    autoTween = G.fromTo(ring, { scaleX: 0 }, { scaleX: 1, duration: ms / 1000, ease: "none", onComplete: () => go(cur >= N - 1 ? 0 : cur + 1, { dir: 1 }) });
  }
  function killAuto() {
    if (autoTween) autoTween.kill();
    autoTween = null;
    G.set(ring, { scaleX: 0 });
  }
  function pauseAuto() { if (autoTween) autoTween.pause(); }
  function resumeAuto() { if (!auto) return; if (autoTween) autoTween.resume(); else armAuto(); }

  /* =====================================================================
     Toast
     ===================================================================== */
  let toastEl = null;
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }
  function copyText(text) {
    const ok = () => toast("Email address copied");
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { toast(text); }
      ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
  }

  /* =====================================================================
     Pointer effects: spotlight, tilt, magnetic buttons, cursor aura
     ===================================================================== */
  function bindTilt(el, max) {
    if (!finePointer || reduce || !el || el._tilt) return;
    el._tilt = true;
    const m = max || 8;
    const rx = G.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = G.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
    G.set(el, { transformPerspective: 900 });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * m * 2);
      rx(-py * m * 2);
    });
    el.addEventListener("pointerleave", () => { rx(0); ry(0); });
  }
  function bindMagnet(el) {
    if (!finePointer || reduce || !el || el._mag) return;
    el._mag = true;
    const mx = G.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const my = G.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.28);
      my((e.clientY - (r.top + r.height / 2)) * 0.36);
    });
    el.addEventListener("pointerleave", () => { mx(0); my(0); });
  }
  function bindPointerFx() {
    if (!finePointer || reduce) return;
    const aura = document.createElement("div");
    aura.className = "cursor-aura";
    aura.setAttribute("aria-hidden", "true");
    document.body.appendChild(aura);
    const ax = G.quickTo(aura, "x", { duration: 0.7, ease: "power3" });
    const ay = G.quickTo(aura, "y", { duration: 0.7, ease: "power3" });
    let seen = false;
    addEventListener("pointermove", (e) => {
      if (!seen) { seen = true; root.classList.add("has-pointer"); G.set(aura, { x: e.clientX, y: e.clientY }); }
      ax(e.clientX);
      ay(e.clientY);
      const g = e.target.closest && e.target.closest(".glass, .spot");
      if (g) {
        const r = g.getBoundingClientRect();
        g.style.setProperty("--mx", `${e.clientX - r.left}px`);
        g.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { seen = false; root.classList.remove("has-pointer"); });
    $$(".tilt").forEach((el) => bindTilt(el));
    $$(".magnetic").forEach(bindMagnet);
  }

  /* =====================================================================
     Input: buttons, keys, wheel, swipe, hash
     ===================================================================== */
  function scrollableAncestor(el, d, vertical) {
    const pageEl = pages[cur];
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const ov = vertical ? cs.overflowY : cs.overflowX;
      if (ov === "auto" || ov === "scroll") {
        if (vertical) {
          if (n.scrollHeight > n.clientHeight + 2) {
            if (d > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 2) return true;
            if (d < 0 && n.scrollTop > 2) return true;
          }
        } else if (n.scrollWidth > n.clientWidth + 2) {
          if (d > 0 && n.scrollLeft + n.clientWidth < n.scrollWidth - 2) return true;
          if (d < 0 && n.scrollLeft > 2) return true;
        }
      }
      if (n === pageEl) break;
    }
    return false;
  }
  function bindInput() {
    btnNext.addEventListener("click", next);
    btnPrev.addEventListener("click", prev);
    btnAuto.addEventListener("click", () => setAuto(!auto));
    if (!document.fullscreenEnabled) btnFull.hidden = true;
    btnFull.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else root.requestFullscreen().catch(() => {});
    });

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-go], [data-next], [data-open], [data-close], [data-video], [data-lightbox], [data-gallery], [data-copy], [data-ch], .lb-prev, .lb-next");
      if (!t) return;
      if (t.matches("[data-ch]")) { closeOverlay(true); go(+t.dataset.ch); }
      else if (t.matches("[data-go]")) { if (openOv) closeOverlay(true); go(+t.dataset.go); }
      else if (t.matches("[data-next]")) next();
      else if (t.matches("[data-open]")) { if (t.dataset.open === "viewer") openViewer(t); else openChapters(t); }
      else if (t.matches("[data-close]")) closeOverlay();
      else if (t.matches("[data-video]")) openVideo(t.dataset.video, t);
      else if (t.matches("[data-lightbox]")) openGallery(t.dataset.lightbox, t);
      else if (t.matches("[data-gallery]")) openGallery(t.dataset.gallery, t);
      else if (t.matches("[data-copy]")) copyText(t.dataset.copy);
      else if (t.matches(".lb-prev")) showLb(-1);
      else if (t.matches(".lb-next")) showLb(1);
    });
    /* click on the dark backdrop of an overlay closes it */
    $$(".overlay").forEach((ov) => ov.addEventListener("click", (e) => {
      if (e.target === ov || e.target.classList.contains("lb-stage") || e.target.classList.contains("ov-video-stage")) closeOverlay();
    }));

    document.addEventListener("keydown", (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (openOv) {
        if (e.key === "Escape") { e.preventDefault(); closeOverlay(); }
        else if (e.key === "Tab") trapFocus(e);
        else if (openOv.id === "ov-lightbox" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { e.preventDefault(); showLb(e.key === "ArrowRight" ? 1 : -1); }
        return;
      }
      const t = e.target;
      const inField = t.closest && t.closest("input, textarea, select, [contenteditable], [role=tablist], .cf-track");
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          if (inField && e.key === "ArrowRight") return;
          e.preventDefault(); next(); break;
        case "ArrowLeft":
        case "PageUp":
          if (inField && e.key === "ArrowLeft") return;
          e.preventDefault(); prev(); break;
        case "ArrowDown":
        case "ArrowUp": {
          if (inField) return;
          const p = pages[cur];
          if (p && p.scrollHeight > p.clientHeight + 4) return;
          e.preventDefault();
          if (e.key === "ArrowDown") next(); else prev();
          break;
        }
        case " ":
          if (t.closest && t.closest("button, a, input, video, textarea, select, summary")) return;
          e.preventDefault();
          if (e.shiftKey) prev(); else next();
          break;
        case "Home":
          if (inField) return;
          e.preventDefault(); go(0); break;
        case "End":
          if (inField) return;
          e.preventDefault(); go(N - 1); break;
        default:
      }
    });

    let wheelAcc = 0;
    let wheelLocked = false;
    let wheelIdle = null;
    let wheelUntil = 0;
    addEventListener("wheel", (e) => {
      if (openOv || e.ctrlKey) return;
      const vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
      const d = vertical ? e.deltaY : e.deltaX;
      if (!d) return;
      if (scrollableAncestor(e.target, d, vertical)) { wheelAcc = 0; return; }
      e.preventDefault();
      clearTimeout(wheelIdle);
      wheelIdle = setTimeout(() => { wheelAcc = 0; wheelLocked = false; }, 200);
      if (wheelLocked || performance.now() < wheelUntil) return;
      wheelAcc += d;
      if (Math.abs(wheelAcc) >= 45) {
        wheelLocked = true;
        wheelUntil = performance.now() + 850;
        const forward = wheelAcc > 0;
        wheelAcc = 0;
        if (forward) next(); else prev();
      }
    }, { passive: false });

    let ts = null;
    addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { ts = null; return; }
      const t = e.target;
      if (!openOv && t.closest && t.closest("input, .compare-stage, .coverflow, .chat-log, [data-noswipe]")) { ts = null; return; }
      const p = e.touches[0];
      ts = { x: p.clientX, y: p.clientY, t: performance.now() };
    }, { passive: true });
    addEventListener("touchend", (e) => {
      if (!ts) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - ts.x;
      const dy = p.clientY - ts.y;
      const dt = performance.now() - ts.t;
      ts = null;
      if (dt > 800 || Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      if (openOv) { if (openOv.id === "ov-lightbox") showLb(dx < 0 ? 1 : -1); return; }
      if (dx < 0) next(); else prev();
    }, { passive: true });

    addEventListener("hashchange", () => {
      const i = indexFromHash();
      if (i >= 0 && i !== cur) go(i);
    });

    let rz = null;
    addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => { if (cur >= 0) stage("setLayout", layoutOf(pages[cur])); renderSupportBoard(); }, 200);
    }, { passive: true });

    document.addEventListener("visibilitychange", () => { if (document.hidden) pauseAuto(); else if (!openOv) resumeAuto(); });
  }
  function indexFromHash() {
    const h = decodeURIComponent((location.hash || "").replace(/^#\/?/, ""));
    return h ? ids.indexOf(h) : -1;
  }

  /* =====================================================================
     Boot
     ===================================================================== */
  function boot() {
    renderChrome();
    renderSkills();
    renderFilm();
    renderTools();
    renderData();
    renderCoverflow();
    renderBeyond();
    renderMotion();
    renderIot();
    bindExperience();
    bindChat();
    bindConversion();
    bindSymbols();
    bindIot();
    $$("[data-split]").forEach(splitText);
    bindInput();
    bindPointerFx();

    const start = Math.max(0, indexFromHash());
    const first = pages[start];
    G.set($$("[data-a], [data-split]", first), { opacity: 0 });
    first.classList.add("is-active");
    const fontsReady = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
      : Promise.resolve();
    fontsReady.then(() => {
      go(start, { dir: 1 });
      if (!finePointer && "ontouchstart" in window) {
        let seenHint = false;
        try { seenHint = sessionStorage.getItem("sc-swipe") === "1"; sessionStorage.setItem("sc-swipe", "1"); } catch (e) { /* private mode */ }
        if (!seenHint) setTimeout(() => toast("Swipe ← → to move between chapters"), 2600);
      }
    });
  }

  boot();
})();
