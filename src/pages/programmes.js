/* Programmes: six constellations hang in the sky. Click one and it zooms in; its stars become
   the subjects, each linked by a glowing line to its timing. Phones get a swipeable row. */

import { PROGRAMMES } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { LITE, REDUCED } from '../core/env.js';
import { gsap, scrollToEl } from '../core/motion.js';
import { constellationSVG } from '../core/constellation.js';

const rs = (n) => 'Rs ' + n.toLocaleString('en-PK');
const SVGNS = 'http://www.w3.org/2000/svg';

export async function mount(root) {
  const cleanups = [];
  const panel = root.querySelector('[data-atlas-panel]');
  const labels = root.querySelector('[data-atlas-labels]');
  const links = root.querySelector('[data-atlas-links]');
  const hint = root.querySelector('[data-atlas-hint]');
  let sky = null, focused = -1, hovered = -1;

  renderTables(root);

  /* ---------- the detail panel ---------- */
  function showPanel(i) {
    const p = PROGRAMMES[i];
    const minFee = Math.min(...p.subjects.map((s) => s[1]));
    panel.innerHTML = `
      <button type="button" class="icon-btn atlas-back" data-back aria-label="Back to all constellations"><svg aria-hidden="true"><use href="#i-back"/></svg></button>
      <p class="mono panel-const">★ ${esc(p.constellation)} · ${p.subjects.length} stars</p>
      <h2 class="display">${esc(p.name)}</h2>
      <p class="panel-meta">${esc(p.board)} · ${esc(p.duration)} · ${esc(p.ages)}</p>
      <p>${esc(p.blurb)}</p>
      <ul class="batch-list">${p.batches.map((b) => `<li><svg aria-hidden="true"><use href="#i-clock"/></svg><span><b>${esc(b.name)}</b>${esc(b.days)} · ${esc(b.time)}</span></li>`).join('')}</ul>
      <div class="panel-fees"><span>From <b>${rs(minFee)}</b> a subject / month</span><span>Admission ${rs(p.admission)}</span></div>
      <div class="panel-actions">
        <a class="btn btn-pill btn-sm" href="/admissions?programme=${p.id}#calculator">Calculate my fee</a>
        <a class="text-link" href="#${p.id}" data-jump="${p.id}">Full timetable <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
      </div>`;
    panel.hidden = false;
    if (!REDUCED) gsap.fromTo(panel, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
  }

  function focus(i) {
    focused = i;
    sky?.focus(i);
    root.querySelector('[data-atlas]').classList.toggle('is-focused', i >= 0);
    hint.textContent = i >= 0 ? 'Press Esc or Back to see every constellation' : 'Click a constellation to see its subjects';
    if (i >= 0) showPanel(i); else panel.hidden = true;
    buildLabels();
  }

  /* ---------- labels drawn over the 3D sky ---------- */
  function buildLabels() {
    labels.innerHTML = '';
    links.innerHTML = '';
    if (focused < 0) {
      labels.innerHTML = PROGRAMMES.map((p, i) => `<button type="button" class="const-label" data-const="${i}"><b>${esc(p.name)}</b><span>${esc(p.constellation)}</span></button>`).join('');
    } else {
      const p = PROGRAMMES[focused];
      labels.innerHTML = p.subjects.map(([name, fee, time], k) => `<span class="star-label" data-k="${k}"><b>${esc(name)}</b><span>${esc(time)}</span></span>`).join('');
      p.subjects.forEach(() => { const l = document.createElementNS(SVGNS, 'line'); links.appendChild(l); });
      if (!REDUCED) gsap.from(labels.children, { opacity: 0, scale: 0.6, duration: 0.5, stagger: 0.05, delay: 0.5, ease: 'back.out(2)' });
    }
    place();
  }

  function place() {
    if (!sky) return;
    const W = root.querySelector('[data-atlas-stage]').clientWidth;
    if (focused < 0) {
      sky.centresOnScreen().forEach((c, i) => {
        const el = labels.querySelector(`[data-const="${i}"]`);
        if (!el) return;
        el.style.transform = `translate(${c.x}px, ${c.y + 96}px) translateX(-50%)`;
        el.classList.toggle('is-hover', i === hovered);
      });
    } else {
      const stars = sky.starsOnScreen(focused);
      const cx = stars.reduce((n, s) => n + s.x, 0) / stars.length, cy = stars.reduce((n, s) => n + s.y, 0) / stars.length;
      const lines = links.querySelectorAll('line');
      // push each label outward from the constellation's centre, along the star's direction
      const spots = stars.map((s) => {
        let dx = s.x - cx, dy = s.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len; dy /= len;
        return { x: Math.min(W - 90, Math.max(90, s.x + dx * 80)), y: s.y + dy * 56 };
      });
      // then nudge apart any labels that would overlap (stars that sit close together)
      for (let pass = 0; pass < 10; pass++) {
        for (let a = 0; a < spots.length; a++) for (let b = a + 1; b < spots.length; b++) {
          const A = spots[a], B = spots[b];
          if (Math.abs(A.x - B.x) < 170 && Math.abs(A.y - B.y) < 50) {
            const push = (50 - Math.abs(A.y - B.y)) / 2 + 1;
            if (A.y <= B.y) { A.y -= push; B.y += push; } else { A.y += push; B.y -= push; }
          }
        }
      }
      stars.forEach((s, k) => {
        const el = labels.querySelector(`[data-k="${k}"]`);
        if (!el) return;
        const { x: lx, y: ly } = spots[k];
        el.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`;
        const l = lines[k];
        l.setAttribute('x1', s.x); l.setAttribute('y1', s.y); l.setAttribute('x2', lx); l.setAttribute('y2', ly);
      });
    }
  }

  /* ---------- 3D atlas (desktop) ---------- */
  const stage = root.querySelector('[data-atlas-stage]');
  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountSky } = await import('../three/sky.js');
        if (!root.isConnected) return;
        sky = mountSky(root.querySelector('[data-atlas-canvas]'), {
          mode: 'atlas', programmes: PROGRAMMES, small: innerWidth < 760,
          onHover: (i) => { hovered = i; stage.style.cursor = i >= 0 ? 'pointer' : ''; },
        });
        sky.onFrame(place);
        buildLabels();
        // arriving from a link like /programmes#mdcat opens that constellation
        const pre = PROGRAMMES.findIndex((p) => `#${p.id}` === location.hash);
        if (pre >= 0 && innerWidth >= 760) setTimeout(() => focus(pre), 400);
      } catch (err) {
        console.warn('Atlas unavailable, using the row', err);
        document.documentElement.classList.add('lite');
      }
    });
  }
  stage.addEventListener('click', (e) => {
    const b = e.target.closest('[data-const]');
    if (b) return focus(Number(b.dataset.const));
    if (focused < 0 && hovered >= 0) focus(hovered);
  });
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) focus(-1);
    const j = e.target.closest('[data-jump]');
    if (j) { e.preventDefault(); scrollToEl(root.querySelector('#' + j.dataset.jump), -100); }
  });
  const onKey = (e) => { if (e.key === 'Escape' && focused >= 0) focus(-1); };
  addEventListener('keydown', onKey);
  cleanups.push(() => { removeEventListener('keydown', onKey); sky?.dispose(); });

  /* ---------- swipeable row (phones and lighter devices) ---------- */
  const row = root.querySelector('[data-prog-row]');
  row.innerHTML = PROGRAMMES.map((p, i) => `
    <button type="button" class="prog-card" data-row="${i}">
      ${constellationSVG(p, { cls: 'is-lit-all' })}
      <span class="mono">${esc(p.constellation)}</span>
      <b>${esc(p.name)}</b>
      <span class="prog-card-meta">${p.subjects.length} subjects · ${esc(p.duration)}</span>
    </button>`).join('');
  row.addEventListener('click', (e) => {
    const c = e.target.closest('[data-row]');
    if (!c) return;
    scrollToEl(root.querySelector('#' + PROGRAMMES[Number(c.dataset.row)].id), -100);
  });

  return () => cleanups.forEach((fn) => fn());
}

