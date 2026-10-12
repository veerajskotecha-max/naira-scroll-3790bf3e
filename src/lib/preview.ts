/*
  The product-page redesign is reviewed at /preview/jewellery/<handle> before it
  replaces the live page. Nothing on the site links there and it is kept out of
  search; the live product page and bag stay as they are until it is approved.
*/
export const PREVIEW_PREFIX = "/preview";

export const isPreviewPath = (pathname: string) =>
  pathname === PREVIEW_PREFIX || pathname.startsWith(`${PREVIEW_PREFIX}/`);

/** The preview's own product link, so browsing between pieces stays in the preview. */
export const previewProductPath = (handle: string) => `${PREVIEW_PREFIX}/jewellery/${handle}`;
