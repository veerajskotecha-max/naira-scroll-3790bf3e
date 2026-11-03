import { isOptionalChunkFailure } from "./optionalChunk";

/*
  Shared rule for "a page's code never arrived".

  A shopper holding a tab from before a rebuild still points at chunk files the
  server no longer has, so the next lazy route fails to import and the screen
  goes blank. One reload picks up the current build; the session flag stops a
  genuinely missing file from reloading the tab forever.

  Three places raise this: main.tsx's listeners (a build-time preload failure,
  an unhandled rejection) and ChunkErrorBoundary (a failure React throws while
  rendering a route). All of them go through here so the flag stays in one
  place — a boundary that reloaded without checking it would loop.
*/

/** The wording each browser uses when a dynamic import cannot be fetched. */
const CHUNK_IMPORT_FAILED =
  /Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Unable to preload CSS|Loading chunk \S+ failed/i;

const RELOAD_KEY = "naira:chunk-reload";

/** True for any browser's "this code file could not be downloaded" error. */
export const isChunkImportFailure = (reason: unknown): boolean =>
  CHUNK_IMPORT_FAILED.test(String((reason as Error | undefined)?.message ?? reason ?? ""));

/**
 * Reloads once per session. Returns false when the tab has already tried, so
 * the caller shows the shopper a way out instead of reloading again.
 *
 * Without sessionStorage there is no way to remember the attempt, and a page
 * whose file really is gone would reload until the shopper closed the tab — so
 * the reload is skipped rather than guessed at.
 */
export const reloadForStaleChunk = (): boolean => {
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
};

/**
 * main.tsx's "vite:preloadError" listener. Vite's import helper resolves to
 * undefined when this event is default-prevented, so it may only be prevented
 * when the page really is reloading. Once the one reload was spent it was still
 * prevented: the route then failed as "Cannot read properties of undefined
 * (reading 'default')", which ChunkErrorBoundary cannot recognise as a missing
 * file, and the route's failed download was never let go for a retry.
 */
export const handlePreloadError = (e: Event & { payload?: unknown }): void => {
  // The 3D decorations fall back to flat art on their own; never reload for them.
  if (isOptionalChunkFailure(e.payload)) return;
  if (reloadForStaleChunk()) e.preventDefault();
};

/** Lets a deliberate "try again" press make a fresh attempt. */
export const clearChunkReloadFlag = (): void => {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    /* no storage — nothing to clear */
  }
};
