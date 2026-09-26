import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBackToClose } from "./useBackToClose";

// A real history stack (jsdom's), so back() and popstate behave as in a browser.
const setup = () =>
  renderHook(() => {
    const [open, setOpen] = useState(false);
    return { open, setOpen, ...useBackToClose("nfBag", open, setOpen) };
  });

const onTop = () => (window.history.state as Record<string, unknown> | null)?.nfBag === true;

afterEach(() => {
  window.history.replaceState(null, "");
});

describe("useBackToClose", () => {
  it("adds one history entry when opened, not one per re-open", () => {
    const { result } = setup();
    const before = window.history.length;
    act(() => result.current.setOpen(true));
    expect(onTop()).toBe(true);
    expect(window.history.length).toBe(before + 1);
    act(() => result.current.setOpen(true));
    expect(window.history.length).toBe(before + 1);
  });

  it("closes when back leaves its entry", async () => {
    const { result } = setup();
    act(() => result.current.setOpen(true));
    act(() => window.history.back());
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(onTop()).toBe(false);
  });

  it("closes through history when asked, leaving no entry behind", async () => {
    const { result } = setup();
    act(() => result.current.setOpen(true));
    act(() => result.current.requestClose());
    await waitFor(() => expect(result.current.open).toBe(false));
    expect(onTop()).toBe(false);
  });

  it("runs the follow-up only after the entry is gone", async () => {
    const { result } = setup();
    act(() => result.current.setOpen(true));
    const next = vi.fn(() => expect(onTop()).toBe(false));
    act(() => result.current.closeThen(next));
    await waitFor(() => expect(next).toHaveBeenCalledTimes(1));
    expect(result.current.open).toBe(false);
  });

  it("releases its entry without closing, for a checkout hand-off", async () => {
    const { result } = setup();
    act(() => result.current.setOpen(true));
    await act(() => result.current.releaseEntry());
    expect(onTop()).toBe(false);
    expect(result.current.open).toBe(true);
  });

  it("just closes when there is no entry to step back through", async () => {
    const { result } = setup();
    act(() => result.current.setOpen(true));
    act(() => window.history.replaceState(null, "")); // entry already gone
    act(() => result.current.requestClose());
    await waitFor(() => expect(result.current.open).toBe(false));
  });

  it("reopens after a reload that lands on its entry", () => {
    window.history.replaceState({ nfBag: true }, "");
    const { result } = setup();
    expect(result.current.open).toBe(true);
  });
});
