/*
  The prerender saves the live DOM of a running app, and Vite's runtime helper
  adds <link rel="modulepreload" as="script"> to <head> for every chunk an
  import() reaches. Captured, those links make each visitor fetch — at high
  priority, before anything renders — code the page loads later on purpose:
  the reviews section, the reels, the Supabase client. Only the route's own
  page code belongs in its first download; the build already writes the
  entry's imports (the links without as="script").
*/
export type ViteManifest = Record<string, { file: string; imports?: string[] }>;

/** The page chunk behind a source file, plus everything it statically imports, as "/assets/…" URLs. */
export const staticClosure = (manifest: ViteManifest, source: string): Set<string> => {
  const files = new Set<string>();
  const visit = (key: string) => {
    const entry = manifest[key];
    if (!entry || files.has("/" + entry.file)) return;
    files.add("/" + entry.file);
    entry.imports?.forEach(visit);
  };
  visit(source);
  return files;
};

/** Drops runtime-added module preloads whose file is not in `keep`. */
export const keepOnlyRoutePreloads = (html: string, keep: Set<string>): string =>
  html.replace(/<link\b[^>]*\brel="modulepreload"[^>]*>/gi, (tag) => {
    if (!/\bas="script"/i.test(tag)) return tag;
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1];
    return href && keep.has(href) ? tag : "";
  });
