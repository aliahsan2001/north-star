/* 404: Tara looks puzzled, then points the way home. */

import { createTara } from '../core/tara.js';

export async function mount(root) {
  const tara = createTara(root.querySelector('[data-lost-tara]'));
  tara.say('Hmm, I can\'t find this one anywhere…', 'puzzled');
  const t = setTimeout(() => tara.say('Try the North Star. It always leads home!', 'happy'), 3200);
  return () => { clearTimeout(t); tara.destroy(); };
}
