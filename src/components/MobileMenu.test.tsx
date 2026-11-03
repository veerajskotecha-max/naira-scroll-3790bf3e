import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ totalItems: 0, setDrawerOpen: () => {} }) }));
vi.mock("@/contexts/WishlistContext", () => ({ useWishlist: () => ({ totalItems: 0, setDrawerOpen: () => {} }) }));

import MobileMenu from "./MobileMenu";

afterEach(cleanup);

/* The opener and the menu, as Navbar has them. */
const Harness = ({ onClose }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const close = () => {
    onClose?.();
    setOpen(false);
  };
  return (
    <MemoryRouter>
      <button onClick={() => setOpen(true)}>Open menu</button>
      <MobileMenu isOpen={open} onClose={close} closeThen={(next) => { close(); next(); }} />
    </MemoryRouter>
  );
};

const openMenu = () => {
  const opener = screen.getByRole("button", { name: "Open menu" });
  opener.focus();
  fireEvent.click(opener);
  return opener;
};

/* The menu declared aria-modal but left focus on "Open menu", let Tab walk
   out into the header and page behind it (8 of 25 stops), stayed open on
   Escape and dropped focus on <body> when it closed. */
describe("MobileMenu as a dialog", () => {
  it("moves focus in on open", () => {
    render(<Harness />);
    openMenu();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close menu" }));
  });

  it("keeps Tab inside the menu, both ways", () => {
    render(<Harness />);
    openMenu();
    const close = screen.getByRole("button", { name: "Close menu" });
    const last = screen.getByRole("link", { name: "WhatsApp Us" });
    last.focus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("closes on Escape and gives focus back to the menu button", () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = openMenu();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(opener);
  });

  it("does nothing with the keyboard while closed", () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
