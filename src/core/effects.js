/* Headings assemble letter by letter: each letter flies in from a scattered spot,
   like stars snapping into a constellation. [data-letters] on any heading. */

import SplitType from 'split-type';
import { gsap, ScrollTrigger } from './motion.js';
import { REDUCED } from './env.js';

export function letterHeadings(root) {
  root.querySelectorAll('[data-letters]').forEach((el) => {
    if (REDUCED) return;
    const split = new SplitType(el, { types: 'words, chars' });
    gsap.set(split.chars, { opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const tl = gsap.fromTo(split.chars,
          { opacity: 0, x: () => gsap.utils.random(-60, 60), y: () => gsap.utils.random(-50, 50), rotation: () => gsap.utils.random(-40, 40), scale: 0.4 },
          { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)', stagger: { each: 0.025, from: 'random' } });
        setTimeout(() => tl.progress(1), 2500); // never leave a heading half-built
      },
    });
  });
}
