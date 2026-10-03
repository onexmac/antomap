# Antomap (Feeder Map)

Which universities feed Formula 1 teams, launch companies and aerospace primes. One static file: `index.html`.

- Edit companies and schools in `scripts/data.js` (pins are projected at runtime from longitude/latitude).
- Rebuild coastlines: `npm i world-atlas us-atlas topojson-client d3-geo && node scripts/gen.mjs`, then `node scripts/build.mjs` and wrap the output in an HTML skeleton.
- Deploy: import this repo on Vercel. No build command, output directory `.`.
