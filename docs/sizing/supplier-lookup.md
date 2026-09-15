# Supplier lookup — what Alibaba would and would not give up

## The suppliers

Three, from `supplier-tracker.json`: **YISS FERA** (19 SKUs, `YF*` codes),
**YIWU JD** (16, `JD*`), **KAVNAR** (27, letter-prefixed). Their photo sets
live in Google Drive, shared with `shopatnaira@gmail.com`.

## Alibaba is reachable and refuses us

A saved listing page in the YISS FERA folder, `YF5144-1.html`, identifies the
platform and the URL shape:

```
https://www.alibaba.com/product-detail/YF5144-Fashion-Designer-Jewelry-18K-Gold-1601458695821.html
```

Fetching that URL and an Alibaba SKU search both return **HTTP 200 with a
CAPTCHA body** — "Access Denied", "Captcha", "Verify". The request reaches
Alibaba; Alibaba declines to serve it. Headless Chromium fails earlier still,
on the proxy CA. So the live listings cannot be read from here, and this is
their anti-bot rather than our network — checked both ways rather than
assumed.

## What the saved page did give

`YF5144` — **20.5cm / 45cm**, single package 6.8 × 4.9 × 1.2 cm.

That is a direct contradiction of two live listings:

| Product | Live says | Alibaba says | Gap |
|---|---|---|---|
| Bold Nocturne Bracelet | 20cm | **20.5cm** | 0.5cm |
| Bold Nocturne Chain | 46cm | **45cm** | 1cm |

Both sit inside the range `sizing.md` already recorded from the supplier book
("Bracelets 20cm, 20.5cm; Necklaces 43, 45, 50"), which corroborates the
Alibaba figure over the live copy.

## The seven missing lengths

Still missing. The Drive photos for them are on-model shots and plain
packshots, not spec sheets — `YF3952.jpg` is a model wearing the necklace
with no printed dimensions anywhere. The twelve SKUs that *do* have printed
dimensions were already transcribed into
`supplier-tracker.json → sizing_from_supplier_spec_sheets`, and none of the
seven is among them.

So these need either a message to the supplier or a tape measure:

`YF3952` Heartline Paperclip Necklace · `YF3925-NEC` Pearl Legacy Necklace ·
`YF8457` Baroque Pearl Lariat · `JDB0104010` Triple Dawn Cuff ·
`YF3925` Baroque Shell Bracelet · `YF5215` Heartbead Bracelet ·
`NF-SLN-01` / `NF-SLB-01` Lumière Oval Necklace and Bracelet (Naira's own
codes — not a supplier SKU at all, so no listing exists to check).

No number has been invented for any of them.
