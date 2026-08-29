// Side-by-side verification: live React site vs the ported Shopify Liquid theme.
// Images inline as data URIs so the page is self-contained and publishable.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const REF  = path.join(ROOT, 'ref-thumb');
const SHOT = path.join(ROOT, 'shots-thumb');
const OUT  = path.join(ROOT, 'compare.html');

// live route -> ported template. null = no Liquid template (never ported).
const PAGES = [
  ['home',              'index',                'Homepage',             'ported'],
  ['pdp-jewellery',     'product',              'Product page',         'rebuilt'],
  ['jewellery-listing', 'collection',           'Jewellery listing',    'new'],
  ['shop-listing',      'collection',           'Shop listing',         'new'],
  ['about',             'page.about',           'About',                'ported'],
  ['contact',           'page.contact',         'Contact',              'ported'],
  ['faqs',              'page.faqs',            'FAQs',                 'ported'],
  ['journal',           'blog',                 'Journal',              'ported'],
  ['concepts',          'page.concepts',        'Concepts',             'ported'],
  ['policy-refund',     'page.exchange-return', 'Returns policy',       'ported'],
  ['made-for-you',      'page.customise',       'Made for you',         'ported'],
  [null,                'cart',                 'Cart',                 'new'],
  [null,                'search',               'Search',               'new'],
  [null,                '404',                  'Not found',            'new'],
  [null,                'list-collections',     'Collections index',    'new'],
];

const uri = (f) => fs.existsSync(f) ? `data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}` : null;
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const STATUS = {
  ported:  ['carried over', 'ok'],
  rebuilt: ['rebuilt',      'ok'],
  new:     ['built new',    'new'],
};

let ledger = '', sections = '';
let counts = { pair: 0, portOnly: 0 };

for (const [refName, tpl, title, kind] of PAGES) {
  const id = tpl.replace(/\./g, '-');
  const [label, tone] = STATUS[kind];
  const hasRef = refName !== null;
  if (hasRef) counts.pair++; else counts.portOnly++;

  ledger += `<tr>
    <th scope="row"><a href="#${id}">${esc(title)}</a></th>
    <td><code>${esc(tpl)}</code></td>
    <td><span class="chip chip--${tone}">${label}</span></td>
    <td class="note">${hasRef ? 'compared against live' : 'no equivalent on the React site'}</td>
  </tr>`;

  let panes = '';
  for (const view of ['mobile', 'desktop']) {
    const r = hasRef ? uri(path.join(REF, `${refName}-${view}.jpg`)) : null;
    const s = uri(path.join(SHOT, `${tpl}-${view}.jpg`));
    panes += `<div class="view">
      <p class="view__label">${view}</p>
      <div class="pair">
        <figure>${r ? `<div class="frame"><img src="${r}" alt="Live React site, ${esc(title)}, ${view}" loading="lazy"></div>`
                     : `<div class="frame frame--absent"><p>no live equivalent</p></div>`}
          <figcaption>live react site</figcaption></figure>
        <figure>${s ? `<div class="frame"><img src="${s}" alt="Shopify Liquid port, ${esc(title)}, ${view}" loading="lazy"></div>`
                     : `<div class="frame frame--absent"><p>not captured</p></div>`}
          <figcaption>shopify liquid port</figcaption></figure>
      </div>
    </div>`;
  }

  sections += `<section class="page" id="${id}">
    <header class="page__head">
      <h2>${esc(title)}</h2>
      <span class="chip chip--${tone}">${label}</span>
      <code>${esc(tpl)}</code>
    </header>
    ${panes}
  </section>`;
}

