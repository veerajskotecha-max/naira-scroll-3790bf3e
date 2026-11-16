import { describe, expect, it } from "vitest";
import { CLIENTS_SERVED, clientsLabel, SHOP_RATING } from "./trust";

/* The owner's figures (16 Nov 2026), pinned as literals: a change to what the
   bag claims about the shop has to be made on purpose, here, never by drift. */
describe("the shop's trust figures", () => {
  it("rates the shop 4.5 and counts 5,000+ clients", () => {
    expect(SHOP_RATING).toBe(4.5);
    expect(CLIENTS_SERVED).toBe(5000);
    expect(clientsLabel).toBe("5,000+");
  });
});
