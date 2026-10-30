import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import ImageLightbox from "@/components/ui/image-lightbox";

afterEach(cleanup);

/* Radix gives focus back to a Dialog.Trigger, and the bag, the wishlist and
   the photo viewer have none: they open from plain buttons through state, so
   closing them dropped focus on <body> and the next Tab started at the top
   of the page. */
describe("dialogs opened by state give focus back to their opener", () => {
  it("the bag and the wishlist (Sheet)", async () => {
    const Bag = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open cart</button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent aria-describedby={undefined}>
              <SheetTitle>Your bag</SheetTitle>
              <button>Checkout</button>
            </SheetContent>
          </Sheet>
        </>
      );
    };
    render(<Bag />);
    const opener = screen.getByRole("button", { name: "Open cart" });
    opener.focus();
    fireEvent.click(opener);
    await screen.findByRole("dialog");
    await waitFor(() => expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it("the full-screen photo viewer", async () => {
    const Gallery = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open Star Point Band image 1 full screen</button>
          <ImageLightbox images={["a.jpg", "b.jpg"]} name="Star Point Band" open={open} onOpenChange={setOpen} />
        </>
      );
    };
    render(<Gallery />);
    const opener = screen.getByRole("button", { name: /image 1 full screen/ });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(await screen.findByRole("button", { name: "Close image viewer" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
