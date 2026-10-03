import fs from 'fs';
const t=fs.readFileSync('tpl.html','utf8');
const out=t.replace('__DATA__',()=>fs.readFileSync('data.js','utf8')).replace('__GEO__',()=>(()=>{const g=JSON.parse(fs.readFileSync('geo.json','utf8'));delete g.world;return JSON.stringify(g)})());
fs.writeFileSync('feeder-map.html',out);console.log(out.length);
