/* Home: stardust gathers into one constellation per programme as you scroll, the camera
   gliding between them, and the North Star leads to admissions. */

import SplitType from 'split-type';
import { PROGRAMMES, RESULTS, STATS, FACULTY } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { LITE, REDUCED, isSmall } from '../core/env.js';
import { gsap, ScrollTrigger } from '../core/motion.js';
import { constellationSVG } from '../core/constellation.js';
import { createTara } from '../core/tara.js';

const rs = (n) => 'Rs ' + n.toLocaleString('en-PK');

export async function mount(root, ctx) {
  const cleanups = [];

  root.querySelector('[data-programme-panels]').innerHTML = PROGRAMMES.map((p, i) => `
    <div class="sky-panel" data-panel="${i}">
      <div class="container">
        <div class="panel-card">
          <p class="panel-const mono"><span class="star-dot">★</span> ${esc(p.constellation)} · ${p.subjects.length} stars</p>
          <h2 class="display">${esc(p.name)}</h2>
          <p class="panel-meta">${esc(p.board)} · ${esc(p.duration)} · ${esc(p.ages)}</p>
          <p class="panel-blurb">${esc(p.blurb)}</p>
          <div class="panel-chips">
            <span class="chip">${p.subjects.length} subjects</span>
            <span class="chip">From ${rs(Math.min(...p.subjects.map((s) => s[1])))}/month</span>
            <span class="chip">${esc(p.batches[0].time)}</span>
          </div>
          <a class="text-link" href="/programmes#${p.id}">Subjects &amp; timings <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
          <div class="panel-lite">${constellationSVG(p, { cls: 'is-lit-all' })}</div>
        </div>
      </div>
    </div>`).join('');

  renderResults(root);
  root.querySelector('[data-teachers]').innerHTML = FACULTY.slice(0, 6).map((f) => `
    <a class="teacher-chip" href="/faculty" data-reveal data-tilt>
      <span class="mono-avatar" style="--tone:${f.tone}">${esc(f.name.replace(/^(Sir|Ms\.|Dr\.) /, '').split(' ').map((w) => w[0]).join(''))}</span>
      <span><b>${esc(f.name)}</b><small>${esc(f.subject)} · ${f.years} yrs</small></span>
    </a>`).join('');

  const tara = createTara(root.querySelector('[data-cta-tara]'));
  tara.say('I can add up your fee in seconds!', 'happy');
  cleanups.push(() => tara.destroy());

  // hero headline assembles letter by letter
  if (!REDUCED) document.fonts.ready.then(() => root.isConnected && ctx.add(() => {
    const split = new SplitType(root.querySelector('[data-hero-letters]'), { types: 'words, chars' });
    const tl = gsap.from(split.chars, { opacity: 0, x: () => gsap.utils.random(-80, 80), y: () => gsap.utils.random(-60, 60), rotation: () => gsap.utils.random(-50, 50), scale: 0.3, duration: 0.9, ease: 'back.out(1.7)', stagger: { each: 0.04, from: 'random' }, delay: 0.2 });
    setTimeout(() => tl.progress(1), 3000);
  }));

  /* ---------- the sky ---------- */
  const label = root.querySelector('[data-sky-label]');
  const step = root.querySelector('[data-sky-step]');
  const names = ['The night sky', ...PROGRAMMES.map((p) => `${p.constellation} · ${p.name}`), 'The North Star'];
  let sky = null;
  const onProgress = (p) => {
    sky?.setProgress(p);
    const i = Math.min(7, Math.round(p * 7));
    step.textContent = String(i).padStart(2, '0');
    label.textContent = names[i];
  };

  ctx.add(() => {
    ScrollTrigger.create({
      trigger: root.querySelector('[data-sky]'),
      start: 'top top',
      end: 'bottom bottom',
      scrub: REDUCED ? false : 0.8,
      onUpdate: (self) => onProgress(self.progress),
    });
    // each panel's card slides in as it arrives
    root.querySelectorAll('.panel-card').forEach((card) => {
      gsap.from(card, { opacity: 0, y: 60, duration: 0.9, scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' } });
    });
  });

  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountSky } = await import('../three/sky.js');
        if (!root.isConnected) return;
        sky = mountSky(root.querySelector('[data-sky-canvas]'), { mode: 'journey', programmes: PROGRAMMES, small: isSmall() });
        onProgress(ScrollTrigger.getAll().find((t) => t.trigger === root.querySelector('[data-sky]'))?.progress || 0);
        // dev only: ?skyp=0.4 jumps to that point of the journey (for screenshots)
        const jump = import.meta.env.DEV && new URLSearchParams(location.search).get('skyp');
        if (jump) {
          const el = root.querySelector('[data-sky]');
          window.scrollTo(0, el.offsetTop + (el.offsetHeight - innerHeight) * Number(jump));
          onProgress(Number(jump));
        }
      } catch (err) {
        console.warn('Sky unavailable, using the lighter sky', err);
        document.documentElement.classList.add('lite');
      }
    });
  }
  cleanups.push(() => sky?.dispose());
  return () => cleanups.forEach((fn) => fn());
}

function renderResults(root) {
  root.querySelector('[data-stats]').innerHTML = STATS.map((s) => `
    <div class="stat" data-reveal><b><span data-count="${s.value}">${s.value}</span>${s.suffix || ''}</b><span>${esc(s.label)}</span></div>`).join('');
  root.querySelector('[data-achievers]').innerHTML = RESULTS.slice(0, 4).map((r) => `
    <article class="achiever" data-reveal data-tilt>
      <span class="achiever-star" aria-hidden="true">★</span>
      <p class="mono">${esc(r.programme)} · ${r.year}</p>
      <h3>${esc(r.name)}</h3>
      <p class="achiever-score">${esc(r.score)}</p>
    </article>`).join('');
}
