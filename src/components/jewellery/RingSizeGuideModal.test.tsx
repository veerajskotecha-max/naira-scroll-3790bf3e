import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RingSizeGuideModal from "./RingSizeGuideModal";

afterEach(cleanup);

const Harness = ({ onClose }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Size guide</button>
      <button>Add to cart</button>
      <RingSizeGuideModal isOpen={open} onClose={() => { onClose?.(); setOpen(false); }} highlightSize="6" />
    </>
  );
};

/* A plain div with aria-modal: focus stayed on "Size guide", 24 of the next 25
   Tab stops were on the page behind, Escape left it open on all 28 ring pages,
   and the X dropped focus on <body>. */
describe("RingSizeGuideModal", () => {
  it("takes focus, keeps Tab inside, closes on Escape and returns focus to Size guide", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole("button", { name: "Size guide" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = await screen.findByRole("dialog", { name: "Ring Size Chart" });
    const close = screen.getByRole("button", { name: "Close ring size chart" });
    await waitFor(() => expect(document.activeElement).toBe(close));
    fireEvent.keyDown(close, { key: "Tab" });
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it("returns focus to Size guide after the X too", async () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Size guide" });
    opener.focus();
    fireEvent.click(opener);
    const x = await screen.findByRole("button", { name: "Close ring size chart" });
    x.focus();
    fireEvent.click(x);
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
