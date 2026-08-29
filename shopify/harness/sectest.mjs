import fs from 'node:fs'; import path from 'node:path';
import { buildEngine, cssBucket } from './shopify.mjs';
import { loadCatalogue, routes } from './data.mjs';
import { schemaDefaults, presetBlocks } from './render.mjs';
const THEME = path.join(process.cwd(), '..', 'theme');
const cat = await loadCatalogue();
const engine = buildEngine(THEME);
const base = { shop: cat.shop, routes, settings: {}, cart:{item_count:0,items:[],total_price:0}, customer:null,
  collections: Object.fromEntries(cat.collections.map(c=>[c.handle,c])),
  all_products: Object.fromEntries(cat.products.map(p=>[p.handle,p])),
  product: cat.products.find(p=>p.available) || cat.products[0],
  collection: cat.collections.at(-1) };
for (const f of fs.readdirSync(path.join(THEME,'sections'))) {
  const name = f.replace(/\.liquid$/,''); cssBucket.length = 0;
  try {
    const html = await engine.renderFile(path.join(THEME,'sections',f), { ...base, section:{ id:name, settings:schemaDefaults(name), blocks:presetBlocks(name), index:1 } });
    const text = html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    console.log(`ok   ${name.padEnd(28)} html=${String(html.length).padStart(6)}b css=${String(cssBucket.join('').length).padStart(5)}b text="${text.slice(0,60)}"`);
  } catch(e) { console.log(`FAIL ${name.padEnd(28)} ${String(e.message).split('\n')[0].slice(0,110)}`); }
}
