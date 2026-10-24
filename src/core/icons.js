/* Icon sprite, injected once outside the page container. */

const P = {
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  back: ['M15 6l-6 6 6 6'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  phone: ['M5 3h3.5l1.7 4.4-2.3 1.4a11 11 0 0 0 7.3 7.3l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'],
  wa: ['M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a5 5 0 0 1-2.9-2.9l1-1-1-2-1.6 1z'],
  pin: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16M8 3v4M16 3v4'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  cap: ['M2 9l10-5 10 5-10 5z', 'M6 11v5c3 2.5 9 2.5 12 0v-5', 'M22 9v6'],
  trophy: ['M8 4h8v6a4 4 0 0 1-8 0z', 'M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4', 'M12 14v4M8 21h8M9 18h6'],
  users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21a7 7 0 0 1 14 0', 'M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3'],
  ring: ['M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M12 4v2M12 18v2M4 12h2M18 12h2'],
  spiral: ['M12 12m-1 0a1 1 0 1 0 2 0 3 3 0 1 0-6 0 5 5 0 1 0 10 0 7 7 0 1 0-14 0'],
  mail: ['M3 5h18v14H3z', 'M3.5 6.5l8.5 6.5 8.5-6.5'],
  book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19V5M8 7h7'],
  spark: ['M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M15.5 8.5l-2 5-5 2 2-5z'],
};

export function injectIcons() {
  if (document.getElementById('i-star')) return;
  const symbols = Object.entries(P).map(([n, ds]) =>
    `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`);
}
