/* The night sky. Thousands of particles drift as stardust; each programme's particles can
   gather into its constellation (one star per subject, joined by glowing lines).
   mode 'journey' (home): scroll progress forms constellations in turn while the camera glides
   between them, ending at the North Star. mode 'atlas' (programmes): all constellations hang
   in a grid; focus(i) zooms the camera in. */

import * as THREE from 'three';

const NAVY = new THREE.Color('#070d24');
const JOURNEY = [[-3.2, 1.6, 0], [4.2, -1, -9], [-4.2, -1.8, -18], [4, 1.8, -27], [-3.4, 0.2, -36], [3.4, -1.6, -45]];
const NORTH_STAR = new THREE.Vector3(0, 7, -58);
const ATLAS = [[-5.6, 1.4, 0], [0, 1.4, 0], [5.6, 1.4, 0], [-5.6, -3.6, 0], [0, -3.6, 0], [5.6, -3.6, 0]];

function rand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function mountSky(canvas, { mode = 'journey', programmes, small = false, onHover }) {
  const wrap = canvas.parentElement;
  const r = rand(7);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  const scene = new THREE.Scene();
  scene.background = NAVY;
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

  const centers = (mode === 'journey' ? JOURNEY : ATLAS).map((c) => new THREE.Vector3(...c));
  const SCALE = mode === 'journey' ? 2.3 : 2.0;

  /* ---------- particles ---------- */
  const PER_STAR = small ? 26 : 46;
  const BG = small ? 1500 : 3600;
  const homes = [], targets = [], groups = [], seeds = [], cores = [];
  const starWorld = programmes.map((p, i) => p.shape.map(([x, y]) => new THREE.Vector3(centers[i].x + x * SCALE, centers[i].y + y * SCALE, centers[i].z + (r() - 0.5) * (mode === 'journey' ? 2.2 : 1.2))));

  const spread = mode === 'journey' ? { x: 40, y: 24, z0: 22, z1: -90 } : { x: 26, y: 15, z0: -2, z1: -40 };
  const randomHome = () => [(r() - 0.5) * 2 * spread.x, (r() - 0.5) * 2 * spread.y, spread.z1 + r() * (spread.z0 - spread.z1)];

  starWorld.forEach((stars, gi) => stars.forEach((s) => {
    for (let k = 0; k < PER_STAR; k++) {
      // dust: scattered around the constellation's neighbourhood
      const h = [s.x + (r() - 0.5) * 9, s.y + (r() - 0.5) * 7, s.z + (r() - 0.5) * 8];
      const a = r() * Math.PI * 2, rad = k === 0 ? 0 : Math.pow(r(), 3) * 0.1;
      homes.push(...h);
      targets.push(s.x + Math.cos(a) * rad, s.y + Math.sin(a) * rad, s.z + (r() - 0.5) * 0.1);
      groups.push(gi);
      seeds.push(r());
      cores.push(k === 0 ? 1 : 0);
    }
  }));
  for (let k = 0; k < BG; k++) {
    const h = randomHome();
    homes.push(...h);
    targets.push(...h);
    groups.push(-1);
    seeds.push(r());
    cores.push(0);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(homes, 3));
  geo.setAttribute('aTarget', new THREE.Float32BufferAttribute(targets, 3));
  geo.setAttribute('aGroup', new THREE.Float32BufferAttribute(groups, 1));
  geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  geo.setAttribute('aCore', new THREE.Float32BufferAttribute(cores, 1));

  const uniforms = {
    uTime: { value: 0 },
    uForm: { value: new Array(6).fill(mode === 'atlas' ? 1 : 0) },
    uDim: { value: new Array(6).fill(1) },
    uPixel: { value: renderer.getPixelRatio() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uPixel; uniform float uForm[6]; uniform float uDim[6];
      attribute vec3 aTarget; attribute float aGroup, aSeed, aCore;
      varying float vAlpha; varying float vFormed; varying float vCore;
      void main(){
        float f = 0.0; float dim = 1.0;
        if (aGroup > -0.5) {
          int gi = int(aGroup + 0.5);
          // each particle arrives at its own moment, so the gathering looks organic
          f = smoothstep(aSeed * 0.45, aSeed * 0.45 + 0.55, uForm[gi]);
          dim = uDim[gi];
        }
        vec3 drift = vec3(sin(uTime * 0.25 + aSeed * 40.0), cos(uTime * 0.2 + aSeed * 30.0), sin(uTime * 0.15 + aSeed * 20.0)) * 0.25 * (1.0 - f);
        vec3 p = mix(position + drift, aTarget, f);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float twinkle = 0.65 + 0.35 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 60.0);
        float pulse = aCore > 0.5 ? 1.0 + 0.1 * sin(uTime * 1.8 + aSeed * 12.0) : 1.0;
        float size = mix(1.6 + aSeed * 2.2, aCore > 0.5 ? 30.0 : 1.9, f) * pulse;
        gl_PointSize = size * uPixel * (14.0 / -mv.z);
        vAlpha = mix(0.55 * twinkle, 1.0, f) * dim;
        vFormed = f; vCore = aCore;
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha; varying float vFormed; varying float vCore;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = vCore > 0.5 ? pow(a, 1.6) * 1.0 + smoothstep(0.12, 0.0, d) : pow(a, 2.2);
        vec3 cool = vec3(0.82, 0.88, 1.0);
        vec3 gold = vec3(1.0, 0.84, 0.3);
        vec3 col = mix(cool, gold, vFormed * (vCore > 0.5 ? 1.0 : 0.8));
        gl_FragColor = vec4(col, a * vAlpha);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  /* ---------- constellation lines: glowing tubes that draw along their length ---------- */
  const lineVert = /* glsl */ `
    varying vec2 vUv; varying float vFres;
    void main(){
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vFres = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
      gl_Position = projectionMatrix * mv;
    }`;
  const lineFrag = /* glsl */ `
    uniform float uDraw, uOpacity, uSoft; uniform vec3 uColor;
    varying vec2 vUv; varying float vFres;
    void main(){
      float head = smoothstep(uDraw, uDraw - 0.04, vUv.x);
      float edge = mix(1.0, pow(vFres, 2.0), uSoft);
      gl_FragColor = vec4(uColor, head * edge * uOpacity);
    }`;
  const lineMat = (soft) => new THREE.ShaderMaterial({
    uniforms: { uDraw: { value: 0 }, uOpacity: { value: 0 }, uSoft: { value: soft }, uColor: { value: new THREE.Color(soft ? '#ffc83d' : '#ffe7a0') } },
    vertexShader: lineVert, fragmentShader: lineFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const lines = programmes.map((p, i) => p.edges.map(([a, b], e) => {
    const path = new THREE.LineCurve3(starWorld[i][a], starWorld[i][b]);
    const core = new THREE.Mesh(new THREE.TubeGeometry(path, 1, small ? 0.022 : 0.016, 6, false), lineMat(0));
    const glow = new THREE.Mesh(new THREE.TubeGeometry(path, 1, small ? 0.12 : 0.1, 10, false), lineMat(1));
    scene.add(core, glow);
    return { core, glow, e, E: p.edges.length };
  }));

  /* ---------- the North Star (journey only) ---------- */
  let north = null;
  if (mode === 'journey') {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,255,240,1)');
    grd.addColorStop(0.12, 'rgba(255,225,120,.9)');
    grd.addColorStop(0.4, 'rgba(255,210,63,.18)');
    grd.addColorStop(1, 'rgba(255,210,63,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(255,240,190,.85)';
    [[128, 4, 128, 252], [4, 128, 252, 128]].forEach(([a, b, cc, d]) => { g.lineWidth = 3; g.beginPath(); g.moveTo(a, b); g.lineTo(cc, d); g.stroke(); });
    const tex = new THREE.CanvasTexture(c);
    north = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    north.position.copy(NORTH_STAR);
    north.scale.setScalar(6);
    scene.add(north);
  }

  /* ---------- camera paths ---------- */
  let side = 0; // how far to push constellations right of centre (desktop text sits left)
  const views = [];
  function buildViews() {
    views.length = 0;
    if (mode === 'journey') {
      views.push({ pos: new THREE.Vector3(0, 0, 26), look: new THREE.Vector3(0, 0, -14) });
      centers.forEach((c) => views.push({ pos: new THREE.Vector3(c.x - side, c.y, c.z + (small ? 12 : 10.5)), look: new THREE.Vector3(c.x - side, c.y, c.z) }));
      views.push({ pos: new THREE.Vector3(NORTH_STAR.x - side * 0.6, NORTH_STAR.y - 3, NORTH_STAR.z + 14), look: NORTH_STAR.clone().setX(NORTH_STAR.x - side * 0.6) });
    }
  }
  const overview = { pos: new THREE.Vector3(0, 1.4, 19), look: new THREE.Vector3(0, 0.2, 0) };
  const cam = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const goal = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  let progress = 0, focused = -1, paths = null;

  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 760 ? 58 : 45;
    camera.updateProjectionMatrix();
    side = w < 760 ? 0 : Math.min(3.2, (w / h) * 1.6);
    buildViews();
    paths = null;
    if (mode === 'atlas') { overview.pos.z = w < 900 ? 24 : 19; overview.pos.x = overview.look.x = w < 900 ? 0 : -2.6; /* clear the headline on the left */ if (focused < 0) { goal.pos.copy(overview.pos); goal.look.copy(overview.look); } }
    setProgress(progress, true);
  }

  // journey: p in 0..1 across intro, six constellations and the North Star
  function setProgress(p, snap = false) {
    progress = p;
    if (mode !== 'journey') return;
    const S = views.length - 1;
    const s = p * S;
    const i = Math.min(S - 1, Math.floor(s)), f = s - i;
    const e = f * f * (3 - 2 * f); // ease in and out of each stop
    if (!paths) paths = { pos: new THREE.CatmullRomCurve3(views.map((v) => v.pos), false, 'centripetal'), look: new THREE.CatmullRomCurve3(views.map((v) => v.look), false, 'centripetal') };
    paths.pos.getPoint((i + e) / S, goal.pos);
    paths.look.getPoint((i + e) / S, goal.look);
    for (let k = 0; k < 6; k++) uniforms.uForm.value[k] = THREE.MathUtils.clamp((s - k - 0.35) / 0.65, 0, 1);
    if (snap) { cam.pos.copy(goal.pos); cam.look.copy(goal.look); }
  }

  // atlas: zoom to one constellation (or back out with -1)
  function focus(i) {
    focused = i;
    if (i < 0) { goal.pos.copy(overview.pos); goal.look.copy(overview.look); }
    else {
      const c = centers[i];
      const shift = wrap.clientWidth < 900 ? 0 : 3.4; // leave room for the detail panel on the right
      goal.pos.set(c.x + shift, c.y - 0.4, c.z + 10);
      goal.look.set(c.x + shift, c.y, c.z);
    }
    for (let k = 0; k < 6; k++) uniforms.uDim.value[k] = i < 0 || k === i ? 1 : 0.25;
  }

  // screen positions (CSS px) of a constellation's stars and its centre
  const v = new THREE.Vector3();
  function project(p3) {
    v.copy(p3).project(camera);
    return { x: (v.x * 0.5 + 0.5) * wrap.clientWidth, y: (-v.y * 0.5 + 0.5) * wrap.clientHeight, behind: v.z > 1 };
  }
  const starsOnScreen = (i) => starWorld[i].map(project);
  const centresOnScreen = () => centers.map(project);

  /* ---------- hover picking (atlas) ---------- */
  let hovered = -1;
  const onMove = (e) => {
    if (mode !== 'atlas' || focused >= 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let best = -1, bestD = Infinity;
    centresOnScreen().forEach((c, i) => { const d = Math.hypot(c.x - mx, c.y - my); if (d < bestD) { bestD = d; best = i; } });
    const next = bestD < Math.min(rect.width, rect.height) * 0.2 ? best : -1;
    if (next !== hovered) { hovered = next; onHover?.(next); for (let k = 0; k < 6; k++) uniforms.uDim.value[k] = next < 0 || k === next ? 1 : 0.45; }
  };
  canvas.addEventListener('pointermove', onMove);
  const mouse = new THREE.Vector2(), smooth = new THREE.Vector2();
  const onWinMove = (e) => mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  addEventListener('pointermove', onWinMove, { passive: true });

  /* ---------- loop ---------- */
  let raf = 0, last = performance.now(), visible = true, dead = false;
  const off = new THREE.Vector3(), Y_AXIS = new THREE.Vector3(0, 1, 0);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  const listeners = [];
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    uniforms.uTime.value += dt;
    smooth.lerp(mouse, 1 - Math.pow(0.08, dt));
    const k = 1 - Math.pow(0.012, dt); // frame-rate independent easing, soft enough to glide
    cam.pos.lerp(goal.pos, k);
    cam.look.lerp(goal.look, k);
    // orbit gently around what we're looking at, so near and far stars slide past each other
    off.copy(cam.pos).sub(cam.look);
    const reach = Math.min(1, 12 / off.length());
    off.applyAxisAngle(Y_AXIS, ((mode === 'journey' ? Math.sin(uniforms.uTime.value * 0.13) * 0.14 : 0) + smooth.x * (mode === 'journey' ? 0.26 : 0.1)) * reach);
    off.y += smooth.y * (mode === 'journey' ? 1.2 : 0.5) * reach;
    camera.position.copy(cam.look).add(off);
    camera.lookAt(cam.look);
    for (let i = 0; i < 6; i++) {
      const form = mode === 'atlas' ? 1 : uniforms.uForm.value[i];
      const F = THREE.MathUtils.clamp((form - 0.3) / 0.7, 0, 1), dim = uniforms.uDim.value[i];
      lines[i].forEach(({ core, glow, e, E }) => {
        const d = THREE.MathUtils.clamp((F - (e / E) * 0.5) / 0.5, 0, 1); // edges draw one after another
        core.material.uniforms.uDraw.value = glow.material.uniforms.uDraw.value = d * 1.04;
        core.material.uniforms.uOpacity.value = 0.9 * dim;
        glow.material.uniforms.uOpacity.value = 0.32 * dim;
      });
    }
    if (north) {
      const glow = mode === 'journey' ? THREE.MathUtils.clamp((progress - 0.8) / 0.2, 0.25, 1) : 0;
      north.material.opacity = glow;
      north.scale.setScalar(5 + Math.sin(uniforms.uTime.value * 1.6) * 0.4 + glow * 3);
      north.material.rotation = uniforms.uTime.value * 0.05;
    }
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    listeners.forEach((fn) => fn());
    if (visible && !document.hidden && !dead) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);

  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();
  if (mode === 'atlas') { cam.pos.copy(overview.pos).add(new THREE.Vector3(0, 0, 8)); cam.look.copy(overview.look); }
  frame(performance.now()); // draw once immediately
  canvas.classList.add('is-ready');

  return {
    setProgress, focus, starsOnScreen, centresOnScreen,
    onFrame: (fn) => listeners.push(fn),
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      removeEventListener('pointermove', onWinMove);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose?.(); }); });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
