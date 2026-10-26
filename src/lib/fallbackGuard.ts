/*
  dist/index.html is two things: the homepage, and what the host sends for any
  address that has no pre-built file of its own. That is every piece listed in
  Shopify after the last Publish, until the next one. Their links opened on the
  homepage (0.9 s of it on 4G, measured 26 Oct 2026) before the app took over
  and drew the product, so an ad for a new piece showed the wrong page first.

  The guard is a first script and style in that file (added by
  scripts/prerender.ts). On any address but the homepage it marks <html>; the
  style then hides the homepage and paints the ivory page, and for a product
  address the outline of a product page, until the app's first render takes the
  mark off (App.tsx). It also takes itself off after 10 s, after the app's own
  8 s start-up limit, so a page whose code never arrives still shows something.
*/

export const FALLBACK_ATTR = "data-nf-fallback";

/* Product addresses: /jewellery/<handle> and its aliases, not the listings. */
const PIECE_PATH = "^/(?:jewellery|jewelry|products?|preview/jewellery)/(?!collections$)[^/]+$";

const SCRIPT =
  "<script>(function(){try{" +
  'var p=location.pathname.replace(/\\/+$/,"")||"/";' +
  'if(p==="/"||p==="/index"||p==="/index.html")return;' +
  "var d=document.documentElement;" +
  `d.setAttribute("${FALLBACK_ATTR}",new RegExp(${JSON.stringify(PIECE_PATH)}).test(p)?"piece":"page");` +
  `setTimeout(function(){d.removeAttribute("${FALLBACK_ATTR}")},10000)` +
  "}catch(e){}})()</script>";

/* The product page's own skeleton (JewelDetailSkeleton): a square photo under
   the 107 px header, then the name, price, a line and the button; on a wide
   screen the photo and the text side by side. Blocks are --nf-surface-raised
   on the ivory ground. */
const BLOCK = "linear-gradient(#F4EBE2,#F4EBE2)";
const STYLE =
  "<style>" +
  `html[${FALLBACK_ATTR}],html[${FALLBACK_ATTR}] body{background:#FBF3EC}` +
  `html[${FALLBACK_ATTR}] #root{visibility:hidden}` +
  `html[${FALLBACK_ATTR}="piece"] body::before{content:"";position:fixed;inset:0;z-index:2147483647;pointer-events:none;background:` +
  `${BLOCK} 0 107px/100vw 100vw no-repeat,` +
  `${BLOCK} 16px calc(107px + 100vw + 24px)/calc((100vw - 32px)*.8) 32px no-repeat,` +
  `${BLOCK} 16px calc(107px + 100vw + 72px)/calc((100vw - 32px)/3) 24px no-repeat,` +
  `${BLOCK} 16px calc(107px + 100vw + 108px)/calc((100vw - 32px)*.6) 12px no-repeat,` +
  `${BLOCK} 16px calc(107px + 100vw + 152px)/calc(100vw - 32px) 48px no-repeat,#FBF3EC}` +
  "@media (min-width:1024px){" +
  `html[${FALLBACK_ATTR}="piece"] body::before{` +
  "--x:max(24px,calc((100vw - 1400px)/2 + 24px));--w:calc((min(100vw,1400px) - 48px)/2);background:" +
  `${BLOCK} var(--x) 126px/var(--w) var(--w) no-repeat,` +
  `${BLOCK} calc(var(--x) + var(--w) + 40px) 126px/calc(var(--w)*.8 - 64px) 32px no-repeat,` +
  `${BLOCK} calc(var(--x) + var(--w) + 40px) 174px/calc(var(--w)/3) 24px no-repeat,` +
  `${BLOCK} calc(var(--x) + var(--w) + 40px) 210px/calc(var(--w)*.6) 12px no-repeat,` +
  `${BLOCK} calc(var(--x) + var(--w) + 40px) 254px/calc(var(--w) - 80px) 48px no-repeat,#FBF3EC}}` +
  "</style>";

/** The homepage file's HTML with the guard first in <head>, so it runs before anything paints. */
export const withFallbackGuard = (html: string): string => {
  if (html.includes(`${FALLBACK_ATTR}"`)) return html;
  const guard = SCRIPT + STYLE;
  const charset = html.match(/<meta charset="?[\w-]+"?\s*\/?>/i);
  if (charset?.index !== undefined) {
    const at = charset.index + charset[0].length;
    return html.slice(0, at) + guard + html.slice(at);
  }
  return html.replace(/<head(\s[^>]*)?>/i, (head) => head + guard);
};

/** The app's first render is on screen: show it. */
export const clearFallbackMark = () => document.documentElement.removeAttribute(FALLBACK_ATTR);
