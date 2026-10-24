/* Results: the hall of stars. A gold trophy with every top achiever orbiting it,
   then the numbers and a filterable table. */

import { RESULTS, STATS, PROGRAMMES } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { LITE } from '../core/env.js';
import { counters } from '../core/motion.js';

export async function mount(root) {
  const cleanups = [];
  const N = RESULTS.length;
  const q = (s) => root.querySelector(s);
  q('[data-hall-n]').textContent = N;

  /* ---------- the card that's in front ---------- */
  const now = q('[data-hall-now]');
  function show(i) {
    const r = RESULTS[i];
    q('[data-hall-i]').textContent = i + 1;
    now.innerHTML = `<p class="mono">#${String(r.rank).padStart(2, '0')} · ${esc(r.programme)}</p><h2>${esc(r.name)}</h2><p class="hall-score">${esc(r.score)}</p>`;
  }
  show(0);

  /* ---------- 3D hall ---------- */
  let hall = null, idx = 0;
  const go = (i) => { idx = (i + N) % N; hall ? hall.go(idx) : show(idx); };
  q('[data-prev]').addEventListener('click', () => (hall ? hall.prev() : go(idx - 1)));
  q('[data-next]').addEventListener('click', () => (hall ? hall.next() : go(idx + 1)));
  root.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('[data-layout]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    hall?.setLayout(b.dataset.layout);
  }));
  const onKey = (e) => {
    if (e.target.closest('input, select, textarea')) return;
    const r = q('.hall').getBoundingClientRect();
    if (r.bottom < 100 || r.top > innerHeight / 2) return;
    if (e.key === 'ArrowRight') q('[data-next]').click();
    if (e.key === 'ArrowLeft') q('[data-prev]').click();
  };
  addEventListener('keydown', onKey);
  cleanups.push(() => removeEventListener('keydown', onKey));

  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountTrophy } = await import('../three/trophy.js');
        if (!root.isConnected) return;
        hall = mountTrophy(q('[data-hall-canvas]'), { results: RESULTS, small: innerWidth < 760, onChange: (i) => { idx = i; show(i); } });
        cleanups.push(() => hall.dispose());
      } catch (err) {
        console.warn('Trophy unavailable, using cards', err);
        document.documentElement.classList.add('lite');
      }
    });
  }

  /* ---------- lighter devices: a swipeable row of cards ---------- */
  q('[data-hall-lite]').innerHTML = RESULTS.map((r) => `
    <article class="achiever">
      <span class="achiever-star" aria-hidden="true">★</span>
      <p class="mono">#${String(r.rank).padStart(2, '0')} · ${esc(r.programme)}</p>
      <h3>${esc(r.name)}</h3>
      <p class="achiever-score">${esc(r.score)}</p>
    </article>`).join('');

  /* ---------- numbers ---------- */
  q('[data-stats]').innerHTML = STATS.map((s) => `
    <div class="stat" data-reveal><b><span data-count="${s.value}">${s.value}</span>${s.suffix || ''}</b><span>${esc(s.label)}</span></div>`).join('');
  counters(root);

  /* ---------- table with programme filter ---------- */
  const names = ['All', ...PROGRAMMES.map((p) => p.name.replace(' Prep', ''))];
  const filters = q('[data-filters]');
  filters.innerHTML = names.map((n, i) => `<button type="button" class="prog-chip" data-f="${esc(n)}" aria-pressed="${i === 0}">${esc(n)}</button>`).join('');
  const body = q('[data-results] tbody');
  function table(f) {
    const rows = RESULTS.filter((r) => f === 'All' || r.programme === f);
    body.innerHTML = rows.map((r) => `<tr><td class="mono">${String(r.rank).padStart(2, '0')}</td><th scope="row">${esc(r.name)}</th><td>${esc(r.programme)}</td><td class="res-score">${esc(r.score)}</td></tr>`).join('');
  }
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    filters.querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    table(b.dataset.f);
  });
  table('All');

  return () => cleanups.forEach((fn) => fn());
}