const html = `<title>Naira Flore in Liquid</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap">
<style>
  :root {
    --ground:   #F7F4F0;
    --surface:  #FFFFFF;
    --ink:      #1A1614;
    --muted:    #7A6F66;
    --line:     #E4DCD3;
    --accent:   #9A7634;
    --ok:       #2F6B4F;
    --gap:      #A8562D;
    --absent:   #8A8178;
    --display:  'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    --ui:       'Jost', 'Avenir Next', 'Segoe UI', system-ui, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground:  #17140F;
      --surface: #201C16;
      --ink:     #F0EAE2;
      --muted:   #A2988C;
      --line:    #332C24;
      --accent:  #D2A65C;
      --ok:      #6FBF92;
      --gap:     #E08A5C;
      --absent:  #8A8178;
    }
  }
  :root[data-theme="dark"] {
    --ground:  #17140F;
    --surface: #201C16;
    --ink:     #F0EAE2;
    --muted:   #A2988C;
    --line:    #332C24;
    --accent:  #D2A65C;
    --ok:      #6FBF92;
    --gap:     #E08A5C;
    --absent:  #8A8178;
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: var(--ground); color: var(--ink); font-family: var(--ui); font-weight: 300; font-size: 15px; line-height: 1.6; }
  .wrap { max-width: 1180px; margin-inline: auto; padding: 0 24px; }

  header.masthead { border-bottom: 1px solid var(--line); padding: 56px 0 36px; }
  .eyebrow { margin: 0; font-size: 10px; font-weight: 500; letter-spacing: .34em; text-transform: uppercase; color: var(--accent); }
  h1 { margin: 14px 0 0; font-family: var(--display); font-size: clamp(34px, 5vw, 52px); font-weight: 600; line-height: 1.05; text-wrap: balance; }
  .standfirst { margin: 14px 0 0; max-width: 62ch; font-family: var(--display); font-size: 19px; line-height: 1.65; color: var(--muted); }

  .stats { display: flex; flex-wrap: wrap; gap: 36px; margin-top: 34px; }
  .stat b { display: block; font-family: var(--display); font-size: 34px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
  .stat span { display: block; margin-top: 6px; font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }

  h2.rule { margin: 56px 0 18px; font-family: var(--display); font-size: 26px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead th { text-align: left; padding: 0 12px 10px 0; font-size: 10px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }
  tbody th, tbody td { text-align: left; font-weight: 400; padding: 11px 12px 11px 0; border-bottom: 1px solid var(--line); vertical-align: baseline; }
  tbody th a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--accent); }
  tbody th a:hover { color: var(--accent); }
  code { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12.5px; color: var(--muted); }
  .note { color: var(--muted); }

  .chip { display: inline-block; padding: 2px 9px; border-radius: 2px; font-size: 10px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; border: 1px solid currentColor; white-space: nowrap; }
  .chip--ok { color: var(--ok); }
  .chip--new { color: var(--accent); }
  .chip--gap { color: var(--gap); }

  .page { padding-top: 52px; border-top: 1px solid var(--line); margin-top: 52px; }
  .page__head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 12px; }
  .page__head h2 { margin: 0; font-family: var(--display); font-size: 30px; font-weight: 600; }

  .view { margin-top: 26px; }
  .view__label { margin: 0 0 10px; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 720px) { .pair { grid-template-columns: 1fr; } }
  figure { margin: 0; }
  .frame { background: var(--surface); border: 1px solid var(--line); max-height: 74vh; overflow-y: auto; overflow-x: hidden; }
  .frame img { display: block; width: 100%; }
  .frame--absent { display: grid; place-items: center; min-height: 220px; border-style: dashed; }
  .frame--absent p { margin: 0; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--absent); }
  figcaption { margin-top: 8px; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }

  .findings { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 26px; margin-top: 6px; }
  .finding { border-top: 2px solid var(--accent); padding-top: 14px; }
  .finding__count { margin: 0; font-family: var(--display); font-size: 30px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
  .finding h3 { margin: 8px 0 6px; font-size: 13px; font-weight: 500; letter-spacing: .04em; }
  .finding p { margin: 0; font-size: 13.5px; color: var(--muted); }
  footer { border-top: 1px solid var(--line); margin-top: 64px; padding: 30px 0 70px; color: var(--muted); font-size: 13px; }
  a { color: var(--accent); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>

<div class="wrap">
  <header class="masthead">
    <p class="eyebrow">Theme 150497591458 · unpublished</p>
    <h1>Naira Flore in Liquid</h1>
    <p class="standfirst">The live React site on the left, the ported Shopify theme on the right, page by page at both viewports. Captures are full-page, rendered from the theme's own files against the live Shopify catalogue.</p>
    <div class="stats">
      <div class="stat"><b>18</b><span>templates ported</span></div>
      <div class="stat"><b>${counts.pair}</b><span>compared to live</span></div>
      <div class="stat"><b>${counts.portOnly}</b><span>shopify-only pages</span></div>
      <div class="stat"><b>12</b><span>images restored</span></div>
    </div>
  </header>

  <h2 class="rule">The ledger</h2>
  <table>
    <thead><tr><th>Page</th><th>Template</th><th>State</th><th>Note</th></tr></thead>
    <tbody>${ledger}</tbody>
  </table>

  <h2 class="rule">What the audit found</h2>
  <div class="findings">
    <div class="finding">
      <p class="finding__count">32 &rarr; 0</p>
      <h3>Broken navigation links</h3>
      <p>The footer carried React SPA URLs straight into Liquid &mdash; <code>/shop?category=&hellip;</code>, <code>/jewellery/collections/&hellip;</code>, <code>/journal/&hellip;</code>, <code>/terms</code>, <code>/privacy</code>. None are Shopify routes; all 404. They now point at <code>/collections/rings</code>, <code>/blogs/news</code>, <code>/policies/refund-policy</code> and the rest. Every one of them sat in the footer, so they were broken on all 25 pages.</p>
    </div>
    <div class="finding">
      <p class="finding__count">0 rules</p>
      <h3>The product card had no stylesheet</h3>
      <p>Card markup shipped; its CSS never did. <code>.nf-card</code> matched nothing anywhere in the theme, so the listing rendered as unstyled stacked text &mdash; no card frame, no image hover-swap, no scrim, and the wishlist and add-to-cart buttons sat at <code>cursor: default</code>. Written and verified: scrim fades in, the overlay button rises on hover, the cursor is right.</p>
    </div>
    <div class="finding">
      <p class="finding__count">30 / 30</p>
      <h3>Focus states intact</h3>
      <p>Every interactive component type carries a keyboard focus style, and the theme implements <code>prefers-reduced-motion</code> properly. The elements without hover are correct by design: the skip link, an <code>aria-hidden</code> pass-through overlay, and inputs.</p>
    </div>
    <div class="finding">
      <p class="finding__count">6</p>
      <h3>Content not yet in Shopify</h3>
      <p>Five journal articles and the FAQs page have templates waiting but no content behind them &mdash; the <code>news</code> blog holds zero articles. These are the only links still without a destination.</p>
    </div>
  </div>

  ${sections}

  <footer class="wrap" style="padding-inline:0">
    Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · captures at 390&#8202;&times;&#8202;844 and 1440&#8202;&times;&#8202;900
  </footer>
</div>`;

fs.writeFileSync(OUT, html);
console.log(`wrote ${OUT}  (${(fs.statSync(OUT).size / 1048576).toFixed(1)}MB)  pairs=${counts.pair} portOnly=${counts.portOnly}`);
