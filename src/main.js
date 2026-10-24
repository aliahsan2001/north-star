/* Northstar Academy — app shell.
   Header, footer and the light-speed warp persist; Barba swaps the page container
   underneath and each page module mounts and cleans up its own scene. */

import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/inner.css';

import barba from '@barba/core';
import { LITE } from './core/env.js';
import { injectIcons } from './core/icons.js';
import { gsap, ScrollTrigger, initSmoothScroll, resetScroll, reveals, counters, tilt, lockScroll, scrollToEl } from './core/motion.js';
import { cover, reveal } from './core/transition.js';
import { letterHeadings } from './core/effects.js';
import { waLink } from './core/ui.js';
import { CONFIG } from './data.js';

const pages = {
  home: () => import('./pages/home.js'),
  programmes: () => import('./pages/programmes.js'),
  faculty: () => import('./pages/faculty.js'),
  admissions: () => import('./pages/admissions.js'),
  results: () => import('./pages/results.js'),
  404: () => import('./pages/notfound.js'),
};

let current = { ctx: null, cleanup: null };

function setActiveNav(ns) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === ns) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function wireWhatsApp(root) {
  root.querySelectorAll('[data-wa-chat]').forEach((a) => (a.href = waLink(`Hello ${CONFIG.name}, I'd like to know more about admissions.`)));
}

async function mount(container) {
  if (!container) throw new Error('page container missing');
  const ns = container.dataset.barbaNamespace;
  setActiveNav(ns);
  wireWhatsApp(container);
  let cleanup = null;
  const ctx = gsap.context(() => {}, container);
  if (pages[ns]) {
    const mod = await pages[ns]();
    cleanup = await mod.mount(container, ctx);
  }
  // shared effects run after the page has rendered its dynamic content
  ctx.add(() => {
    reveals(container);
    counters(container);
    letterHeadings(container);
  });
  tilt(container);
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    // links like /programmes#o-level land on the right section
    const target = location.hash && container.querySelector(location.hash);
    if (target) setTimeout(() => scrollToEl(target, -100), 300);
  });
  current = { ctx, cleanup };
}

function unmount() {
  try { current.cleanup?.(); } catch (err) { console.error('[northstar] cleanup failed', err); }
  current.ctx?.revert();
  current = { ctx: null, cleanup: null };
}

function syncHead(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  document.title = doc.title;
  const desc = doc.querySelector('meta[name="description"]')?.content;
  if (desc) document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
}

function initNav() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const header = document.querySelector('[data-header]');
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('nav-open', open);
    lockScroll(open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.querySelector('[data-mobile-nav]').addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.documentElement.classList.contains('nav-open')) setOpen(false); });
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => document.documentElement.classList.contains('nav-open') && setOpen(false);
}

/* ---------- boot ---------- */
injectIcons();
initSmoothScroll();
const closeNav = initNav();
wireWhatsApp(document);
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
document.documentElement.classList.add('js');
if (LITE) console.info('Northstar: lite mode (lighter scenes, same content). Add ?full to force 3D.');

barba.init({
  preventRunning: true,
  timeout: 10000,
  // a slow or failed fetch of the next page: go there the ordinary way instead
  requestError: (trigger, action, url) => { if (action === 'click') location.href = url; return false; },
  prevent: ({ el }) => el.hasAttribute('data-no-barba'),
  transitions: [{
    name: 'warp',
    once: ({ next }) => mount(next.container),
    async leave() {
      closeNav();
      await cover();
    },
    afterLeave: () => unmount(),
    enter({ next }) {
      syncHead(next.html);
      resetScroll();
    },
    async after({ next }) {
      try {
        await mount(next.container);
      } catch (err) {
        console.error('[northstar] page mount failed, reloading', err);
        location.href = next.url.href;
        return;
      }
      await reveal();
    },
  }],
});