function renderTables(root) {
  root.querySelector('[data-compare] tbody').innerHTML = PROGRAMMES.map((p) => {
    const fees = p.subjects.map((s) => s[1]);
    return `<tr><th scope="row"><a href="#${p.id}">${esc(p.name)}</a></th><td>${esc(p.board)}</td><td>${esc(p.duration)}</td><td>${p.batches.map((b) => `${esc(b.days)}, ${esc(b.time)}`).join('<br>')}</td><td>${p.subjects.length}</td><td>${rs(Math.min(...fees))} – ${rs(Math.max(...fees))}<small> per subject</small></td><td>${rs(p.admission)}</td></tr>`;
  }).join('');

  root.querySelector('[data-timetables]').innerHTML = `<div class="container timetable-grid">${PROGRAMMES.map((p) => `
    <article class="tt-card" id="${p.id}" data-reveal>
      <header class="tt-head">
        ${constellationSVG(p, { cls: 'is-lit-all' })}
        <div><p class="mono">${esc(p.constellation)} · ${esc(p.board)}</p><h2 class="display">${esc(p.name)}</h2><p class="tt-meta">${esc(p.duration)} · ${esc(p.ages)}</p></div>
      </header>
      <table class="data-table compact">
        <caption class="sr-only">${esc(p.name)} subjects, class times and monthly fees</caption>
        <thead><tr><th scope="col">Subject</th><th scope="col">Classes</th><th scope="col">Per month</th></tr></thead>
        <tbody>${p.subjects.map(([n, f, t]) => `<tr><th scope="row">${esc(n)}</th><td>${esc(t)}</td><td>${rs(f)}</td></tr>`).join('')}</tbody>
      </table>
      <a class="btn btn-pill btn-sm" href="/admissions?programme=${p.id}#calculator">Calculate ${esc(p.name)} fee</a>
    </article>`).join('')}</div>`;
}
