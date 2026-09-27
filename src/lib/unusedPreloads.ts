/*
  index.html preloads the homepage hero's paper wash (46 KB) at high priority,
  and every page is pre-built from it — so a product page fetched that image
  ahead of its own product photo, and never showed it. For a captured page,
  keep an image preload only if the page itself uses the image.
*/
export const dropUnusedImagePreloads = (html: string): string => {
  const body = html.indexOf("<body");
  if (body === -1) return html;
  return html.replace(/<link\b[^>]*\brel="preload"[^>]*>/gi, (tag) => {
    if (!/\bas="image"/i.test(tag)) return tag;
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1];
    return href && html.indexOf(href, body) === -1 ? "" : tag;
  });
};
