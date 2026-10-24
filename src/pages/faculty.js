/* Faculty: teacher ID cards stacked in depth. Each scroll step sends the front card flying past
   you and brings the next one forward, like flipping through a deck. */

import { FACULTY } from '../data.js';
import { esc } from '../core/ui.js';
import { REDUCED } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/motion.js';

const initials = (n) => n.replace(/^(Sir|Ms\.|Dr\.) /, '').split(' ').map((w) => w[0]).join('');

function barcode(seed) {
  let x = seed * 9301 + 49297, out = '';
  for (let i = 0; i < 34; i++) {
    x = (x * 9301 + 49297) % 233280;
    const w = 1 + (x % 3);
    out += `<i style="width:${w}px"></i>`;
  }
  return out;
}

export async function mount(root, ctx) {
  const stage = root.querySelector('[data-deck-stage]');
  const N = FACULTY.length;
  root.querySelector('[data-deck-n]').textContent = String(N).padStart(2, '0');

  stage.innerHTML = FACULTY.map((f, k) => `
    <article class="id-card" data-card="${k}" style="--tone:${f.tone}" aria-label="${esc(f.name)}, ${esc(f.subject)}">
      <header class="id-band"><span class="id-hole" aria-hidden="true"></span><span class="mono">Northstar Academy · Faculty</span><span class="id-holo" aria-hidden="true">★</span></header>
      <div class="id-body">
        <div class="id-photo" aria-hidden="true"><span>${esc(initials(f.name))}</span></div>
        <div class="id-main">
          <h2>${esc(f.name)}</h2>
          <p class="id-subject">${esc(f.subject)}</p>
          <p class="id-levels">${esc(f.levels)}</p>
          <dl class="id-meta"><div><dt>Qualifications</dt><dd>${esc(f.quals)}</dd></div><div><dt>Teaching</dt><dd>${f.years} years</dd></div></dl>
        </div>
      </div>
      <blockquote class="id-quote">“${esc(f.quote)}”</blockquote>
      <footer class="id-foot"><span class="id-barcode" aria-hidden="true">${barcode(k + 3)}</span><span class="mono">NSA-${String(2012 + k).slice(-2)}${String(k + 1).padStart(3, '0')}</span></footer>
    </article>`).join('');

  root.querySelector('[data-fac-table] tbody').innerHTML = FACULTY.map((f) =>
    `<tr><th scope="row">${esc(f.name)}</th><td>${esc(f.subject)}</td><td>${esc(f.levels)}</td><td>${esc(f.quals)}</td><td>${f.years} years</td></tr>`).join('');

  const cards = [...stage.querySelectorAll('.id-card')];
  const counter = root.querySelector('[data-deck-i]');
  const deck = root.querySelector('[data-deck]');
  deck.style.height = `calc(100svh + ${(N - 1) * 70}svh)`;

  // p runs 0..N-1: card k is at the front when p == k
  function place(p) {
    cards.forEach((card, k) => {
      const d = k - p;
      let z, y, o, rx, rz;
      if (d >= 0) {
        // waiting in the stack behind the front card
        z = -d * 170; y = -d * 52; o = Math.max(0, 1 - d * 0.28); rx = 0; rz = (k % 2 ? 1 : -1) * Math.min(d, 3) * 1.6;
      } else {
        // passed: flies toward you and away
        const a = -d;
        z = a * 700; y = -a * 260; o = Math.max(0, 1 - a * 2.8); rx = a * 40; rz = (k % 2 ? 1 : -1) * a * 14;
      }
      gsap.set(card, { z, y, opacity: o, rotationX: rx, rotationZ: rz, zIndex: 100 - k, pointerEvents: Math.abs(d) < 0.5 ? 'auto' : 'none' });
    });
    counter.textContent = String(Math.min(N, Math.round(p) + 1)).padStart(2, '0');
  }
  place(0);

  if (!REDUCED) ctx.add(() => {
    ScrollTrigger.create({ trigger: deck, start: 'top top', end: 'bottom bottom', scrub: 0.6, snap: { snapTo: 1 / (N - 1), duration: { min: 0.2, max: 0.5 }, delay: 0.15 }, onUpdate: (self) => place(self.progress * (N - 1)) });
    const intro = gsap.from(cards[0], { y: 120, opacity: 0, rotationX: 30, duration: 1, ease: 'power3.out', delay: 0.2 });
    setTimeout(() => intro.progress(1), 1800); // never leave the first card half-faded if frames stall
  });
  else { deck.style.height = 'auto'; stage.classList.add('is-static'); cards.forEach((c) => gsap.set(c, { clearProps: 'all' })); }

  return () => {};
}
