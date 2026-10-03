// Offline geometry build: projects coastlines/borders once, stores the
// projection parameters so the page can project any new pin at runtime.
import fs from 'fs';
import * as topo from 'topojson-client';
import * as d3 from 'd3-geo';
const NM = '../node_modules/';
const W = f => JSON.parse(fs.readFileSync(NM + f));
const w10 = W('world-atlas/countries-10m.json'), w50 = W('world-atlas/countries-50m.json'), l110 = W('world-atlas/land-110m.json'), st = W('us-atlas/states-10m.json');
const c10 = topo.feature(w10, w10.objects.countries), c50 = topo.feature(w50, w50.objects.countries);
const b50 = topo.mesh(w50, w50.objects.countries, (a, b) => a !== b), b10 = topo.mesh(w10, w10.objects.countries, (a, b) => a !== b);
const land110 = topo.feature(l110, l110.objects.land);
const states = topo.feature(st, st.objects.states), smesh = topo.mesh(st, st.objects.states, (a, b) => a !== b);
const box = ([a, b, c, d]) => ({ type: 'MultiPoint', coordinates: [[a, b], [c, b], [c, d], [a, d], [(a + c) / 2, b], [(a + c) / 2, d]] });
const R = {
  world: { w: 380, h: 200, type: 'geoEqualEarth', mk: () => d3.geoEqualEarth(), bb: [-126, -42, 178, 60], land: land110, pad: 6 },
  uk: { w: 380, h: 300, type: 'geoMercator', mk: () => d3.geoMercator(), bb: [-2.75, 50.75, 0.35, 53.5], land: c10, mesh: b10, pad: 12 },
  eu: { w: 380, h: 300, type: 'geoConicConformal', parallels: [43, 50], rotate: [-6, 0], mk: () => d3.geoConicConformal().parallels([43, 50]).rotate([-6, 0]), bb: [-1, 43, 13, 53.4], land: c50, mesh: b50, pad: 12 },
  us: { w: 380, h: 250, type: 'geoAlbers', mk: () => d3.geoAlbers(), bb: [-125, 24.5, -66.5, 49.5], land: c50, mesh: b50, states: true, pad: 8 },
  cr: { w: 380, h: 300, type: 'geoMercator', mk: () => d3.geoMercator(), bb: [-86.2, 8.0, -82.5, 11.3], land: c10, mesh: b10, pad: 12 }
};
const out = {};
for (const [id, r] of Object.entries(R)) {
  const p = r.mk();
  if (id === 'us') {
    const l48 = { type: 'FeatureCollection', features: states.features.filter(f => !['02', '15', '72', '60', '66', '69', '78'].includes(f.id)) };
    p.fitExtent([[r.pad, r.pad], [r.w - r.pad, r.h - r.pad]], l48);
  } else p.fitExtent([[r.pad, r.pad], [r.w - r.pad, r.h - r.pad]], box(r.bb));
  const proj = { type: r.type, scale: +p.scale().toFixed(4), translate: p.translate().map(v => +v.toFixed(4)) };
  if (r.parallels) proj.parallels = r.parallels;
  if (r.rotate) proj.rotate = r.rotate;
  p.clipExtent([[0, 0], [r.w, r.h]]);
  const path = d3.geoPath(p).digits(1);
  const o = { w: r.w, h: r.h, bb: r.bb, proj, land: path(r.land) || '' };
  if (r.mesh) o.mesh = path(r.mesh) || '';
  if (r.states) o.st = path(smesh);
  out[id] = o;
}
fs.writeFileSync('geo.json', JSON.stringify(out));
console.log(fs.statSync('geo.json').size, Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [v.land.length, (v.mesh || '').length, (v.st || '').length]])));
