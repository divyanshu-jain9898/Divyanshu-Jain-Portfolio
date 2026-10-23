// Interactive 3D plant module for the hero — pipe rack, piping, valves,
// supports and equipment that "auto-model" into place. Hover a component
// to see SP3D-style properties.
import * as THREE from "three";

const canvas = document.getElementById("hero-canvas");
const hero = document.querySelector(".hero");
const tip = document.getElementById("hero-tooltip");

if (canvas && hero) {
  try { init(); } catch (err) { console.warn("3D scene unavailable:", err); }
}

function init() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 960px)").matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05080e, 26, 70);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  const target = new THREE.Vector3(small ? 2 : -13, 4.2, 0);

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x0a0f18, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(14, 22, 10);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x4fe3c1, 0.9);
  rim.position.set(-18, 8, -14);
  scene.add(rim);

  // ---------- materials ----------
  const mat = {
    steel: new THREE.MeshStandardMaterial({ color: 0x33445e, metalness: 0.55, roughness: 0.5 }),
    pipe: new THREE.MeshStandardMaterial({ color: 0xb7c6d8, metalness: 0.35, roughness: 0.38 }),
    pipeAccent: new THREE.MeshStandardMaterial({ color: 0x4fe3c1, metalness: 0.25, roughness: 0.35, emissive: 0x0b3a30, emissiveIntensity: 0.6 }),
    pipeWarm: new THREE.MeshStandardMaterial({ color: 0xd9a650, metalness: 0.3, roughness: 0.42 }),
    flange: new THREE.MeshStandardMaterial({ color: 0xdfe8f2, metalness: 0.5, roughness: 0.3 }),
    valve: new THREE.MeshStandardMaterial({ color: 0xf7b23b, metalness: 0.35, roughness: 0.4, emissive: 0x3a2400, emissiveIntensity: 0.4 }),
    equip: new THREE.MeshStandardMaterial({ color: 0x5a6e8a, metalness: 0.45, roughness: 0.45 }),
    support: new THREE.MeshStandardMaterial({ color: 0x7c8ea8, metalness: 0.4, roughness: 0.5 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x1a2433, metalness: 0.0, roughness: 0.95 }),
  };
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x4fe3c1, transparent: true, opacity: 0.12 });

  const plant = new THREE.Group();
  scene.add(plant);
  const pickables = [];   // meshes that show a tooltip
  const builds = [];      // objects that animate in

  function tag(obj, info, delay) {
    obj.userData.info = info;
    obj.userData.delay = delay;
    obj.userData.group = /pip/i.test(info.disc) ? "piping" : /support/i.test(info.disc) ? "supports" : /equip/i.test(info.disc) ? "equipment" : "structure";
    obj.traverse((m) => { if (m.isMesh) { m.userData.root = obj; pickables.push(m); } });
    builds.push(obj);
    obj.scale.setScalar(0.0001);
    plant.add(obj);
    return obj;
  }
  function mesh(geo, material, edges = true) {
    const m = new THREE.Mesh(geo, material);
    if (edges && !small) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), edgeMat);
      m.add(e);
    }
    return m;
  }
  const delayFor = (x) => 0.15 + (x + 18) * 0.045;

  // ---------- ground ----------
  const grid = new THREE.GridHelper(80, 80, 0x1c3a3a, 0x121c2a);
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  scene.add(grid);

  // ---------- pipe rack (structure) ----------
  const bays = [-12, -6, 0, 6, 12];
  const rackZ = [-2.6, 2.6];
  const levels = [4, 7.2];
  bays.forEach((x) => {
    const g = new THREE.Group();
    rackZ.forEach((z) => {
      const col = mesh(new THREE.BoxGeometry(0.42, 7.6, 0.42), mat.steel);
      col.position.set(x, 3.8, z);
      g.add(col);
      const ped = mesh(new THREE.BoxGeometry(1.1, 0.5, 1.1), mat.concrete, false);
      ped.position.set(x, 0.25, z);
      g.add(ped);
    });
    levels.forEach((y) => {
      const beam = mesh(new THREE.BoxGeometry(0.36, 0.42, 5.6), mat.steel);
      beam.position.set(x, y, 0);
      g.add(beam);
    });
    tag(g, { name: `Rack frame RF-${String(bays.indexOf(x) + 1).padStart(2, "0")}`, cls: "Member System", spec: "W10x33", disc: "Structure" }, delayFor(x) * 0.6);
  });
  // longitudinal stringers + bracing
  levels.forEach((y, li) => rackZ.forEach((z) => {
    const s = mesh(new THREE.BoxGeometry(24, 0.3, 0.3), mat.steel);
    s.position.set(0, y, z);
    tag(s, { name: `Stringer ST-${li + 1}${z < 0 ? "N" : "S"}`, cls: "Linear Member", spec: "W8x18", disc: "Structure" }, 0.4 + li * 0.1);
  }));
  if (!small) {
    [-9, 3].forEach((cx) => rackZ.forEach((z) => {
      const len = Math.hypot(6, 3.2);
      const br = mesh(new THREE.BoxGeometry(len, 0.18, 0.18), mat.steel);
      br.position.set(cx, 5.6, z);
      br.rotation.z = Math.atan2(3.2, 6);
      tag(br, { name: "Vertical brace VB", cls: "Linear Member", spec: "L4x4x3/8", disc: "Structure" }, 0.7);
    }));
  }

  // ---------- piping ----------
  const runs = [
    { y: levels[0] + 0.45, z: -1.7, r: 0.26, m: mat.pipe, name: "P-1201-8\"-CS150", npd: '8"', spec: "CS150" },
    { y: levels[0] + 0.38, z: -0.6, r: 0.18, m: mat.pipe, name: "P-1202-6\"-CS150", npd: '6"', spec: "CS150" },
    { y: levels[0] + 0.52, z: 0.6, r: 0.32, m: mat.pipeAccent, name: "P-1203-10\"-CS300", npd: '10"', spec: "CS300", flow: true },
    { y: levels[0] + 0.36, z: 1.75, r: 0.16, m: mat.pipeWarm, name: "LS-1204-4\"-SS150", npd: '4"', spec: "SS150" },
    { y: levels[1] + 0.4, z: -1.1, r: 0.22, m: mat.pipe, name: "CW-1301-6\"-CS150", npd: '6"', spec: "CS150" },
    { y: levels[1] + 0.34, z: 1.2, r: 0.15, m: mat.pipeWarm, name: "ST-1302-3\"-AS300", npd: '3"', spec: "AS300" },
  ];
  const x0 = -16, x1 = 14.5;
  runs.forEach((p, i) => {
    const g = new THREE.Group();
    const len = x1 - x0;
    const tube = mesh(new THREE.CylinderGeometry(p.r, p.r, len, small ? 14 : 22, 1), p.m);
    tube.rotation.z = Math.PI / 2;
    tube.position.set((x0 + x1) / 2, p.y, p.z);
    g.add(tube);
    // flanges
    if (!small) {
      [-9, 3, 9].forEach((fx) => {
        const fl = mesh(new THREE.CylinderGeometry(p.r * 1.75, p.r * 1.75, 0.14, 24), mat.flange, false);
        fl.rotation.z = Math.PI / 2;
        fl.position.set(fx + i * 0.35, p.y, p.z);
        g.add(fl);
      });
    }
    tag(g, { name: p.name, cls: "Pipe Run", npd: p.npd, spec: p.spec, disc: "Piping" }, 1.0 + i * 0.12);
    // shoes / guides on each beam (support library)
    bays.forEach((bx, bi) => {
      if (small && bi % 2) return;
      const shoe = mesh(new THREE.BoxGeometry(0.5, p.y - (p.y > levels[1] ? levels[1] : levels[0]) - p.r, 0.34), mat.support, false);
      const base = p.y > levels[1] ? levels[1] : levels[0];
      shoe.position.set(bx, base + 0.21 + (p.y - base - p.r - 0.21) / 2, p.z);
      const types = ["Shoe", "Guide", "Axial stop", "Hold-down"];
      tag(shoe, { name: `${types[(bi + i) % 4]} SP-${100 + i * 10 + bi}`, cls: "Pipe Support", spec: `${p.npd} · auto-sized`, disc: "Hangers & Supports" }, 1.6 + bi * 0.05 + i * 0.03);
    });
  });

  // drop from the accent line into the vessel: elbow + vertical + valve
  const acc = runs[2];
  const elbowR = 1.1;
  const dropX = x1 + elbowR;
  const elbowGeo = new THREE.TorusGeometry(elbowR, acc.r, 14, 24, Math.PI / 2);
  const drop = new THREE.Group();
  const elbow = mesh(elbowGeo, mat.pipeAccent);
  elbow.position.set(x1, acc.y - elbowR, acc.z);
  drop.add(elbow);
  const R2 = 0.8, nozY = 1.5;
  const yb = nozY + R2;
  const vLen = acc.y - elbowR - yb;
  const vert = mesh(new THREE.CylinderGeometry(acc.r, acc.r, vLen, 20), mat.pipeAccent);
  vert.position.set(dropX, acc.y - elbowR - vLen / 2, acc.z);
  drop.add(vert);
  const elbow2 = mesh(new THREE.TorusGeometry(R2, acc.r, 14, 24, Math.PI / 2), mat.pipeAccent);
  elbow2.rotation.z = Math.PI;
  elbow2.position.set(dropX + R2, yb, acc.z);
  drop.add(elbow2);
  const vx = dropX + R2 + 1.9 + 1.5;
  const stubLen = vx - 1.5 - (dropX + R2);
  const stub = mesh(new THREE.CylinderGeometry(acc.r, acc.r, stubLen, 20), mat.pipeAccent);
  stub.rotation.z = Math.PI / 2;
  stub.position.set(dropX + R2 + stubLen / 2, nozY, acc.z);
  drop.add(stub);
  tag(drop, { name: "P-1203 drop to V-1205", cls: "Pipe Run", npd: '10"', spec: "CS300", disc: "Piping" }, 2.3);

  function gateValve(r) {
    const v = new THREE.Group();
    const body = mesh(new THREE.CylinderGeometry(r * 1.55, r * 1.55, r * 3.2, 20), mat.valve);
    v.add(body);
    const f1 = mesh(new THREE.CylinderGeometry(r * 1.9, r * 1.9, 0.14, 24), mat.flange, false);
    f1.position.y = r * 1.6; v.add(f1);
    const f2 = f1.clone(); f2.position.y = -r * 1.6; v.add(f2);
    const bonnet = mesh(new THREE.CylinderGeometry(r * 0.8, r * 1.1, r * 3, 16), mat.valve);
    bonnet.rotation.x = Math.PI / 2; bonnet.position.z = r * 2.4; v.add(bonnet);
    const stem = mesh(new THREE.CylinderGeometry(0.05, 0.05, r * 2.2, 8), mat.flange, false);
    stem.rotation.x = Math.PI / 2; stem.position.z = r * 4.6; v.add(stem);
    const wheel = mesh(new THREE.TorusGeometry(r * 1.5, 0.07, 8, 28), mat.valve, false);
    wheel.position.z = r * 5.6; v.add(wheel);
    return v;
  }
  const gv = gateValve(acc.r);
  gv.position.set(dropX, acc.y - elbowR - vLen * 0.5, acc.z);
  tag(gv, { name: "GV-1203A Gate Valve", cls: "Piping Component", npd: '10"', spec: "CS300 · RF", disc: "Piping" }, 2.6);

  // ---------- equipment ----------
  const vessel = new THREE.Group();
  const shell = mesh(new THREE.CylinderGeometry(1.5, 1.5, 5.2, 32), mat.equip);
  shell.position.y = 2.6 + 0.6;
  vessel.add(shell);
  const head = mesh(new THREE.SphereGeometry(1.5, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat.equip);
  head.position.y = 5.8; vessel.add(head);
  const skirt = mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.6, 32), mat.concrete, false);
  skirt.position.y = 0.3; vessel.add(skirt);
  vessel.position.set(vx, 0, acc.z);
  tag(vessel, { name: "V-1205 Separator", cls: "Equipment", spec: "1500 ID × 5200 T/T", disc: "Equipment" }, 2.0);

  const drum = new THREE.Group();
  const dshell = mesh(new THREE.CylinderGeometry(1.1, 1.1, 6, 28), mat.equip);
  dshell.rotation.z = Math.PI / 2; dshell.position.y = 2.1; drum.add(dshell);
  [-1, 1].forEach((s) => {
    const cap = mesh(new THREE.SphereGeometry(1.1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat.equip);
    cap.rotation.z = -s * Math.PI / 2; cap.position.set(s * 3, 2.1, 0); drum.add(cap);
    const saddle = mesh(new THREE.BoxGeometry(0.5, 1.2, 1.8), mat.concrete, false);
    saddle.position.set(s * 1.8, 0.6, 0); drum.add(saddle);
  });
  drum.position.set(-6, 0, 7.5);
  tag(drum, { name: "D-1101 Reflux Drum", cls: "Equipment", spec: "2200 ID × 6000 T/T", disc: "Equipment" }, 1.8);

  const pump = new THREE.Group();
  const skid = mesh(new THREE.BoxGeometry(3.2, 0.35, 1.3), mat.concrete, false);
  skid.position.y = 0.18; pump.add(skid);
  const volute = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.6, 24), mat.pipeWarm);
  volute.rotation.x = Math.PI / 2; volute.position.set(-0.8, 0.95, 0); pump.add(volute);
  const motor = mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.6, 20), mat.equip);
  motor.rotation.z = Math.PI / 2; motor.position.set(0.7, 0.85, 0); pump.add(motor);
  pump.position.set(-17.5, 0, 6);
  tag(pump, { name: "P-1102A Centrifugal Pump", cls: "Equipment", spec: "HCPump · 3\"×2\"", disc: "Equipment" }, 1.4);

  if (!small) {
    // a ladder + cage on the vessel (civil / access)
    const ladder = new THREE.Group();
    [-0.22, 0.22].forEach((o) => {
      const rail = mesh(new THREE.BoxGeometry(0.05, 5.6, 0.05), mat.support, false);
      rail.position.set(o, 2.8, 0); ladder.add(rail);
    });
    for (let k = 0; k < 14; k++) {
      const rung = mesh(new THREE.BoxGeometry(0.44, 0.04, 0.04), mat.support, false);
      rung.position.set(0, 0.4 + k * 0.38, 0); ladder.add(rung);
    }
    ladder.position.set(vx + 0.2, 0.6, acc.z - 1.75);
    ladder.rotation.y = Math.PI / 2;
    tag(ladder, { name: "LD-1205 Ladder", cls: "Ladder", spec: "Caged · 5.6 m", disc: "Civil / Access" }, 2.2);
  }

  plant.position.x = small ? 0 : 3;
  plant.rotation.y = -0.1;

  // ---------- flow particles along the accent line ----------
  const pathPts = [
    new THREE.Vector3(x0, acc.y, acc.z),
    new THREE.Vector3(x1, acc.y, acc.z),
    new THREE.Vector3(x1 + elbowR * 0.7, acc.y - elbowR * 0.3, acc.z),
    new THREE.Vector3(dropX, acc.y - elbowR, acc.z),
    new THREE.Vector3(dropX, yb, acc.z),
    new THREE.Vector3(dropX + R2 * 0.3, nozY + R2 * 0.3, acc.z),
    new THREE.Vector3(dropX + R2, nozY, acc.z),
    new THREE.Vector3(vx - 1.5, nozY, acc.z),
  ];
  const curve = new THREE.CatmullRomCurve3(pathPts, false, "centripetal", 0.05);
  const N = small ? 26 : 48;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(N * 3);
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x9ff7e3, size: small ? 0.28 : 0.22, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const particles = new THREE.Points(pGeo, pMat);
  plant.add(particles);
  const tmp = new THREE.Vector3();

  // ---------- sizing ----------
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // ---------- interaction ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  let hovered = null;
  let lastPick = 0;

  const drag = { on: false, x: 0, y: 0, moved: 0, az: 0, el: 0, vaz: 0 };
  const isBg = (t) => !(t.closest && t.closest("a, button, h1, p, .hero-visual, .status-pill, .hero-stats, .hero-controls, input"));
  hero.addEventListener("pointerdown", (e) => {
    if (!isBg(e.target) || e.button > 0) return;
    drag.on = true; drag.touch = e.pointerType === "touch"; drag.x = e.clientX; drag.y = e.clientY; drag.moved = 0; drag.vaz = 0;
    if (!drag.touch) hero.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag.on) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.touch) return; // touch scrolls the page; taps still inspect
    drag.vaz = -dx * 0.006;
    drag.az += drag.vaz;
    drag.el = Math.max(-0.25, Math.min(0.45, drag.el + dy * 0.003));
  }, { passive: true });
  window.addEventListener("pointercancel", () => { drag.on = false; hero.classList.remove("is-dragging"); });
  window.addEventListener("pointerup", (e) => {
    if (!drag.on) return;
    drag.on = false; hero.classList.remove("is-dragging");
    if (drag.moved < 6 && isBg(e.target) && built) {
      // tap / click: inspect the component under the pointer
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables.filter((m) => m.userData.root.visible), false)[0];
      setHover(hit ? hit.object.userData.root : null, e.clientX, e.clientY);
    }
  });

  function onMove(e) {
    const r = hero.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (drag.on || e.pointerType === "touch") return;
    const t = e.target;
    const overContent = !isBg(t);
    const now = performance.now();
    if (overContent || now - lastPick < 40 || !built) { if (overContent) setHover(null); return; }
    lastPick = now;
    ndc.set(pointer.tx, -pointer.ty);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables.filter((m) => m.userData.root.visible), false)[0];
    setHover(hit ? hit.object.userData.root : null, e.clientX, e.clientY);
  }
  function setHover(obj, cx, cy) {
    if (hovered && hovered !== obj) highlight(hovered, false);
    hovered = obj;
    if (!obj) { tip.classList.remove("is-on"); hero.style.cursor = ""; return; }
    highlight(obj, true);
    hero.style.cursor = drag.on ? "" : "crosshair";
    const i = obj.userData.info;
    tip.innerHTML = `<b>${i.name}</b><dl><dt>Class</dt><dd>${i.cls}</dd>${i.npd ? `<dt>NPD</dt><dd>${i.npd}</dd>` : ""}<dt>${i.npd ? "Spec" : "Size"}</dt><dd>${i.spec}</dd><dt>Discipline</dt><dd>${i.disc}</dd></dl>`;
    const x = Math.min(cx + 18, window.innerWidth - 230);
    tip.style.left = x + "px";
    tip.style.top = cy + 18 + "px";
    tip.classList.add("is-on");
  }
  function highlight(obj, on) {
    obj.traverse((m) => {
      if (!m.isMesh) return;
      if (on) {
        if (!m.userData.baseMat) m.userData.baseMat = m.material;
        m.material = m.userData.baseMat.clone();
        m.material.emissive = new THREE.Color(0x4fe3c1);
        m.material.emissiveIntensity = 0.55;
      } else if (m.userData.baseMat) {
        m.material.dispose();
        m.material = m.userData.baseMat;
      }
    });
  }
  hero.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerleave", () => setHover(null), { passive: true });

  // ---------- controls: discipline filters + re-model ----------
  let running = true, built = false;
  const groupsOn = { piping: true, structure: true, equipment: true, supports: true };
  function setGroup(g, on) {
    groupsOn[g] = on;
    for (const o of builds) if (o.userData.group === g) o.visible = on;
    particles.visible = groupsOn.piping;
    if (hovered && !hovered.visible) setHover(null);
  }
  function remodel() {
    built = false; t0 = null;
    for (const o of builds) o.scale.setScalar(0.0001);
    pMat.opacity = 0;
  }
  document.querySelectorAll("[data-disc]").forEach((b) => {
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      setGroup(b.dataset.disc, on);
    });
  });
  const rb = document.getElementById("remodel");
  if (rb) rb.addEventListener("click", remodel);

  // ---------- loop ----------
  const clock = new THREE.Clock();
  let t0 = null;
  const easeOut = (x) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (t0 === null) t0 = t;
    const bt = (t - t0) * (reduce ? 50 : 1);

    // auto-model build-in
    if (!built) {
      let done = true;
      for (const o of builds) {
        const k = easeOut((bt - o.userData.delay) / 0.7);
        if (k < 1) done = false;
        o.scale.setScalar(Math.max(k, 0.0001));
      }
      if (done) built = true;
    }
    pMat.opacity = Math.min(1, Math.max(0, (bt - 2.8) / 1.2));

    // flow
    for (let i = 0; i < N; i++) {
      const u = ((i / N) + t * 0.06) % 1;
      curve.getPointAt(u, tmp);
      pPos[i * 3] = tmp.x; pPos[i * 3 + 1] = tmp.y; pPos[i * 3 + 2] = tmp.z;
    }
    pGeo.attributes.position.needsUpdate = true;

    // camera orbit + parallax
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    if (!drag.on && Math.abs(drag.vaz) > 0.0001) { drag.az += drag.vaz; drag.vaz *= 0.94; }
    const az = (reduce ? 0.62 : 0.62 + Math.sin(t * 0.08) * 0.22) + pointer.x * 0.12 + drag.az;
    const el = 0.4 - pointer.y * 0.05 + drag.el;
    const dist = small ? 66 : 54;
    camera.position.set(
      target.x + dist * Math.cos(el) * Math.sin(az),
      target.y + dist * Math.sin(el),
      target.z + dist * Math.cos(el) * Math.cos(az)
    );
    camera.lookAt(target);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([en]) => {
    const vis = en.isIntersecting && !document.hidden;
    if (vis && !running) { running = true; clock.getDelta(); requestAnimationFrame(frame); }
    if (!vis) running = false;
  }, { threshold: 0.02 });
  io.observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else if (!running && hero.getBoundingClientRect().bottom > 0) { running = true; clock.getDelta(); requestAnimationFrame(frame); }
  });

  requestAnimationFrame(frame);
  requestAnimationFrame(() => canvas.classList.add("is-ready"));
}
