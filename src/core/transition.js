/* Page transition: stars stretch into light-speed streaks, then settle back into points as
   the next page appears. Drawn on a 2D canvas; time-based, so it always finishes on time.
   Reduced motion gets a plain fade. */

import { REDUCED } from './env.js';

let canvas, g, stars = [], dpr = 1;
const NAVY = [7, 13, 36];

function build() {
  canvas = document.createElement('canvas');
  canvas.className = 'warp';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  g = canvas.getContext('2d');
  stars = Array.from({ length: 420 }, () => ({
    a: Math.random() * Math.PI * 2,
    r: Math.pow(Math.random(), 0.6) * 0.9 + 0.02, // distance from centre, 0..~1
    s: 0.6 + Math.random() * 1.6,
    y: Math.random() < 0.12, // a few yellow stars
  }));
}

function size() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
}

// k: 0 = still points, 1 = full streaks; bg: background opacity
function draw(k, bg) {
  const w = innerWidth, h = innerHeight, cx = w / 2, cy = h / 2, R = Math.hypot(cx, cy);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  g.fillStyle = `rgba(${NAVY[0]},${NAVY[1]},${NAVY[2]},${bg})`;
  g.fillRect(0, 0, w, h);
  g.lineCap = 'round';
  for (const st of stars) {
    const r1 = st.r * R;
    const r2 = r1 * (1 + k * 1.4) + k * 40;
    const x1 = cx + Math.cos(st.a) * r1, y1 = cy + Math.sin(st.a) * r1;
    const x2 = cx + Math.cos(st.a) * r2, y2 = cy + Math.sin(st.a) * r2;
    g.strokeStyle = st.y ? `rgba(255,210,63,${Math.min(1, bg + 0.2)})` : `rgba(235,240,255,${Math.min(1, bg + 0.1)})`;
    g.lineWidth = st.s * (1 + k * 0.6);
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2 + 0.01, y2);
    g.stroke();
  }
}

function animate(duration, fn) {
  return new Promise((resolve) => {
    const start = performance.now();
    let done = false;
    const finish = () => { if (!done) { done = true; fn(1); resolve(); } };
    const tick = (now) => {
      if (done) return;
      const p = Math.min(1, (now - start) / duration);
      fn(p);
      if (p < 1) requestAnimationFrame(tick); else finish();
    };
    requestAnimationFrame(tick);
    setTimeout(finish, duration + 250); // never hang if frames stall
  });
}

const easeIn = (t) => t * t * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function cover() {
  if (!canvas) build();
  size();
  canvas.classList.add('is-active');
  if (REDUCED) return animate(250, (p) => draw(0, p));
  return animate(550, (p) => draw(easeIn(p), Math.min(1, p * 1.6)));
}

export function reveal() {
  if (REDUCED) return animate(250, (p) => draw(0, 1 - p)).then(() => canvas.classList.remove('is-active'));
  return animate(650, (p) => draw(1 - easeOut(p), 1 - easeOut(p))).then(() => canvas.classList.remove('is-active'));
}
