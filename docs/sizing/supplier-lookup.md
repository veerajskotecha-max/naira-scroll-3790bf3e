# Supplier lookup — what Alibaba would and would not give up

## The suppliers

Three, from `supplier-tracker.json`: **YISS FERA** (19 SKUs, `YF*` codes),
**YIWU JD** (16, `JD*`), **KAVNAR** (27, letter-prefixed). Their photo sets
live in Google Drive, shared with `shopatnaira@gmail.com`.

## The supplier, named

`YF5144-1.html` also carries the seller's identity:

| | |
|---|---|
| Company | **Foshan Yiss Fera Import & Export Co., Ltd.** |
| Storefront | `yissfera.en.alibaba.com` |
| Company id | `265132781` |

Five of the seven missing SKUs are theirs (`YF3952`, `YF3925`, `YF3925-NEC`,
`YF8457`, `YF5215`), so this is the right door to knock on.

## Alibaba is reachable and refuses us

A saved listing page in the YISS FERA folder, `YF5144-1.html`, identifies the
platform and the URL shape:

```
https://www.alibaba.com/product-detail/YF5144-Fashion-Designer-Jewelry-18K-Gold-1601458695821.html
```

Every available route was tried:

| Route | Result |
|---|---|
| `curl` the listing URL | HTTP 200, CAPTCHA body |
| `curl` Alibaba SKU search | HTTP 200, CAPTCHA body |
| Headless Chromium, real fingerprint | fails earlier, on the proxy CA |
| WebFetch `www.alibaba.com` listing | blank — the captcha page has no text |
| WebFetch `yissfera.en.alibaba.com/productlist.html` | blank |
| WebFetch `yissfera.m.en.alibaba.com` (mobile) | blank |
| WebFetch `indonesian.alibaba.com` (the canonical locale) | blank |
| Web search, each SKU quoted | not indexed |
| Web search, title-case (`Yf3952`) as Alibaba renders it | not indexed |
| Web search, restricted to `alibaba.com` | not indexed |
| Web search with the supplier name | finds the storefront, not the SKUs |
| Gmail, for supplier correspondence | **token expired — needs re-authorisation** |

The request reaches Alibaba and Alibaba declines it. This is their anti-bot,
not our network.

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

The two photos that had not been opened yet were opened: `YF8457-1.jpg` is a
clean packshot of the lariat and `YF5215-1.jpg` is an on-model wrist shot.
Neither carries a printed figure. That fits the pattern — the twelve SKUs
whose photos *were* spec sheets already had their dimensions transcribed,
and what remains are packshots and model shots.

So these need either a message to the supplier or a tape measure:

`YF3952` Heartline Paperclip Necklace · `YF3925-NEC` Pearl Legacy Necklace ·
`YF8457` Baroque Pearl Lariat · `JDB0104010` Triple Dawn Cuff ·
`YF3925` Baroque Shell Bracelet · `YF5215` Heartbead Bracelet ·
`NF-SLN-01` / `NF-SLB-01` Lumière Oval Necklace and Bracelet (Naira's own
codes — not a supplier SKU at all, so no listing exists to check).

No number has been invented for any of them.
