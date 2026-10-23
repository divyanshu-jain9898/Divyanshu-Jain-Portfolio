/* Showcase — persistent particle stage.
   One point cloud morphs (on the GPU) between procedural shapes as chapters change. */
import * as THREE from "../vendor/three.module.min.js";

const canvas = document.getElementById("stage");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 820px)").matches || (navigator.hardwareConcurrency || 8) <= 4;
const N = small ? 9000 : 18000;
const TAU = Math.PI * 2;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  console.warn("WebGL unavailable — running without the particle stage.", e);
  document.documentElement.classList.add("no-webgl");
}

if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const group = new THREE.Group();
  scene.add(group);

  /* ---------- deterministic random ---------- */
  let seed = 1;
  const setSeed = (s) => { seed = s; };
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const pick = (weights) => { let r = rnd(), acc = 0; for (let k = 0; k < weights.length; k++) { acc += weights[k]; if (r <= acc) return k; } return weights.length - 1; };
  const jit = (a) => (rnd() - 0.5) * a;

  /* ---------- shape generators: each returns Float32Array(N * 3) ---------- */
  const GEN = {
    plant() {
      setSeed(11); const a = new Float32Array(N * 3);
      const pipes = [[0.55, -0.62, 0.13], [0.55, -0.2, 0.1], [0.55, 0.22, 0.16], [0.55, 0.62, 0.09], [1.25, -0.35, 0.12], [1.25, 0.35, 0.1]];
      const bays = [-3.6, -1.2, 1.2, 3.6];
      for (let i = 0; i < N; i++) {
        let x, y, z; const part = pick([0.4, 0.13, 0.1, 0.16, 0.09, 0.12]);
        if (part === 0) { const p = pipes[Math.floor(rnd() * pipes.length)]; const th = rnd() * TAU; x = -4.2 + rnd() * 8.4; y = p[0] + Math.cos(th) * p[2]; z = p[1] + Math.sin(th) * p[2]; }
        else if (part === 1) { x = bays[Math.floor(rnd() * 4)] + jit(0.12); z = (rnd() < 0.5 ? -0.9 : 0.9) + jit(0.12); y = -1.7 + rnd() * 3.1; }
        else if (part === 2) {
          const lv = rnd() < 0.5 ? 0.38 : 1.05;
          if (rnd() < 0.5) { x = bays[Math.floor(rnd() * 4)] + jit(0.1); z = -0.9 + rnd() * 1.8; } else { x = -3.6 + rnd() * 7.2; z = rnd() < 0.5 ? -0.9 : 0.9; }
          y = lv + jit(0.08);
        } else if (part === 3) {
          const th = rnd() * TAU;
          if (rnd() < 0.8) { x = 4.75 + Math.cos(th) * 0.78; z = Math.sin(th) * 0.78; y = -1.7 + rnd() * 2.7; }
          else { const ph = rnd() * Math.PI / 2; x = 4.75 + Math.cos(th) * Math.cos(ph) * 0.78; z = Math.sin(th) * Math.cos(ph) * 0.78; y = 1.0 + Math.sin(ph) * 0.6; }
        } else if (part === 4) {
          const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u);
          x = -4.75 + s * Math.cos(th) * 0.9; y = -0.55 + u * 0.9; z = 0.3 + s * Math.sin(th) * 0.9;
        } else { x = Math.round((-5.6 + rnd() * 11.2) / 0.4) * 0.4 + jit(0.05); z = Math.round((-2.4 + rnd() * 4.8) / 0.4) * 0.4 + jit(0.05); y = -1.72; }
        a[i * 3] = x; a[i * 3 + 1] = y + 0.1; a[i * 3 + 2] = z;
      }
      return a;
    },

    helix() {
      setSeed(23); const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const part = pick([0.62, 0.18, 0.2]); let x, y, z;
        if (part === 0) { const t = rnd(); const ang = t * TAU * 2.6 + (rnd() < 0.5 ? 0 : Math.PI); y = -2.7 + t * 5.4; const r = 1.15 + jit(0.12); x = Math.cos(ang) * r; z = Math.sin(ang) * r; }
        else if (part === 1) { const k = Math.floor(rnd() * 26); const t = (k + 0.5) / 26; const ang = t * TAU * 2.6; const s = rnd() * 2 - 1; y = -2.7 + t * 5.4 + jit(0.03); x = Math.cos(ang) * 1.15 * s; z = Math.sin(ang) * 1.15 * s; }
        else { const r = 2 + rnd() * 1.8, th = rnd() * TAU; x = Math.cos(th) * r; z = Math.sin(th) * r; y = gauss() * 1.2; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    orbits() {
      setSeed(31); const a = new Float32Array(N * 3);
      const rings = [[1.25, 0.32, 0.1], [1.75, -0.55, 0.42], [2.25, 0.95, -0.3], [2.75, -0.22, 0.75], [3.2, 0.62, -0.62]];
      for (let i = 0; i < N; i++) {
        const part = pick([0.12, 0.76, 0.12]); let x, y, z;
        if (part === 0) { const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), r = 0.55 * Math.cbrt(rnd()); x = s * Math.cos(th) * r; y = u * r; z = s * Math.sin(th) * r; }
        else {
          const k = Math.floor(rnd() * rings.length); const [R, tx, tz] = rings[k];
          let th, rr;
          if (part === 1) { th = rnd() * TAU; rr = R + jit(0.05); x = Math.cos(th) * rr; y = jit(0.05); z = Math.sin(th) * rr; }
          else { th = k * 1.3; const u = rnd() * 2 - 1, ph = rnd() * TAU, s = Math.sqrt(1 - u * u), r = 0.16; x = Math.cos(th) * R + s * Math.cos(ph) * r; y = u * r; z = Math.sin(th) * R + s * Math.sin(ph) * r; }
          const y1 = y * Math.cos(tx) - z * Math.sin(tx), z1 = y * Math.sin(tx) + z * Math.cos(tx); y = y1; z = z1;
          const x2 = x * Math.cos(tz) - y * Math.sin(tz), y2 = x * Math.sin(tz) + y * Math.cos(tz); x = x2; y = y2;
        }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    wave() {
      setSeed(41); const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        let x, y, z;
        if (rnd() < 0.9) { x = Math.round((-5.4 + rnd() * 10.8) / 0.16) * 0.16; z = Math.round((-3 + rnd() * 6) / 0.16) * 0.16; y = 0.38 * Math.sin(x * 1.05 + z * 0.55) + 0.24 * Math.cos(z * 1.6 - x * 0.4) - 0.6; }
        else { const k = Math.floor(rnd() * 3); x = -3.2 + k * 3.2 + jit(0.06); z = jit(0.06); y = -0.6 + rnd() * 2.4; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    neural() {
      setSeed(53); const a = new Float32Array(N * 3); const R = 2.3; const M = Math.floor(N * 0.68);
      for (let i = 0; i < N; i++) {
        let x, y, z;
        if (i < M) {
          const ph = Math.acos(1 - 2 * (i + 0.5) / M), th = Math.PI * (1 + Math.sqrt(5)) * i;
          const r = R * (1 + 0.07 * Math.sin(5 * th) * Math.sin(4 * ph)) + jit(0.04);
          x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph); z = r * Math.sin(ph) * Math.sin(th);
        } else if (rnd() < 0.82) {
          const pa = randSphere(R), pb = randSphere(R), t = rnd(), bulge = Math.sin(Math.PI * t) * 0.55;
          x = pa[0] + (pb[0] - pa[0]) * t; y = pa[1] + (pb[1] - pa[1]) * t; z = pa[2] + (pb[2] - pa[2]) * t;
          const l = Math.hypot(x, y, z) || 1; const k = 1 - bulge * 0.6; x *= k; y *= k; z *= k; if (l < 0.01) x += 0.01;
        } else { const p = randSphere(0.45 * Math.cbrt(rnd())); x = p[0]; y = p[1]; z = p[2]; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
      function randSphere(r) { const u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u); return [s * Math.cos(th) * r, u * r, s * Math.sin(th) * r]; }
    },

    signal() {
      setSeed(61); const a = new Float32Array(N * 3); const cx = -2.6;
      for (let i = 0; i < N; i++) {
        let x, y, z; const part = pick([0.78, 0.12, 0.1]);
        if (part === 0) { const k = Math.floor(rnd() * 9); const R = 0.9 + k * 0.62; const ang = (rnd() - 0.5) * 1.9; x = cx + Math.cos(ang) * R; y = Math.sin(ang) * R; z = jit(0.08) + Math.sin(k + ang * 2) * 0.15; }
        else if (part === 1) { const w = 0.95, h = 1.75; const t = rnd() * 4; let px, py; if (t < 1) { px = -w / 2 + t * w; py = -h / 2; } else if (t < 2) { px = w / 2; py = -h / 2 + (t - 1) * h; } else if (t < 3) { px = w / 2 - (t - 2) * w; py = h / 2; } else { px = -w / 2; py = h / 2 - (t - 3) * h; } x = cx - 0.2 + px; y = py; z = jit(0.05); }
        else { x = 1.4 + rnd() * 3.2; y = jit(1.4); z = jit(1.4); const q = Math.floor(rnd() * 3); x = 3.4 + q * 0.25 + jit(0.05); y = -0.9 + (rnd()) * 1.8; z = (q - 1) * 0.5 + jit(0.05); }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    globe() {
      setSeed(71); const a = new Float32Array(N * 3); const R = 2.4;
      for (let i = 0; i < N; i++) {
        let lat, lon, r = R; const part = pick([0.42, 0.33, 0.18, 0.07]);
        if (part === 0) { lat = (Math.floor(rnd() * 9) - 4) * (Math.PI / 10); lon = rnd() * TAU; }
        else if (part === 1) { lon = Math.floor(rnd() * 12) * (TAU / 12); lat = (rnd() - 0.5) * Math.PI; }
        else if (part === 2) { lat = Math.asin(rnd() * 2 - 1); lon = rnd() * TAU; }
        else { lat = 0; lon = rnd() * TAU; r = 3.3 + jit(0.04); }
        let x = r * Math.cos(lat) * Math.cos(lon), y = r * Math.sin(lat), z = r * Math.cos(lat) * Math.sin(lon);
        if (part === 3) { const t = 0.45; const y1 = y * Math.cos(t) - z * Math.sin(t); z = y * Math.sin(t) + z * Math.cos(t); y = y1; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    building() {
      setSeed(83); const a = new Float32Array(N * 3); const W = 4.6, D = 2.4, H = 3.4, floors = 5;
      for (let i = 0; i < N; i++) {
        let x, y, z; const part = pick([0.38, 0.2, 0.3, 0.12]);
        if (part === 0) { const f = Math.floor(rnd() * (floors + 1)); y = -1.7 + f * (H / floors); x = -W / 2 + rnd() * W; z = -D / 2 + rnd() * D; if (rnd() < 0.6) { if (rnd() < 0.5) z = rnd() < 0.5 ? -D / 2 : D / 2; else x = rnd() < 0.5 ? -W / 2 : W / 2; } }
        else if (part === 1) { const cx = Math.floor(rnd() * 6), cz = Math.floor(rnd() * 3); x = -W / 2 + cx * (W / 5) + jit(0.05); z = -D / 2 + cz * (D / 2) + jit(0.05); y = -1.7 + rnd() * H; }
        else if (part === 2) { const f = Math.floor(rnd() * floors), c = Math.floor(rnd() * 10); const wx = -W / 2 + (c + 0.5) * (W / 10), wy = -1.7 + (f + 0.5) * (H / floors); const t = rnd() * 4, ww = 0.26, wh = 0.36; let px, py; if (t < 1) { px = -ww / 2 + t * ww; py = -wh / 2; } else if (t < 2) { px = ww / 2; py = -wh / 2 + (t - 1) * wh; } else if (t < 3) { px = ww / 2 - (t - 2) * ww; py = wh / 2; } else { px = -ww / 2; py = wh / 2 - (t - 3) * wh; } x = wx + px; y = wy + py; z = D / 2 + 0.02; }
        else { const t = rnd(); x = -W / 2 + t * W; z = rnd() < 0.5 ? -D / 2 : D / 2; y = 1.7 + (rnd() < 0.3 ? 0.35 : 0); if (rnd() < 0.3) { x = -1 + rnd() * 1.3; z = -0.5 + rnd() * 0.9; y = 1.7 + rnd() * 0.55; } }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    lattice() {
      setSeed(97); const a = new Float32Array(N * 3); const n = 6, s = 3.6, step = s / n;
      for (let i = 0; i < N; i++) {
        const nx = Math.floor(rnd() * (n + 1)), ny = Math.floor(rnd() * (n + 1)), nz = Math.floor(rnd() * (n + 1));
        let x = -s / 2 + nx * step, y = -s / 2 + ny * step, z = -s / 2 + nz * step;
        if (rnd() < 0.72) { const ax = Math.floor(rnd() * 3), t = rnd() * step; if (ax === 0 && nx < n) x += t; else if (ax === 1 && ny < n) y += t; else if (nz < n) z += t; }
        else { x += jit(0.06); y += jit(0.06); z += jit(0.06); }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    datacolumns() {
      setSeed(101); const a = new Float32Array(N * 3); const cols = 7, rows = 4;
      for (let i = 0; i < N; i++) {
        let x, y, z;
        if (rnd() < 0.86) {
          const c = Math.floor(rnd() * cols), r = Math.floor(rnd() * rows);
          const cx = -3.6 + c * 1.2, cz = -1.5 + r * 1.0, h = 0.5 + 2.7 * Math.abs(Math.sin(c * 1.7 + r * 0.9 + 0.4)), w = 0.36;
          const face = Math.floor(rnd() * 5);
          if (face < 4) { const t = rnd() * w - w / 2; x = cx + (face === 0 ? -w / 2 : face === 1 ? w / 2 : t); z = cz + (face === 2 ? -w / 2 : face === 3 ? w / 2 : t); y = -1.6 + rnd() * h; if (face < 2) z = cz + t; }
          else { x = cx + jit(w); z = cz + jit(w); y = -1.6 + h; }
        } else { x = -4.4 + rnd() * 8.8; z = -2.2 + rnd() * 4.4; y = -1.62; x = Math.round(x / 0.3) * 0.3; z = Math.round(z / 0.3) * 0.3; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    flange() {
      setSeed(113); const a = new Float32Array(N * 3); const ri = 1.05, ro = 2.35, bolts = 12, bc = 1.75;
      for (let i = 0; i < N; i++) {
        let x, y, z; const part = pick([0.46, 0.14, 0.2, 0.2]);
        if (part === 0) { const r = Math.sqrt(ri * ri + rnd() * (ro * ro - ri * ri)), th = rnd() * TAU; x = Math.cos(th) * r; y = Math.sin(th) * r; z = rnd() < 0.5 ? -0.26 : 0.26; }
        else if (part === 1) { const th = rnd() * TAU, r = rnd() < 0.5 ? ri : ro; x = Math.cos(th) * r; y = Math.sin(th) * r; z = jit(0.52); }
        else if (part === 2) { const b = Math.floor(rnd() * bolts), th0 = (b + 0.5) * TAU / bolts, ph = rnd() * TAU, rb = 0.12; x = Math.cos(th0) * bc + Math.cos(ph) * rb; y = Math.sin(th0) * bc + Math.sin(ph) * rb; z = -0.75 + rnd() * 1.5; }
        else { const th = rnd() * TAU; x = Math.cos(th) * ri; y = Math.sin(th) * ri; z = -0.26 - rnd() * 2.6; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    screen() {
      setSeed(127); const a = new Float32Array(N * 3); const R = 6.5;
      for (let i = 0; i < N; i++) {
        let x, y, z; const part = pick([0.62, 0.1, 0.28]);
        if (part === 0) { const ang = (rnd() - 0.5) * 1.1; x = Math.sin(ang) * R; z = -Math.cos(ang) * R + R - 1.4; y = -1.1 + rnd() * 3.1; }
        else if (part === 1) { const ang = (rnd() - 0.5) * 1.1; x = Math.sin(ang) * R; z = -Math.cos(ang) * R + R - 1.4; y = rnd() < 0.5 ? -1.15 : 2.05; if (rnd() < 0.3) { const s = rnd() < 0.5 ? -0.55 : 0.55; x = Math.sin(s) * R; z = -Math.cos(s) * R + R - 1.4; y = -1.15 + rnd() * 3.2; } }
        else { const row = Math.floor(rnd() * 6), ang = (rnd() - 0.5) * 1.3; const r = 2.4 + row * 0.55; x = Math.sin(ang) * r * 1.4; z = 1.2 + row * 0.5 - Math.cos(ang) * 0.4; y = -2.0 - row * 0.12; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    galaxy() {
      setSeed(131); const a = new Float32Array(N * 3); const arms = 3;
      for (let i = 0; i < N; i++) {
        let x, y, z;
        if (rnd() < 0.86) { const r = 0.25 + Math.pow(rnd(), 0.75) * 4.3, arm = Math.floor(rnd() * arms); const ang = arm * TAU / arms + r * 1.05 + gauss() * 0.22 / (0.4 + r * 0.25); x = Math.cos(ang) * r + gauss() * 0.08; z = Math.sin(ang) * r + gauss() * 0.08; y = gauss() * 0.14 * (1.4 - r / 4.6); }
        else { const g = [gauss() * 0.45, gauss() * 0.28, gauss() * 0.45]; x = g[0]; y = g[1]; z = g[2]; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
      }
      return a;
    },

    chip() {
      setSeed(139); const a = new Float32Array(N * 3); const S = 1.25, pins = 9;
      for (let i = 0; i < N; i++) {
        let x, y, z = 0; const part = pick([0.26, 0.1, 0.16, 0.4, 0.08]);
        if (part === 0) { x = Math.round(jit(2 * S) / 0.08) * 0.08; y = Math.round(jit(2 * S) / 0.08) * 0.08; z = 0.12; }
        else if (part === 1) { const t = rnd() * 4, L = 2 * S; let px, py; if (t < 1) { px = -S + t * L; py = -S; } else if (t < 2) { px = S; py = -S + (t - 1) * L; } else if (t < 3) { px = S - (t - 2) * L; py = S; } else { px = -S; py = S - (t - 3) * L; } x = px; y = py; z = 0.12 + jit(0.06); }
        else if (part === 2 || part === 3) {
          const side = Math.floor(rnd() * 4), k = Math.floor(rnd() * pins), off = -S + (k + 0.5) * (2 * S / pins);
          let len = part === 2 ? 0.35 : 0.35 + 0.6 + (k % 3) * 0.45; const t = part === 2 ? rnd() * 0.35 : rnd() * len;
          let px = S + t, py = off;
          if (part === 3 && t > 0.6) { const bend = t - 0.6; px = S + 0.6 + bend * 0.7; py = off + Math.sign(off || 1) * bend * 0.7; }
          [x, y] = side === 0 ? [px, py] : side === 1 ? [-px, -py] : side === 2 ? [py, px] : [-py, -px];
          x += jit(0.03); y += jit(0.03);
        } else { const side = Math.floor(rnd() * 4), k = Math.floor(rnd() * pins), off = -S + (k + 0.5) * (2 * S / pins); const len = 0.35 + 0.6 + (k % 3) * 0.45; const bend = len - 0.6; let px = S + 0.6 + bend * 0.7, py = off + Math.sign(off || 1) * bend * 0.7; const ph = rnd() * TAU; px += Math.cos(ph) * 0.08; py += Math.sin(ph) * 0.08; [x, y] = side === 0 ? [px, py] : side === 1 ? [-px, -py] : side === 2 ? [py, px] : [-py, -px]; }
        a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z + jit(0.04);
      }
      return a;
    },

    knot() {
      setSeed(149); const a = new Float32Array(N * 3); const geo = new THREE.TorusKnotGeometry(1.55, 0.42, 420, 36, 2, 3); const pos = geo.attributes.position.array; const cnt = pos.length / 3;
      for (let i = 0; i < N; i++) { const k = Math.floor(rnd() * cnt); a[i * 3] = pos[k * 3] + jit(0.05); a[i * 3 + 1] = pos[k * 3 + 1] + jit(0.05); a[i * 3 + 2] = pos[k * 3 + 2] + jit(0.05); }
      geo.dispose();
      return a;
    },

    skeleton() { return skeletonPose(POSE_A); },
    skeleton2() { return skeletonPose(POSE_B); },

    scatter() {
      setSeed(7); const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { a[i * 3] = jit(16); a[i * 3 + 1] = jit(10); a[i * 3 + 2] = jit(10) - 2; }
      return a;
    },
  };
  /* ---------- pose-tracking skeleton (two poses for the dancing loop) ---------- */
  const POSE_A = {
    head: [0, 1.78, 0], neck: [0, 1.38, 0], pelvis: [0, 0.12, 0],
    lSh: [-0.5, 1.26, 0], rSh: [0.5, 1.26, 0], lEl: [-0.68, 0.66, 0.06], rEl: [0.98, 1.62, 0.04],
    lWr: [-0.74, 0.08, 0.12], rWr: [0.8, 2.22, 0.06], lHip: [-0.28, 0.06, 0], rHip: [0.28, 0.06, 0],
    lKn: [-0.33, -0.94, 0.06], rKn: [0.34, -0.94, 0.04], lAn: [-0.36, -1.96, 0], rAn: [0.38, -1.96, 0],
    lToe: [-0.4, -2.06, 0.3], rToe: [0.44, -2.06, 0.3],
  };
  const POSE_B = {
    head: [0.06, 1.92, 0], neck: [0.05, 1.52, 0], pelvis: [0.02, 0.28, 0],
    lSh: [-0.44, 1.4, 0], rSh: [0.55, 1.42, 0], lEl: [-0.98, 1.72, 0.04], rEl: [1.08, 1.75, 0.04],
    lWr: [-1.22, 2.3, 0.08], rWr: [1.3, 2.32, 0.08], lHip: [-0.25, 0.22, 0], rHip: [0.3, 0.22, 0],
    lKn: [-0.42, -0.78, 0.08], rKn: [0.62, -0.32, 0.42], lAn: [-0.44, -1.86, 0], rAn: [0.5, -1.28, 0.1],
    lToe: [-0.48, -1.96, 0.3], rToe: [0.56, -1.36, 0.4],
  };
  const BONES = [["head", "neck"], ["neck", "pelvis"], ["neck", "lSh"], ["neck", "rSh"], ["lSh", "lEl"], ["lEl", "lWr"], ["rSh", "rEl"], ["rEl", "rWr"],
    ["pelvis", "lHip"], ["pelvis", "rHip"], ["lHip", "lKn"], ["lKn", "lAn"], ["lAn", "lToe"], ["rHip", "rKn"], ["rKn", "rAn"], ["rAn", "rToe"],
    ["lSh", "lHip"], ["rSh", "rHip"]];
  const JOINTS = ["neck", "pelvis", "lSh", "rSh", "lEl", "rEl", "lWr", "rWr", "lHip", "rHip", "lKn", "rKn", "lAn", "rAn", "lToe", "rToe"];
  /* bone weights come from the first pose only, so both poses draw identical random sequences */
  const BONE_W = (() => {
    const l = BONES.map(([u, v]) => Math.hypot(POSE_A[u][0] - POSE_A[v][0], POSE_A[u][1] - POSE_A[v][1], POSE_A[u][2] - POSE_A[v][2]));
    const t = l.reduce((x, y) => x + y, 0);
    return l.map((x) => x / t);
  })();
  function skeletonPose(P) {
    setSeed(157); const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      let x, y, z; const part = pick([0.6, 0.18, 0.12, 0.1]);
      if (part === 0) {
        const [u, v] = BONES[pick(BONE_W)], t = rnd(), A = P[u], B = P[v];
        x = A[0] + (B[0] - A[0]) * t + jit(0.07); y = A[1] + (B[1] - A[1]) * t + jit(0.07); z = A[2] + (B[2] - A[2]) * t + jit(0.07);
      } else if (part === 1) {
        const J = P[JOINTS[Math.floor(rnd() * JOINTS.length)]], u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), r = 0.08 + rnd() * 0.04;
        x = J[0] + s * Math.cos(th) * r; y = J[1] + u * r; z = J[2] + s * Math.sin(th) * r;
      } else if (part === 2) {
        const H = P.head, u = rnd() * 2 - 1, th = rnd() * TAU, s = Math.sqrt(1 - u * u), r = 0.3 + jit(0.03);
        x = H[0] + s * Math.cos(th) * r; y = H[1] + u * r; z = H[2] + s * Math.sin(th) * r;
      } else {
        const th = rnd() * TAU, r = rnd() < 0.55 ? 1.25 + jit(0.05) : 0.7 + jit(0.05);
        x = Math.cos(th) * r; z = Math.sin(th) * r * 0.55; y = -2.12 + jit(0.02);
      }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }

  const cache = {};
  const shape = (name) => cache[name] || (cache[name] = (GEN[name] || GEN.scatter)());

  /* ---------- geometry + material ---------- */
  const geo = new THREE.BufferGeometry();
  const start = shape("scatter");
  const posA = new Float32Array(start), posB = new Float32Array(start);
  const rand = new Float32Array(N * 4);
  setSeed(999);
  for (let i = 0; i < N; i++) { rand[i * 4] = rnd(); rand[i * 4 + 1] = rnd(); rand[i * 4 + 2] = rnd(); rand[i * 4 + 3] = rnd(); }
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("aPosA", new THREE.BufferAttribute(posA, 3));
  geo.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);

  const uniforms = {
    uProgress: { value: 1 }, uTime: { value: 0 }, uTurb: { value: reduce ? 0 : 1 }, uDir: { value: 1 },
    uSize: { value: small ? 3.4 : 3.1 }, uPixelRatio: { value: renderer.getPixelRatio() }, uPulse: { value: 0 },
    uMouse: { value: new THREE.Vector2(9, 9) }, uAspect: { value: 1 }, uOpacity: { value: 0.0 },
    uColorA: { value: new THREE.Color("#5be3ff") }, uColorB: { value: new THREE.Color("#ff8f4d") },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uProgress, uTime, uTurb, uDir, uSize, uPixelRatio, uPulse, uAspect;
      uniform vec2 uMouse;
      attribute vec3 aPosA; attribute vec3 aPosB; attribute vec4 aRand;
      varying float vMix; varying float vAlpha; varying float vGlow;
      float ease(float t){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }
      void main(){
        float lp = clamp((uProgress - aRand.x * 0.35) / 0.65, 0.0, 1.0);
        vec3 p = mix(aPosA, aPosB, ease(lp));
        float mid = sin(3.14159265 * lp);
        vec3 n = vec3(sin(aRand.w * 6.283 + uTime * 0.7 + p.y * 1.3), cos(aRand.w * 5.1 + uTime * 0.6 + p.x * 1.1), sin(aRand.w * 4.3 + uTime * 0.5 + p.z * 1.7));
        p += n * mid * uTurb * (0.55 + aRand.y * 0.9);
        float ang = mid * 0.85 * uDir;
        p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;
        p += 0.03 * vec3(sin(uTime * 0.8 + aRand.w * 10.0), cos(uTime * 0.7 + aRand.w * 9.0), sin(uTime * 0.9 + aRand.w * 8.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec4 clip = projectionMatrix * mv;
        vec2 d = clip.xy / clip.w - uMouse; d.x *= uAspect;
        float dist = length(d);
        float infl = smoothstep(0.3, 0.0, dist);
        mv.xy += normalize(d + 1e-5) * infl * 0.6 * (0.6 + aRand.y);
        vGlow = infl;
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.45 + aRand.y * 0.9) * (1.0 + uPulse * 0.9 * step(0.55, aRand.z));
        gl_PointSize = size * uPixelRatio * (9.0 / -mv.z);
        vMix = aRand.z;
        vAlpha = clamp(1.0 - (-mv.z - 8.0) / 14.0, 0.3, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA; uniform vec3 uColorB; uniform float uOpacity; uniform float uPulse;
      varying float vMix; varying float vAlpha; varying float vGlow;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float r = length(c);
        if (r > 0.5) discard;
        float soft = smoothstep(0.5, 0.05, r);
        float core = smoothstep(0.22, 0.0, r);
        vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 0.95, vMix));
        col = mix(col, vec3(1.0), core * 0.35);
        col += vGlow * 0.55 + uPulse * 0.25;
        gl_FragColor = vec4(col, (soft * 0.75 + core * 0.25) * uOpacity * vAlpha);
      }`,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  group.add(points);

  /* ---------- morphing ---------- */
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let current = "scatter";
  let morphTween = null;
  function bakeCurrent() {
    const p = uniforms.uProgress.value;
    if (p >= 1) { posA.set(posB); return; }
    for (let i = 0; i < N; i++) {
      const lp = Math.min(1, Math.max(0, (p - rand[i * 4] * 0.35) / 0.65)), e = ease(lp);
      posA[i * 3] += (posB[i * 3] - posA[i * 3]) * e;
      posA[i * 3 + 1] += (posB[i * 3 + 1] - posA[i * 3 + 1]) * e;
      posA[i * 3 + 2] += (posB[i * 3 + 2] - posA[i * 3 + 2]) * e;
    }
  }
  function morph(name, opts = {}) {
    if (name === current && uniforms.uProgress.value >= 1) return;
    current = name;
    bakeCurrent();
    posB.set(shape(name));
    geo.attributes.aPosA.needsUpdate = true;
    geo.attributes.aPosB.needsUpdate = true;
    uniforms.uDir.value = opts.dir ?? 1;
    uniforms.uTurb.value = reduce ? 0 : (opts.turb ?? 1);
    uniforms.uProgress.value = 0;
    const dur = reduce ? 0.6 : (opts.duration || 2.1);
    if (morphTween) morphTween.kill();
    morphTween = window.gsap ? window.gsap.to(uniforms.uProgress, { value: 1, duration: dur, ease: "none" }) : (uniforms.uProgress.value = 1, null);
  }

  /* ---------- palette + layout ---------- */
  function setPalette(a, b) {
    const ca = new THREE.Color(a), cb = new THREE.Color(b);
    if (!window.gsap) { uniforms.uColorA.value.copy(ca); uniforms.uColorB.value.copy(cb); return; }
    window.gsap.to(uniforms.uColorA.value, { r: ca.r, g: ca.g, b: ca.b, duration: 1.4, ease: "power2.inOut" });
    window.gsap.to(uniforms.uColorB.value, { r: cb.r, g: cb.g, b: cb.b, duration: 1.4, ease: "power2.inOut" });
  }
  let layout = { x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1, spin: 0.05, op: 0.85 };
  const L = { x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1 };
  /* idle spin: spinRun grows with time at the chapter's speed; on every layout change the
     angle reached so far is wrapped and eased back to 0 so each shape arrives facing front */
  const SP = { off: 0 };
  let spinRun = 0;
  function setLayout(cfg = {}) {
    const portrait = innerWidth / innerHeight < 1;
    layout = { ...layout, ...cfg };
    let tx = cfg.x || 0, tz = cfg.z || 0, op = cfg.op ?? 0.85;
    if (portrait) { tx *= 0.18; tz -= 3.2; op *= 0.55; }
    else if (innerWidth < 1100) { tx *= 0.75; tz -= 1; }
    const to = { x: tx, y: cfg.y || 0, z: tz, rx: cfg.rx || 0, ry: cfg.ry || 0, s: cfg.s || 1 };
    let a = SP.off + spinRun;
    a = ((a % TAU) + TAU * 1.5) % TAU - Math.PI;
    SP.off = a; spinRun = 0;
    if (window.gsap) {
      window.gsap.to(SP, { off: 0, duration: reduce ? 0.4 : 2.2, ease: "expo.inOut", overwrite: true });
      window.gsap.to(L, { ...to, duration: reduce ? 0.4 : 2.2, ease: "expo.inOut" });
      window.gsap.to(uniforms.uOpacity, { value: op, duration: 1.2, ease: "power2.out" });
    } else { Object.assign(L, to); uniforms.uOpacity.value = op; SP.off = 0; }
  }
  function pulse() {
    if (!window.gsap || reduce) return;
    window.gsap.fromTo(uniforms.uPulse, { value: 1 }, { value: 0, duration: 1.1, ease: "power3.out" });
  }
  let loopTimer = null;
  function loop(names, ms = 3800, opts = {}) {
    stopLoop(); let k = 0;
    loopTimer = setInterval(() => { k = (k + 1) % names.length; morph(names[k], { dir: 1, duration: 2.4, ...opts }); }, ms);
  }
  function stopLoop() { if (loopTimer) clearInterval(loopTimer); loopTimer = null; }

  /* ---------- pointer ---------- */
  const mouse = new THREE.Vector2(9, 9), mouseT = new THREE.Vector2(9, 9);
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => {
    mouseT.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    par.tx = mouseT.x; par.ty = mouseT.y;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { mouseT.set(9, 9); par.tx = 0; par.ty = 0; });
  addEventListener("blur", () => mouseT.set(9, 9));

  /* ---------- resize + loop ---------- */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    uniforms.uAspect.value = w / h;
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  const clock = new THREE.Clock();
  let looping = false, hiddenTab = document.hidden, paused = false;
  function startLoop() {
    if (looping || hiddenTab || paused) return;
    looping = true; clock.getDelta(); requestAnimationFrame(frame);
  }
  function frame() {
    if (hiddenTab || paused) { looping = false; return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;
    mouse.lerp(mouseT, mouseT.x > 5 ? 1 : 0.12);
    uniforms.uMouse.value.copy(mouse);
    par.x += (par.tx - par.x) * 0.04; par.y += (par.ty - par.y) * 0.04;
    spinRun += dt * (reduce ? 0 : layout.spin ?? 0.05);
    group.position.set(L.x, L.y, L.z);
    group.rotation.set(L.rx + par.y * 0.12, L.ry + SP.off + spinRun + par.x * 0.22, 0);
    group.scale.setScalar(L.s);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { hiddenTab = document.hidden; startLoop(); });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); paused = true; });
  canvas.addEventListener("webglcontextrestored", () => { paused = false; startLoop(); });
  function setPaused(v) { paused = !!v; startLoop(); }
  startLoop();

  /* ---------- public API ---------- */
  window.Stage = { morph, setPalette, setLayout, pulse, loop, stopLoop, setPaused, shapes: Object.keys(GEN) };
  // pre-build the heavier shapes when the browser is idle
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 400));
  idle(() => ["plant", "helix", "orbits", "wave", "neural"].forEach(shape));
  idle(() => ["signal", "globe", "building", "lattice", "datacolumns", "flange", "screen", "galaxy", "skeleton", "skeleton2", "chip", "knot"].forEach(shape));
  document.dispatchEvent(new CustomEvent("stage:ready"));
}
