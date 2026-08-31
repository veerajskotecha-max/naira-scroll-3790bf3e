// Shopify Liquid shims for liquidjs — enough to render a theme for VISUAL diffing.
// Scope: markup + CSS fidelity. Not a Shopify emulator; no cart/checkout behaviour.
import { Liquid } from 'liquidjs';
import path from 'node:path';
import nodeFs from 'node:fs';

// Partials this theme references but we never pulled (Sense base snippets like
// 'meta-tags'). They are invisible boilerplate, so for VISUAL diffing we render
// a marker comment instead of throwing and losing the whole page. Every miss is
// recorded so the gap is reported, not silently swallowed.
export const missingPartials = new Set();
const STUB = '\u0000stub';

const tolerantFs = {
  sep: '/',
  dirname: (p) => path.dirname(p),
  resolve: (dir, file, ext) => (dir === STUB ? STUB + '/' + file : path.resolve(dir, file.endsWith(ext) ? file : file + ext)),
  existsSync: (p) => (p.startsWith(STUB) ? true : nodeFs.existsSync(p)),
  exists: async (p) => (p.startsWith(STUB) ? true : nodeFs.existsSync(p)),
  readFileSync: (p) => { if (p.startsWith(STUB)) { missingPartials.add(path.basename(p)); return `<!-- missing partial: ${path.basename(p)} -->`; } return nodeFs.readFileSync(p, 'utf8'); },
  readFile: async (p) => { if (p.startsWith(STUB)) { missingPartials.add(path.basename(p)); return `<!-- missing partial: ${path.basename(p)} -->`; } return nodeFs.promises.readFile(p, 'utf8'); },
  contains: () => true,
};

export const cssBucket = [];   // {% stylesheet %} blocks, injected into <head>
export const jsBucket  = [];   // {% javascript %} blocks, mostly ignored

const money = (cents) => {
  const n = Number(cents ?? 0) / 100;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
};

// Shopify serves theme assets from /assets/<file>; our static server mirrors that.
const assetUrl = (f) => `/assets/${String(f ?? '').replace(/^.*\//, '')}`;

const imageUrl = (src, opts = {}) => {
  if (!src) return '';
  const url = typeof src === 'string' ? src : (src.src || src.url || '');
  if (!url) return '';
  // Shopify appends ?width=; real CDN URLs already work, local placeholders ignore it.
  const w = opts.width ? `${url.includes('?') ? '&' : '?'}width=${opts.width}` : '';
  return url + w;
};

