// Renders one Shopify template (templates/<name>.json) to a standalone HTML file.
// Section settings resolve as: template JSON overrides > {% schema %} defaults.
import fs from 'node:fs';
import path from 'node:path';
import { buildEngine, cssBucket } from './shopify.mjs';
import { loadArticles, loadCatalogue, routes } from './data.mjs';

const THEME = process.env.THEME_DIR || path.join(import.meta.dirname, '..', 'theme');
const OUT   = process.env.OUT_DIR   || path.join(import.meta.dirname, '..', 'rendered');

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;

// Real menus from the Admin API. The header reads linklists[settings.menu];
// empty stubs made the nav look fine locally while it rendered bare on Shopify.
const MENUS = JSON.parse((fs.existsSync(path.join(import.meta.dirname,'menus.json')) ? fs.readFileSync(path.join(import.meta.dirname,'menus.json'),'utf8') : '{}'));

// Pull the {% schema %} block out of a section.
export function schemaOf(sectionName) {
  const src = read(path.join(THEME, 'sections', sectionName + '.liquid'));
  if (!src) return null;
  const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

export function schemaDefaults(sectionName) {
  const s = schemaOf(sectionName);
  if (!s) return {};
  return Object.fromEntries((s.settings || [])
    .filter(x => x.id !== undefined && x.default !== undefined)
    .map(x => [x.id, x.default]));
}

// A section whose body loops section.blocks renders empty unless blocks exist.
// Shopify seeds them from the schema's first preset when a section is added;
// mirror that so preset-driven sections aren't silently blank.
export function presetBlocks(sectionName) {
  const s = schemaOf(sectionName);
  const preset = (s?.presets || [])[0];
  if (!preset?.blocks) return [];
  const defaults = Object.fromEntries((s.blocks || []).map(b => [b.type,
    Object.fromEntries((b.settings || []).filter(x => x.id !== undefined && x.default !== undefined).map(x => [x.id, x.default]))]));
  return preset.blocks.map((b, i) => ({
    id: `${b.type}-${i}`, type: b.type,
    settings: { ...(defaults[b.type] || {}), ...(b.settings || {}) },
  }));
}

function stripJsonComments(s) {
  // Shopify prefixes template JSON with an auto-generated banner, and this
  // theme's author added a second /* */ note under it on several templates.
  // Strip every leading comment block, not just the first.
  let out = s;
  while (/^\s*\/\*/.test(out)) out = out.replace(/^\s*\/\*[\s\S]*?\*\//, '');
  return out;
}

const BLOG = loadArticles();

export async function renderTemplate(name, ctxExtra = {}) {
  const cat = await loadCatalogue();
  const engine = buildEngine(THEME);
  cssBucket.length = 0;

  // {% sections 'header-group' %} — Online Store 2.0 section groups. Registered
  // here rather than in shopify.mjs because it needs schemaDefaults/presetBlocks.
  engine.registerTag('sections', {
    parse(tk) { this.group = tk.args.trim().replace(/^['"]|['"]$/g, ''); },
    * render(ctx) {
      const gp = path.join(THEME, 'sections', this.group + '.json');
      const rawG = read(gp);
      if (!rawG) return `<!-- MISSING GROUP: ${this.group} -->`;
      let g; try { g = JSON.parse(stripJsonComments(rawG)); } catch { return `<!-- BAD GROUP: ${this.group} -->`; }
      let acc = '';
      for (const k of (g.order || Object.keys(g.sections || {}))) {
        const sec = (g.sections || {})[k];
        if (!sec || sec.disabled) continue;
        const file = path.join(THEME, 'sections', sec.type + '.liquid');
        if (!fs.existsSync(file)) { acc += `<!-- MISSING SECTION: ${sec.type} -->`; continue; }
        const settings = { ...schemaDefaults(sec.type), ...(sec.settings || {}) };
        const blocks = (sec.blocks && (sec.block_order || Object.keys(sec.blocks)).map(b => ({ id: b, type: sec.blocks[b].type, settings: sec.blocks[b].settings || {} }))) || [];
        try {
          acc += yield this.liquid.renderFile(file, { ...ctx.getAll(), section: { id: k, settings, blocks, index: 1 } });
        } catch (e) { acc += `<!-- SECTION ERROR ${sec.type}: ${String(e.message).slice(0, 160)} -->`; }
      }
      return acc;
    },
  });

  const tplPath = path.join(THEME, 'templates', name + '.json');
  const raw = read(tplPath);
  if (!raw) throw new Error(`no template ${name}.json`);
  const tpl = JSON.parse(stripJsonComments(raw));

  const order = tpl.order || Object.keys(tpl.sections);
  const settingsData = (() => {
    try { return JSON.parse(stripJsonComments(read(path.join(THEME, 'config', 'settings_data.json')) || '{}')); } catch { return {}; }
  })();

  const base = {
    shop: cat.shop, routes, settings: settingsData.current || {},
    cart: { item_count: 0, items: [], total_price: 0 },
    customer: null, template: name, canonical_url: '/',
    linklists: MENUS,
    // Shopify's `collections` supports BOTH `{% for c in collections %}` and
    // `collections['handle']`. A plain object only served the second form, so
    // iteration yielded key/value pairs and every listing came out empty.
    // A JS array with handle keys attached satisfies both.
    collections: (() => {
      const arr = [...cat.collections];
      for (const c of cat.collections) arr[c.handle] = c;
      return arr;
    })(),
    all_products: Object.fromEntries(cat.products.map(p => [p.handle, p])),
    // `blogs` takes the same array-plus-handle-keys shape as `collections` so
    // both `{% for b in blogs %}` and `blogs['news']` resolve. On a blog
    // template Shopify also exposes the current blog as `blog`.
    blog: BLOG,
    blogs: (() => { const arr = [BLOG]; arr[BLOG.handle] = BLOG; return arr; })(),
    ...ctxExtra,
  };

  let body = '';
  for (const key of order) {
    const sec = tpl.sections[key];
    if (!sec || sec.disabled) continue;   // theme editor can disable a section in place
    const type = sec.type;
    const settings = { ...schemaDefaults(type), ...(sec.settings || {}) };
    const file = path.join(THEME, 'sections', type + '.liquid');
    if (!fs.existsSync(file)) { body += `<!-- MISSING SECTION: ${type} -->\n`; continue; }
    try {
      const out = await engine.renderFile(file, {
        ...base,
        section: { id: key, settings, blocks: (() => { const b = (sec.blocks && (sec.block_order || Object.keys(sec.blocks)).map(k => ({ id: k, type: sec.blocks[k].type, settings: sec.blocks[k].settings || {} }))) || []; return b; })(), index: 1 },
      });
      body += out;
    } catch (e) {
      body += `<!-- SECTION ERROR ${type}: ${String(e.message).slice(0, 200)} -->\n`;
      console.error(`  ! ${name}/${type}: ${String(e.message).split('\n')[0].slice(0, 140)}`);
    }
  }

  // Wrap in the theme layout so header/footer/fonts/CSS all apply.
  let html;
  const layout = read(path.join(THEME, 'layout', 'theme.liquid'));
  if (layout) {
    try {
      html = await engine.parseAndRender(layout, { ...base, content_for_layout: body, content_for_header: '' });
    } catch (e) {
      console.error(`  ! layout: ${String(e.message).split('\n')[0].slice(0, 140)}`);
      html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${body}</body></html>`;
    }
  } else {
    html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${body}</body></html>`;
  }

  // {% stylesheet %} blocks are collected during render; Shopify concatenates them into the theme CSS.
  if (cssBucket.length) {
    html = html.replace(/<\/head>/i, `<style>\n${cssBucket.join('\n')}\n</style>\n</head>`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const dest = path.join(OUT, name + '.html');
  fs.writeFileSync(dest, html);
  return { dest, bytes: Buffer.byteLength(html), sections: order.length, errors: (html.match(/SECTION ERROR|MISSING SECTION/g) || []).length };
}

if (process.argv[1] === import.meta.filename) {
  const names = process.argv.slice(2);
  const cat = await loadCatalogue();
  const list = names.length ? names : fs.readdirSync(path.join(THEME, 'templates')).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
  for (const n of list) {
    const extra = {};
    // PRODUCT_HANDLE pins the PDP fixture so it can be diffed against the same
    // product on the React side. Default picks a jewellery product, not just the
    // first available one -- the section branches on vendor, and an apparel
    // product renders the other layout entirely.
    if (n === 'product') {
      const want = process.env.PRODUCT_HANDLE;
      extra.product = (want && cat.products.find(p => p.handle === want))
        || cat.products.find(p => (p.vendor || '').toLowerCase() === 'naira petite' && p.available)
        || cat.products.find(p => p.available) || cat.products[0];
      if (want && extra.product.handle !== want) console.log(`  note: no product "${want}" in the catalogue, using ${extra.product.handle}`);
    }
    // The collection fixture stands in for React's /jewellery, so it must be a
    // collection that actually holds the Naira Petite line. Picking "the first
    // non-empty collection" silently became `frontpage` (apparel only) once the
    // catalogue refresh started bucketing products into real collections, and
    // the whole listing page rendered as the empty state.
    if (n === 'collection') extra.collection = cat.collections.find(c => c.products.some(p => (p.vendor || '').toLowerCase() === 'naira petite'))
      || cat.collections.find(c => c.products_count > 0) || cat.collections.at(-1);
    try {
      const r = await renderTemplate(n, extra);
      console.log(`${r.errors ? 'WARN' : ' ok '} ${n.padEnd(24)} ${String(r.bytes).padStart(7)}b  sections=${r.sections} issues=${r.errors}`);
    } catch (e) { console.log(`FAIL ${n.padEnd(24)} ${String(e.message).slice(0, 90)}`); }
  }
}
