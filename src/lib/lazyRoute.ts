import { createElement, lazy, useState, type ComponentType } from "react";

/*
  A code-split route that can be fetched before React's first render.

  Every page is pre-built: the HTML already shows it, and main.tsx swaps in the
  live app with createRoot, which empties #root on its first commit. A plain
  React.lazy route always suspends on that first render — import() never
  resolves synchronously — so the pre-built page was replaced by an empty
  Suspense fallback and the shopper saw the header over a blank page until the
  chunk arrived: 0.35 s on good 4G, measured on the product page.

  preload() fetches the module first. A route rendered after it has resolved
  mounts the page directly, so the first commit swaps the pre-built page for
  the same page. The component is chosen once per mount: switching from the
  lazy wrapper to the loaded component on a later render would change the
  element type and remount the page, losing its state.
*/
export type LazyRoute = ComponentType & { preload: () => Promise<void> };

export function lazyRoute(load: () => Promise<{ default: ComponentType }>): LazyRoute {
  let loaded: ComponentType | null = null;
  let pending: Promise<void> | null = null;

  const preload = () =>
    (pending ??= load().then(
      (module) => {
        loaded = module.default;
      },
      (error) => {
        pending = null; // a failed download may be retried
        throw error;
      },
    ));

  const Lazy = lazy(() => preload().then(() => ({ default: loaded as ComponentType })));

  const Route = () => {
    const [Page] = useState<ComponentType>(() => loaded ?? Lazy);
    return createElement(Page);
  };

  return Object.assign(Route, { preload });
}