const attr = (o) => Object.entries(o)
  .filter(([, v]) => v !== undefined && v !== null && v !== '')
  .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`).join('');

// Shopify's `date` filter is Ruby strftime. It was a no-op here, so every
// `{{ article.published_at | date: '%-d %B %Y' }}` rendered the raw ISO string
// and the journal meta line could never match React. Only the directives this
// theme uses are implemented; anything else passes through untouched. UTC
// throughout -- published_at is stored at UTC midnight, and reading it in a
// local zone behind UTC would roll the day back one.
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const pad2 = (n) => String(n).padStart(2, '0');
const strftime = (v, fmt) => {
  if (v === null || v === undefined || v === '') return '';
  const d = v instanceof Date ? v : new Date(v === 'now' || v === 'today' ? Date.now() : v);
  if (Number.isNaN(d.getTime())) return String(v);
  const map = {
    '%Y': d.getUTCFullYear(), '%y': pad2(d.getUTCFullYear() % 100),
    '%m': pad2(d.getUTCMonth() + 1), '%-m': d.getUTCMonth() + 1,
    '%d': pad2(d.getUTCDate()), '%-d': d.getUTCDate(), '%e': String(d.getUTCDate()).padStart(2, ' '),
    '%B': MONTHS[d.getUTCMonth()], '%b': MONTHS[d.getUTCMonth()].slice(0, 3),
    '%A': DAYS[d.getUTCDay()], '%a': DAYS[d.getUTCDay()].slice(0, 3),
    '%H': pad2(d.getUTCHours()), '%M': pad2(d.getUTCMinutes()), '%S': pad2(d.getUTCSeconds()),
    '%%': '%',
  };
  return String(fmt === undefined || fmt === null ? '%d/%m/%Y' : fmt)
    .replace(/%-?[A-Za-z%]/g, (t) => (t in map ? String(map[t]) : t));
};

export function buildEngine(themeRoot) {
  const engine = new Liquid({
    root: [path.join(themeRoot, 'snippets'), path.join(themeRoot, 'sections'), themeRoot, STUB],
    partials: [path.join(themeRoot, 'snippets'), path.join(themeRoot, 'sections'), STUB],
    fs: tolerantFs,
    extname: '.liquid',
    jekyllInclude: false,
    dynamicPartials: true,
    strictFilters: false,
    strictVariables: false,
    lenientIf: true,
  });

  // ---- filters ----
  const F = {
    money, money_with_currency: (c) => money(c) + ' INR', money_without_currency: (c) => (Number(c ?? 0) / 100).toFixed(2),
    asset_url: assetUrl, asset_img_url: assetUrl, file_url: assetUrl, file_img_url: assetUrl, shopify_asset_url: assetUrl,
    global_asset_url: assetUrl, image_url: (s, ...a) => imageUrl(s, kwargs(a)),
    img_url: (s, size) => imageUrl(s, { width: parseInt(size) || 800 }),
    stylesheet_tag: (u) => `<link rel="stylesheet" href="${u}">`,
    script_tag: (u) => `<script src="${u}" defer></script>`,
    handleize: (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    handle: (s) => F.handleize(s),
    t: (s) => String(s ?? '').split('.').pop().replace(/_/g, ' '),
    placeholder_svg_tag: (_, cls) => `<svg class="${cls || ''}" viewBox="0 0 525 525" style="background:#e8e2da"><rect width="525" height="525" fill="#e8e2da"/></svg>`,
    within: (u) => u, link_to: (t, u) => `<a href="${u}">${t}</a>`,
    weight_with_unit: (w) => `${w} g`, date: strftime, time_tag: (v, f) => strftime(v, f),
    payment_type_svg_tag: () => '', inline_asset_content: () => '',
    highlight: (s) => s, camelcase: (s) => s, structured_data: () => '',
    metafield_tag: (m) => String(m ?? ''), metafield_text: (m) => String(m ?? ''),
    // image_tag: Shopify's tag-returning filter used all over nf-product.liquid
    image_tag: (src, ...a) => {
      const o = kwargs(a);
      return `<img src="${imageUrl(src, { width: o.width || 1200 })}"${attr({
        alt: o.alt, class: o.class, loading: o.loading || 'lazy', sizes: o.sizes, width: o.width, height: o.height,
      })}>`;
    },
  };
  for (const [k, v] of Object.entries(F)) engine.registerFilter(k, v);

  // liquidjs lacks Shopify's keyword-arg filter calling convention; flatten trailing pairs.
  function kwargs(args) {
    const o = {};
    for (const a of args) {
      if (!a || typeof a !== 'object') continue;
      // liquidjs hands named filter arguments over as ['key', value] pairs, and
      // the Array check below used to skip exactly those -- so image_tag lost
      // every alt/class/sizes/widths it was given and ten sections rendered
      // classless images that could not be measured locally.
      if (Array.isArray(a)) { if (a.length === 2 && typeof a[0] === 'string') o[a[0]] = a[1]; continue; }
      Object.assign(o, a);
    }
    return o;
  }

  // ---- tags ----
  // {% schema %} — theme-editor config, never rendered.
  engine.registerTag('schema', { parse(tk, remain) { while (remain.length) { const t = remain.shift(); if (t.name === 'endschema') break; } }, render() { return ''; } });

  const blockTag = (end, sink) => ({
    parse(tk, remain) { this.tpls = []; while (remain.length) { const t = remain.shift(); if (t.name === end) break; this.tpls.push(t); } },
    * render(ctx, em) { const s = yield this.liquid.renderer.renderTemplates(this.liquid.parser.parseTokens(this.tpls), ctx); if (sink) sink.push(s); return ''; },
  });
  engine.registerTag('stylesheet', blockTag('endstylesheet', cssBucket));
  engine.registerTag('javascript', blockTag('endjavascript', jsBucket));

  // {% style %} renders inline, unlike {% stylesheet %}
  engine.registerTag('style', {
    parse(tk, remain) { this.tpls = []; while (remain.length) { const t = remain.shift(); if (t.name === 'endstyle') break; this.tpls.push(t); } },
    * render(ctx) { const s = yield this.liquid.renderer.renderTemplates(this.liquid.parser.parseTokens(this.tpls), ctx); return `<style>${s}</style>`; },
  });

  // {% form 'product', product, id: x, class: y %} -> a real <form>
  engine.registerTag('form', {
    parse(tk, remain) {
      this.args = tk.args; this.tpls = [];
      let depth = 1;
      while (remain.length) {
        const t = remain.shift();
        if (t.name === 'form') depth++;
        if (t.name === 'endform') { depth--; if (!depth) break; }
        this.tpls.push(t);
      }
    },
    * render(ctx) {
      const inner = yield this.liquid.renderer.renderTemplates(this.liquid.parser.parseTokens(this.tpls), ctx);
      const cls = /class:\s*'([^']*)'|class:\s*"([^"]*)"/.exec(this.args);
      const id = /id:\s*([A-Za-z0-9_.]+)|id:\s*'([^']*)'/.exec(this.args);
      return `<form method="post" action="/cart/add"${attr({ class: cls ? (cls[1] || cls[2]) : undefined, id: id ? (id[1] || id[2]) : undefined })}>${inner}</form>`;
    },
  });

  // {% paginate x by n %} — just render the body
  engine.registerTag('paginate', {
    parse(tk, remain) { this.tpls = []; while (remain.length) { const t = remain.shift(); if (t.name === 'endpaginate') break; this.tpls.push(t); } },
    * render(ctx) { return yield this.liquid.renderer.renderTemplates(this.liquid.parser.parseTokens(this.tpls), ctx); },
  });

  // {% section 'name' %} — render sections/<name>.liquid with its own section scope
  engine.registerTag('section', {
    parse(tk) { this.name = tk.args.trim().replace(/^['"]|['"]$/g, ''); },
    * render(ctx) {
      try {
        const tpl = yield this.liquid.parseFile(path.join(themeRoot, 'sections', this.name + '.liquid'));
        const scope = ctx.getAll();
        return yield this.liquid.renderer.renderTemplates(tpl, this.liquid.createContext({ ...scope, section: sectionScope(this.name, scope) }));
      } catch (e) { return `<!-- section ${this.name} failed: ${e.message} -->`; }
    },
  });

  return engine;
}

// Section settings default to their schema defaults; render.mjs overrides from templates/*.json
export function sectionScope(name, scope = {}) {
  return { id: name, settings: (scope.__sectionSettings && scope.__sectionSettings[name]) || {}, blocks: [], index: 1 };
}
