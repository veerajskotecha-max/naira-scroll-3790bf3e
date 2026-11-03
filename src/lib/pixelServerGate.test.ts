import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackPixel } from "./pixel";

/*
  index.html loads Meta's script only on nairaflore.com / www.nairaflore.com
  (window.__nairaProd), but the server copy of each event went out from
  anywhere. On a local build (127.0.0.1, __nairaProd false) a product page made
  no request to Meta's script yet still posted ViewContent to our meta-capi
  relay, with event_source_url http://127.0.0.1:…; the publish build's capture
  browser did the same for every product page.
*/
const fetchMock = vi.fn((..._args: unknown[]) => Promise.resolve(new Response("{}")));
const relayCalls = () => fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/functions/v1/meta-capi"));

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  window.fbq = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.__nairaProd;
  delete window.fbq;
});

describe("the server copy of a Meta event", () => {
  it.each([
    ["a local build or Lovable preview", false],
    ["a page where the gate never ran", undefined],
  ])("is not sent from %s", (_where, prod) => {
    window.__nairaProd = prod;
    trackPixel("ViewContent", { content_ids: ["47501788348578"], value: 2399, currency: "INR" });
    trackPixel("AddToCart", { content_ids: ["47501788348578"], value: 2399, currency: "INR" });
    expect(relayCalls()).toHaveLength(0);
    // The browser call still queues in the stub, which never loads off the shop.
    expect(window.fbq).toHaveBeenCalledTimes(2);
  });

  it("is still sent from the real shop, once per event, with the browser copy's event id", () => {
    window.__nairaProd = true;
    trackPixel("ViewContent", { content_ids: ["47501788348578"], value: 2399, currency: "INR" });
    expect(relayCalls()).toHaveLength(1);
    const body = JSON.parse(String((relayCalls()[0][1] as RequestInit).body));
    expect(body.event_name).toBe("ViewContent");
    expect(body.custom_data.content_ids).toEqual(["47501788348578"]);
    const browserEventId = (window.fbq as ReturnType<typeof vi.fn>).mock.calls[0][3].eventID;
    expect(body.event_id).toBe(browserEventId);
  });

  it("stays browser-only for events that never had a server copy", () => {
    window.__nairaProd = true;
    trackPixel("CustomizeProduct");
    expect(relayCalls()).toHaveLength(0);
  });
});
