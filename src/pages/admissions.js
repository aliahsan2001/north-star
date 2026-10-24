/* Admissions: a fee calculator where every ticked subject lights a star in the programme's
   constellation, the fee table, and an application form that Tara reacts to. */

import { PROGRAMMES, CONFIG } from '../data.js';
import { esc, fmt, waLink, store } from '../core/ui.js';
import { REDUCED } from '../core/env.js';
import { gsap, scrollToEl } from '../core/motion.js';
import { constellationSVG, lightStars } from '../core/constellation.js';
import { createTara } from '../core/tara.js';

const KEY = 'ns-calc';

export async function mount(root) {
  const cleanups = [];
  const q = (s) => root.querySelector(s);

  /* ---------- state ---------- */
  const fromUrl = new URLSearchParams(location.search).get('programme');
  const saved = store.get(KEY, null);
  let pi = Math.max(0, PROGRAMMES.findIndex((p) => p.id === (fromUrl || saved?.p)));
  let picked = new Set(!fromUrl || fromUrl === saved?.p ? saved?.s || [] : []);
  let sibling = !!saved?.sib;

  /* ---------- 1. programme picker ---------- */
  q('[data-prog-pick]').innerHTML = PROGRAMMES.map((p, i) =>
    `<button type="button" class="prog-chip" data-pi="${i}" aria-pressed="false">${esc(p.name)}</button>`).join('');
  q('[data-prog-pick]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pi]');
    if (!b || Number(b.dataset.pi) === pi) return;
    pi = Number(b.dataset.pi); picked = new Set();
    drawProgramme(); update();
  });

  const sibBox = q('[data-sibling]');
  sibBox.checked = sibling;
  sibBox.addEventListener('change', () => { sibling = sibBox.checked; update(); });

  /* ---------- 2. subjects + constellation ---------- */
  const grid = q('[data-subj-grid]');
  const sky = q('[data-calc-sky]');
  function drawProgramme() {
    const p = PROGRAMMES[pi];
    root.querySelectorAll('[data-pi]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.pi) === pi)));
    grid.innerHTML = p.subjects.map(([n, fee, time], k) => `
      <label class="subj">
        <input type="checkbox" value="${k}" ${picked.has(k) ? 'checked' : ''}>
        <span class="subj-star" aria-hidden="true">★</span>
        <span class="subj-name">${esc(n)}<small>${esc(time)}</small></span>
        <span class="subj-fee">${fmt(fee)}</span>
      </label>`).join('');
    sky.innerHTML = constellationSVG(p, { cls: 'calc-constellation' });
    q('[data-calc-const]').textContent = `★ ${p.constellation}`;
    if (!REDUCED) gsap.from(grid.children, { y: 14, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'power3.out', clearProps: 'all' });
    syncForm();
  }
  grid.addEventListener('change', (e) => {
    const k = Number(e.target.value);
    e.target.checked ? picked.add(k) : picked.delete(k);
    update();
  });

  /* ---------- totals ---------- */
  const totalEl = q('[data-calc-total]');
  const shown = { v: 0 };
  function quote() {
    const p = PROGRAMMES[pi];
    const list = [...picked].sort((a, b) => a - b).map((k) => p.subjects[k]);
    const base = list.reduce((n, s) => n + s[1], 0);
    const lines = [];
    let total = base;
    const all = p.packageDiscount && list.length === p.subjects.length;
    if (all) { const d = base * p.packageDiscount; lines.push([`Full package (${p.packageDiscount * 100}%)`, -d]); total -= d; }
    else if (list.length >= 4) { const d = base * CONFIG.multiSubjectDiscount; lines.push(['4+ subjects (10%)', -d]); total -= d; }
    if (sibling && list.length) { const d = total * CONFIG.siblingDiscount; lines.push(['Sibling (10%)', -d]); total -= d; }
    return { p, list, base, lines, total };
  }

  function update() {
    const { p, list, base, lines, total } = quote();
    lightStars(sky.querySelector('svg'), [...picked]);
    q('[data-subj-count]').textContent = list.length ? `· ${list.length} of ${p.subjects.length}` : '';
    q('[data-calc-lines]').innerHTML = list.length
      ? `<div><dt>${list.length} subject${list.length > 1 ? 's' : ''}</dt><dd>${fmt(base)}</dd></div>` + lines.map(([l, v]) => `<div class="is-off"><dt>${esc(l)}</dt><dd>− ${fmt(-v)}</dd></div>`).join('')
      : '<div class="calc-empty"><dt>Tick a subject to light its star.</dt></div>';
    q('[data-calc-once]').innerHTML = `Plus a one-time admission fee of <b>${fmt(p.admission)}</b>.`;
    if (REDUCED) totalEl.textContent = fmt(total);
    else gsap.to(shown, { v: total, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => (totalEl.textContent = fmt(shown.v)), onComplete: () => (totalEl.textContent = fmt(total)) });
    // if frames stall, still land on the right number
    clearTimeout(update.t); update.t = setTimeout(() => (totalEl.textContent = fmt(total)), 900);
    q('[data-calc-apply]').classList.toggle('is-hidden', !list.length);
    store.set(KEY, { p: p.id, s: [...picked], sib: sibling });
    syncForm();
  }

  /* ---------- fee structure ---------- */
  q('[data-fees]').innerHTML = PROGRAMMES.map((p) => `
    <article class="fee-card" data-reveal>
      <header>${constellationSVG(p, { cls: 'is-lit-all' })}<div><h3>${esc(p.name)}</h3><p class="mono">${esc(p.board)}</p></div></header>
      <table class="data-table compact">
        <caption class="sr-only">${esc(p.name)} monthly fee per subject</caption>
        <tbody>${p.subjects.map(([n, f]) => `<tr><th scope="row">${esc(n)}</th><td>${fmt(f)}</td></tr>`).join('')}
        <tr class="fee-adm"><th scope="row">Admission (once)</th><td>${fmt(p.admission)}</td></tr></tbody>
      </table>
      <a class="text-link" href="?programme=${p.id}#calculator" data-calc-for="${p.id}">Calculate ${esc(p.name)} <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
    </article>`).join('');
  q('[data-fees]').addEventListener('click', (e) => {
    const a = e.target.closest('[data-calc-for]');
    if (!a) return;
    e.preventDefault();
    pi = PROGRAMMES.findIndex((p) => p.id === a.dataset.calcFor); picked = new Set();
    drawProgramme(); update();
    scrollToEl(q('#calculator'), -90);
  });

  /* ---------- in-page jumps ---------- */
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    scrollToEl(q(a.getAttribute('href')), -90);
  });

  /* ---------- application form + Tara ---------- */
  const form = q('[data-apply]');
  const tara = createTara(q('[data-apply-tara]'));
  tara.say('Hi! Fill this in and I\'ll pass it to the admissions office.', 'happy');
  cleanups.push(() => tara.destroy());

  const progSel = form.elements.programme, batchSel = form.elements.batch;
  progSel.innerHTML = PROGRAMMES.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('');
  function fillBatches() {
    batchSel.innerHTML = PROGRAMMES[Number(progSel.value)].batches.map((b) => `<option>${esc(b.name)} · ${esc(b.days)}, ${esc(b.time)}</option>`).join('');
  }
  function syncForm() {
    if (Number(progSel.value) !== pi) { progSel.value = String(pi); fillBatches(); }
    const { list, total } = quote();
    q('[data-apply-subjects]').innerHTML = list.length
      ? `<svg aria-hidden="true"><use href="#i-star"/></svg> Subjects from your calculator: <b>${list.map((s) => esc(s[0])).join(', ')}</b> · ${fmt(total)} a month`
      : '<svg aria-hidden="true"><use href="#i-star"/></svg> No subjects picked yet. You can use the calculator above, or we\'ll help you choose.';
  }
  progSel.addEventListener('change', () => { fillBatches(); pi = Number(progSel.value); picked = new Set(); drawProgramme(); update(); });

  const RULES = {
    name: (v) => (v.trim().length < 3 ? 'Please write the student\'s full name.' : ''),
    parent: (v) => (v.trim().length < 3 ? 'Who should we talk to? A parent or guardian\'s name, please.' : ''),
    phone: (v) => (/^(\+?92|0)3\d{2}[\s-]?\d{7}$/.test(v.replace(/\s+/g, ' ').trim()) ? '' : 'That doesn\'t look like a Pakistani mobile. Try 03xx xxxxxxx.'),
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Check the email, it seems to be missing something.'),
  };
  const check = (name) => {
    const el = form.elements[name];
    const msg = RULES[name]?.(el.value) || '';
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) el.setAttribute('aria-describedby', `e-${name}`); else el.removeAttribute('aria-describedby');
    q(`#e-${name}`).textContent = msg;
    return msg;
  };
  const filled = () => Object.keys(RULES).every((n) => !RULES[n](form.elements[n].value));

  form.addEventListener('focusout', (e) => {
    const n = e.target.name;
    if (!RULES[n] || !e.target.value) return;
    const msg = check(n);
    if (msg) tara.say(msg, 'puzzled');
    else if (filled()) tara.say('Everything looks perfect. Hit send!', 'happy');
    else tara.say('Nice, that one\'s right.', 'idle');
  });
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') check(e.target.name); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(RULES).map((n) => [n, check(n)]).filter(([, m]) => m);
    if (bad.length) {
      tara.say(bad.length > 1 ? `A few fields need a look. Let's start with this one.` : bad[0][1], 'puzzled');
      form.elements[bad[0][0]].focus();
      if (!REDUCED) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const { p, list, total } = quote();
    const id = 'NSA-' + new Date().getFullYear().toString().slice(-2) + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const msg = [`Northstar admission application ${id}`, `Student: ${d.name}`, `Parent: ${d.parent}`, `Mobile: ${d.phone}`, d.email && `Email: ${d.email}`,
      `Programme: ${p.name}`, `Batch: ${d.batch}`, list.length && `Subjects: ${list.map((s) => s[0]).join(', ')} (${fmt(total)}/month)`, d.school && `School: ${d.school}`].filter(Boolean).join('\n');
    const done = q('[data-apply-done]');
    done.innerHTML = `
      <p class="mono">Application received</p>
      <h3 class="display">Welcome aboard, ${esc(d.name.trim().split(' ')[0])}!</h3>
      <p>Your application ID is <b class="app-id">${id}</b>. Our admissions office calls within one working day to book an assessment slot.</p>
      <div class="done-actions">
        <a class="btn btn-pill" href="${waLink(msg)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg> Send it on WhatsApp</a>
        <button type="button" class="btn btn-ghost" data-again>Apply for someone else</button>
      </div>
      <p class="done-note">This is a concept site, so nothing was sent. On a live site the office would get this instantly.</p>`;
    form.hidden = true; done.hidden = false; done.focus();
    tara.say(`You're in, ${d.name.trim().split(' ')[0]}! Welcome to Northstar.`, 'cheer');
    if (!REDUCED) gsap.from(done.children, { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', clearProps: 'all' });
  });
  q('[data-apply-done]').addEventListener('click', (e) => {
    if (!e.target.closest('[data-again]')) return;
    form.reset(); fillBatches(); syncForm();
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
    q('[data-apply-done]').hidden = true; form.hidden = false; form.elements.name.focus();
    tara.say('Ready for the next one!', 'happy');
  });

  /* ---------- go ---------- */
  progSel.value = String(pi); fillBatches();
  drawProgramme(); update();
  if (fromUrl && location.hash === '#calculator') setTimeout(() => scrollToEl(q('#calculator'), -90), 300);

  return () => cleanups.forEach((fn) => fn());
}
