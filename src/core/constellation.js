/* A programme's constellation drawn as SVG: lines for edges, a star per subject.
   Used for lighter devices, the phone row on Programmes, and the fee calculator,
   where each ticked subject lights its star. */

export function constellationSVG(p, { cls = '', labels = false } = {}) {
  const pts = p.shape.map(([x, y]) => [50 + x * 38, 50 - y * 38]);
  const lines = p.edges.map(([a, b], i) =>
    `<line class="c-edge" data-edge="${i}" data-a="${a}" data-b="${b}" x1="${pts[a][0].toFixed(1)}" y1="${pts[a][1].toFixed(1)}" x2="${pts[b][0].toFixed(1)}" y2="${pts[b][1].toFixed(1)}"/>`).join('');
  const stars = pts.map(([x, y], i) =>
    `<g class="c-star" data-star="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="c-halo" r="5.5"/><circle class="c-core" r="2.1"/>${labels ? `<text y="-7">${p.subjects[i][0]}</text>` : ''}</g>`).join('');
  return `<svg class="constellation ${cls}" viewBox="0 0 100 100" aria-hidden="true">${lines}${stars}</svg>`;
}

// light the stars for the chosen subject indexes; an edge glows when both its ends are lit
export function lightStars(svg, lit) {
  const set = new Set(lit);
  svg.querySelectorAll('.c-star').forEach((s) => s.classList.toggle('is-lit', set.has(Number(s.dataset.star))));
  svg.querySelectorAll('.c-edge').forEach((e) => e.classList.toggle('is-lit', set.has(Number(e.dataset.a)) && set.has(Number(e.dataset.b))));
}
