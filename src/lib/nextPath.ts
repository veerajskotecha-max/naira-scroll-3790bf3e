/*
  Where a member lands after signing in: ?next= names a page on this site
  (the consent flow sends members to /auth with it). It used to pass a regex
  that only refused "//host", so "/\host" and "/<tab>/host" got through; the
  browser reads both as another site, and the replace-navigation threw a
  SecurityError that put a signed-in member on the "This page didn't load"
  panel. Resolving it against our own origin is the check the browser makes.
*/
export const safeNextPath = (raw: string, origin = window.location.origin): string => {
  if (!raw.startsWith("/")) return "/account";
  try {
    const url = new URL(raw, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : "/account";
  } catch {
    return "/account";
  }
};
