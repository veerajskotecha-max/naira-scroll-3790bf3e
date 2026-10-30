import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { isChunkImportFailure, reloadForStaleChunk, clearChunkReloadFlag } from "@/lib/chunkFailure";
import { isOptionalChunkFailure } from "@/lib/optionalChunk";

/*
  A route's code that fails to arrive is thrown by React *while rendering* that
  route, so it reaches neither of main.tsx's listeners: React attaches its own
  handlers to the lazy import's promise, which makes the rejection "handled",
  and Vite's preload event only fires for the built bundle. Without a boundary
  here the throw unmounts the whole tree and the shopper is left on a blank
  page — the crash this guards.

  For a stale build the answer is the same one main.tsx already applies: reload
  once. Anything else gets the brand panel below, because a silent blank page
  reads as a broken shop, not a bad connection.
*/

type State = { failed: unknown };

class ChunkErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: null };

  static getDerivedStateFromError(error: unknown): State {
    return { failed: error };
  }

  componentDidCatch(error: unknown) {
    // The 3D box and header flower catch their own download failures and keep
    // their flat artwork; a decoration must never reload the page a shopper is
    // reading, so it falls through to the panel instead.
    if (isOptionalChunkFailure(error)) return;
    if (isChunkImportFailure(error)) reloadForStaleChunk();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <LoadFailed />;
  }
}

/**
 * Shown when a page's code cannot be fetched and reloading would only repeat
 * the failure. Kept to one screen: the shopper needs a way onward, not a
 * technical readout — and the piece they came for is one tap away.
 */
const LoadFailed = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-nf-ivory px-6 text-center">
    <p className="font-nf-label text-[10px] uppercase tracking-nf-8 text-nf-gold-text">Naira Flore</p>
    <h1 className="font-cormorant text-3xl leading-tight text-nf-ink">This page didn’t load</h1>
    <p className="max-w-sm text-sm leading-relaxed text-nf-ink/70">
      The page’s files didn’t reach you — a dropped connection, or a new version of the shop
      published mid-visit. Nothing you saved has gone.
    </p>
    <button
      type="button"
      onClick={() => {
        clearChunkReloadFlag();
        window.location.reload();
      }}
      className="mt-1 border border-nf-gold/40 bg-nf-ivory-deep px-7 py-3 font-nf-label text-[11px] uppercase tracking-nf-8 text-nf-ink transition-colors hover:border-nf-gold"
    >
      Try again
    </button>
    <Link
      to="/jewellery"
      className="font-nf-label text-[10px] uppercase tracking-nf-8 text-nf-gold-text underline-offset-4 hover:underline"
    >
      Browse the collection
    </Link>
  </main>
);

export default ChunkErrorBoundary;
