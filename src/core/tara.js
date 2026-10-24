/* Tara, the academy's star mascot. Drawn in SVG and animated with GSAP (the brief suggests Rive;
   this keeps her equally light with no extra asset). Moods: idle, happy, cheer, puzzled, think. */

import { gsap } from './motion.js';
import { REDUCED } from './env.js';

const MOUTHS = {
  idle: 'M-9 7 Q0 14 9 7',
  happy: 'M-11 5 Q0 18 11 5',
  cheer: 'M-11 4 Q0 22 11 4 Q0 10 -11 4',
  puzzled: 'M-6 10 Q-1 7 4 10 Q7 12 9 9',
  think: 'M-5 9 L6 8',
};

const STAR_PATH = 'M0 -58 C8 -58 12 -46 18 -30 C21 -22 28 -20 44 -19 C60 -18 64 -8 52 2 C40 12 37 18 41 34 C45 50 37 58 23 49 C9 40 -9 40 -23 49 C-37 58 -45 50 -41 34 C-37 18 -40 12 -52 2 C-64 -8 -60 -18 -44 -19 C-28 -20 -21 -22 -18 -30 C-12 -46 -8 -58 0 -58 Z';

export function createTara(host, { name = 'Tara' } = {}) {
  host.classList.add('tara');
  host.innerHTML = `
    <div class="tara-bubble" role="status" aria-live="polite"><span class="tara-name">${name}</span><span data-tara-text>Hi! I'm Tara. I'll help you through this.</span></div>
    <svg class="tara-svg" viewBox="-80 -80 160 160" aria-hidden="true">
      <defs>
        <radialGradient id="taraBody" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffd23f"/><stop offset="1" stop-color="#f2a900"/></radialGradient>
      </defs>
      <g class="tara-sparks">${[[-62, -40], [64, -30], [-58, 46], [60, 50]].map(([x, y]) => `<path d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z"/>`).join('')}</g>
      <g class="tara-body">
        <path d="${STAR_PATH}" fill="url(#taraBody)" stroke="#c98a00" stroke-width="2.5"/>
        <g class="tara-face">
          <path class="tara-brow tara-brow-l" d="M-20 -14 Q-14 -19 -8 -15"/>
          <path class="tara-brow tara-brow-r" d="M8 -15 Q14 -19 20 -14"/>
          <g class="tara-eyes"><ellipse class="tara-eye" cx="-13" cy="-4" rx="4.6" ry="6"/><ellipse class="tara-eye" cx="13" cy="-4" rx="4.6" ry="6"/>
            <circle cx="-11.6" cy="-6.4" r="1.6" fill="#fff"/><circle cx="14.4" cy="-6.4" r="1.6" fill="#fff"/></g>
          <ellipse class="tara-cheek" cx="-24" cy="8" rx="6" ry="3.6"/><ellipse class="tara-cheek" cx="24" cy="8" rx="6" ry="3.6"/>
          <path class="tara-mouth" d="${MOUTHS.idle}"/>
        </g>
        <text class="tara-q" x="34" y="-38">?</text>
      </g>
    </svg>`;

  const body = host.querySelector('.tara-body');
  const eyes = host.querySelectorAll('.tara-eye');
  const mouth = host.querySelector('.tara-mouth');
  const brows = host.querySelectorAll('.tara-brow');
  const q = host.querySelector('.tara-q');
  const sparks = host.querySelectorAll('.tara-sparks path');
  const text = host.querySelector('[data-tara-text]');
  const bubble = host.querySelector('.tara-bubble');
  let mood = 'idle', moodTween;

  // idle life: a gentle bob and the odd blink
  const bob = REDUCED ? null : gsap.to(body, { y: -6, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  const blink = () => {
    if (!host.isConnected) return;
    gsap.to(eyes, { scaleY: 0.1, transformOrigin: 'center', duration: 0.08, yoyo: true, repeat: 1 });
    blinkTimer = setTimeout(blink, 2200 + Math.random() * 3000);
  };
  let blinkTimer = REDUCED ? null : setTimeout(blink, 1800);

  function set(next, line) {
    if (line) {
      text.textContent = line;
      if (!REDUCED) gsap.fromTo(bubble, { y: 6, scale: 0.96 }, { y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)' });
    }
    if (next === mood && next !== 'cheer') return;
    mood = next;
    host.dataset.mood = next;
    mouth.setAttribute('d', MOUTHS[next] || MOUTHS.idle);
    moodTween?.kill();
    gsap.set(body, { rotation: 0 });
    gsap.to(brows, { opacity: next === 'puzzled' || next === 'think' ? 1 : 0, duration: 0.2 });
    gsap.to(q, { opacity: next === 'puzzled' ? 1 : 0, scale: next === 'puzzled' ? 1 : 0.4, transformOrigin: 'center', duration: 0.3 });
    if (REDUCED) return;
    if (next === 'puzzled') {
      gsap.to(brows[1], { y: -4, duration: 0.25 });
      moodTween = gsap.to(body, { rotation: -12, duration: 0.5, ease: 'back.out(2)', transformOrigin: '50% 60%' });
    } else gsap.to(brows[1], { y: 0, duration: 0.25 });
    if (next === 'happy') {
      moodTween = gsap.fromTo(body, { scale: 1 }, { scale: 1.1, duration: 0.18, yoyo: true, repeat: 1, transformOrigin: 'center' });
      gsap.fromTo(sparks, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, transformOrigin: 'center', duration: 0.35, stagger: 0.05, yoyo: true, repeat: 1 });
    }
    if (next === 'cheer') {
      moodTween = gsap.timeline()
        .to(body, { y: -28, rotation: 360, duration: 0.6, ease: 'power2.out', transformOrigin: 'center' })
        .to(body, { y: 0, duration: 0.45, ease: 'bounce.out' })
        .set(body, { rotation: 0 });
      gsap.fromTo(sparks, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.4, transformOrigin: 'center', duration: 0.5, stagger: 0.06, yoyo: true, repeat: 3 });
      confetti(host);
    }
  }

  return {
    say: (line, m = 'idle') => set(m, line),
    mood: (m) => set(m),
    destroy() { clearTimeout(blinkTimer); bob?.kill(); moodTween?.kill(); },
  };
}

// a little burst of yellow star confetti
function confetti(host) {
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    s.className = 'tara-confetti';
    s.textContent = '★';
    host.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 90;
    gsap.fromTo(s, { x: 0, y: 0, opacity: 1, scale: 0.6, rotation: 0 },
      { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, opacity: 0, scale: 1 + Math.random(), rotation: Math.random() * 360, duration: 1 + Math.random() * 0.6, ease: 'power2.out', onComplete: () => s.remove() });
    setTimeout(() => s.remove(), 2200);
  }
}
