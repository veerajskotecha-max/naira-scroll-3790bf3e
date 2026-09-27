/*
  Catalogue ads — and Shopify's own feeds — link to /products/<handle>. The
  pages live at /jewellery/<handle> (jewellery) and /product/<handle>
  (clothing), so /products/<handle> had no file: the host answered with the
  homepage and the phone rebuilt the product in the browser. The prerender
  gives each product page a twin at the ad's address (scripts/prerender.ts);
  these helpers decide which pages get one and what goes in it.
*/

export type ProductAlias = { alias: string; canonical: string };

/** The /products/ twin of a pre-built product page, or null for any other page. */
export const productAliasFor = (routePath: string): ProductAlias | null => {
  const m = routePath.match(/^\/(jewellery|product)\/([a-z0-9][a-z0-9-]*)\/?$/);
  if (!m || (m[1] === "jewellery" && m[2] === "collections")) return null;
  return { alias: `/products/${m[2]}`, canonical: `/${m[1]}/${m[2]}` };
};

/**
 * The twin's HTML: the page itself, plus a first script that moves the address
 * bar to the real page — keeping the ad's ?fbclid=/utm_* — before the pixel,
 * Clarity or the app read the URL. replaceState, not a redirect: nothing is
 * downloaded twice, and Back still returns to the ad.
 */
export const withAliasRedirect = (html: string, canonical: string): string => {
  const script =
    `<script>try{history.replaceState(null,"",${JSON.stringify(canonical)}` +
    `+location.search+location.hash)}catch(e){}</script>`;
  const charset = html.match(/<meta charset="?[\w-]+"?\s*\/?>/i);
  if (charset?.index !== undefined) {
    const at = charset.index + charset[0].length;
    return html.slice(0, at) + script + html.slice(at);
  }
  return html.replace(/<head(\s[^>]*)?>/i, (head) => head + script);
};
