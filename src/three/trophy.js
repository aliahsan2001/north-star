/* Results: a gold trophy turns slowly while 24 achiever cards orbit it, in a ring or a rising
   spiral. go(i) brings a card to the front; dragging spins the orbit and snaps to a card. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const CUP = [[0, 0], [1.25, 0], [1.25, 0.18], [0.9, 0.3], [0.8, 0.5], [1.0, 0.62], [1.0, 0.76], [0.34, 0.86], [0.24, 1.45], [0.36, 1.65], [0.62, 1.76],
  [1.08, 2.15], [1.36, 2.8], [1.48, 3.55], [1.42, 3.6], [1.3, 2.86], [1.02, 2.24], [0.5, 1.9], [0, 1.86]];

function cardTexture(r, total) {
  const W = 512, H = 320;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rr = (x, y, w, h, rad) => { g.beginPath(); g.roundRect(x, y, w, h, rad); };
  rr(6, 6, W - 12, H - 12, 34);
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#1b2a66'); grad.addColorStop(1, '#0d1638');
  g.fillStyle = grad; g.fill();
  g.lineWidth = 8; g.strokeStyle = '#ffd23f'; g.stroke();
  g.fillStyle = 'rgba(255,210,63,.1)'; g.font = '800 260px "Bricolage Grotesque", sans-serif'; g.textAlign = 'right';
  g.fillText('★', W - 10, H - 30);
  g.textAlign = 'left';
  g.fillStyle = '#ffd23f'; g.font = '700 26px "Space Mono", monospace';
  g.fillText(`#${String(r.rank).padStart(2, '0')} / ${total} · ${r.programme.toUpperCase()}`, 40, 70);
  g.fillStyle = '#ffffff'; g.font = '800 54px "Bricolage Grotesque", sans-serif';
  g.fillText(r.name, 40, 160, W - 80);
  g.fillStyle = '#ffe27a'; g.font = '800 64px "Bricolage Grotesque", sans-serif';
  g.fillText(r.score, 40, 250, W - 80);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function starShape(R = 0.42, r = 0.18) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r : R;
    i ? s.lineTo(Math.cos(a) * d, Math.sin(a) * d) : s.moveTo(Math.cos(a) * d, Math.sin(a) * d);
  }
  return s;
}

export function mountTrophy(canvas, { results, small = false, onChange }) {
  const wrap = canvas.parentElement;
  const N = results.length;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.3;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

  scene.add(new THREE.AmbientLight(0x8899ff, 0.4));
  const key = new THREE.DirectionalLight(0xfff1c4, 2.2);
  key.position.set(4, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x7cc4ff, 18, 20);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  /* ---------- trophy ---------- */
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd257, metalness: 1, roughness: 0.18 });
  const trophy = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.LatheGeometry(CUP.map(([x, y]) => new THREE.Vector2(x, y)), 72), gold);
  cup.material.side = THREE.DoubleSide;
  trophy.add(cup);
  [-1, 1].forEach((s) => {
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 16, 40, Math.PI * 1.15), gold);
    h.position.set(s * 1.45, 2.85, 0);
    h.rotation.z = s > 0 ? -Math.PI * 0.55 : Math.PI * 0.4 + Math.PI;
    trophy.add(h);
  });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.7, 0.7, 64), new THREE.MeshStandardMaterial({ color: 0x0b1433, metalness: 0.3, roughness: 0.5 }));
  plinth.position.y = -0.35;
  trophy.add(plinth);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.12, 64), gold);
  band.position.y = -0.3;
  trophy.add(band);
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(), { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), gold);
  star.geometry.center();
  star.position.y = 4.35;
  trophy.add(star);
  trophy.position.y = -1.9;
  scene.add(trophy);

  /* ---------- glints ---------- */
  const gN = small ? 140 : 260, gp = new Float32Array(gN * 3);
  for (let i = 0; i < gN; i++) { const a = Math.random() * Math.PI * 2, rr = 2 + Math.random() * 6; gp.set([Math.cos(a) * rr, (Math.random() - 0.4) * 9, Math.sin(a) * rr], i * 3); }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gp, 3));
  const glints = new THREE.Points(gGeo, new THREE.PointsMaterial({ color: 0xffe27a, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(glints);

  /* ---------- cards ---------- */
  const orbit = new THREE.Group();
  scene.add(orbit);
  const cardGeo = new THREE.PlaneGeometry(2.2, 1.375);
  const cards = results.map((r, k) => {
    const m = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: cardTexture(r, N), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.userData.k = k;
    m.userData.pos = new THREE.Vector3();
    orbit.add(m);
    return m;
  });

  let layout = 'ring', index = 0, angle = 0, angleGoal = 0, lift = 0, liftGoal = 0;
  const step = () => (Math.PI * 2) / N; // the spiral is one rising turn, so no card hides behind another
  const R = () => (layout === 'ring' ? (small ? 4.4 : 5.4) : (small ? 3.8 : 4.6));
  function slot(k, out) {
    const a = k * step();
    const y = layout === 'ring' ? -1.1 + Math.sin(k * 1.7) * 0.2 : -0.6 + (k - (N - 1) / 2) * 0.22;
    return out.set(Math.sin(a) * R(), y, Math.cos(a) * R());
  }
  cards.forEach((c, k) => { slot(k, c.position); c.userData.pos.copy(c.position); });

  function go(i, { instant = false } = {}) {
    // keep the angle continuous so the orbit turns the short way round
    const target = ((i % N) + N) % N;
    let delta = target - index;
    if (layout === 'ring') { if (delta > N / 2) delta -= N; if (delta < -N / 2) delta += N; }
    index = target;
    angleGoal += delta * step();
    liftGoal = layout === 'spiral' ? -((index - (N - 1) / 2) * 0.22) : 0;
    if (instant) { angle = angleGoal; lift = liftGoal; }
    onChange?.(index);
    kick();
  }
  function setLayout(l) {
    if (l === layout) return;
    layout = l;
    angle = angleGoal = index * step();
    liftGoal = layout === 'spiral' ? -((index - (N - 1) / 2) * 0.22) : 0;
    cards.forEach((c, k) => slot(k, c.userData.pos));
    kick();
  }

  /* ---------- drag + click ---------- */
  let drag = null;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const onDown = (e) => { drag = { x: e.clientX, a: angleGoal, moved: 0 }; canvas.setPointerCapture?.(e.pointerId); };
  const onMoveDrag = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    angleGoal = drag.a - dx * 0.006;
    kick();
  };
  const onUp = (e) => {
    if (!drag) return;
    const wasDrag = drag.moved > 6;
    drag = null;
    if (wasDrag) {
      const k = Math.round(angleGoal / step());
      angleGoal = k * step();
      index = ((k % N) + N) % N;
      liftGoal = layout === 'spiral' ? -((index - (N - 1) / 2) * 0.22) : 0;
      onChange?.(index);
      kick();
      return;
    }
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(cards)[0];
    if (hit) go(hit.object.userData.k);
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMoveDrag);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', () => (drag = null));

  /* ---------- size ---------- */
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, small ? 2.6 : 2.3, w < 760 ? 17 : 13.5);
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
    kick();
  }

  /* ---------- loop ---------- */
  let raf = 0, last = performance.now(), visible = true, dead = false, t = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  const tmp = new THREE.Vector3();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now; t += dt;
    const k = 1 - Math.pow(0.004, dt);
    angle += (angleGoal - angle) * k;
    lift += (liftGoal - lift) * k;
    orbit.rotation.y = -angle;
    orbit.position.y = lift;
    trophy.rotation.y = t * 0.25;
    star.rotation.y = -t * 1.2;
    glints.rotation.y = t * 0.04;
    cards.forEach((c, i) => {
      c.position.lerp(c.userData.pos, k);
      // face outward from the trophy, then judge how close to the front it sits
      c.rotation.y = Math.atan2(c.position.x, c.position.z);
      c.getWorldPosition(tmp);
      const front = THREE.MathUtils.clamp((tmp.z + R()) / (2 * R()), 0, 1);
      const active = i === index ? 1 : 0;
      c.material.opacity = 0.18 + front * 0.82;
      const s = 0.82 + front * 0.18 + active * 0.22;
      c.scale.setScalar(c.scale.x + (s - c.scale.x) * k);
      c.renderOrder = Math.round(front * 100);
    });
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    if (visible && !document.hidden && !dead) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();
  // fonts may land after the first paint; redraw the card faces once they do
  document.fonts?.ready.then(() => { if (dead) return; cards.forEach((c, i) => { c.material.map.dispose(); c.material.map = cardTexture(results[i], N); }); kick(); });
  frame(performance.now());
  canvas.classList.add('is-ready');
  if (import.meta.env.DEV) window.__trophy = { cards, orbit, renderer };

  return {
    go, setLayout,
    next: () => go(index + 1),
    prev: () => go(index - 1),
    get index() { return index; },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose?.(); }); });
      scene.environment?.dispose(); pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
