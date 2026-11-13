# PDP conversion numbers: Naira Flore (30 days = 14 Oct to 13 Nov 2026, 7 days = 6 to 13 Nov)

Everything here was read-only. Working files are in `/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/`: raw pulls in `data/`, analysis scripts in `scripts/` (run with `python3.13 -I`).

## 0. What each source can and cannot measure (read this first)

| Source | Usable for | Problem (verified) |
|---|---|---|
| Shopify `sessions` table | Nothing on the PDP | It only sees the myshopify host. 30d shows **112 sessions against 206 orders**, and `sessions_with_cart_additions` is 0. Landing pages are `/` (69), `/products_preview` (30, theme previews) and checkout URLs. |
| Shopify orders (GraphQL + `FROM sales`) | Ground truth for orders, AOV, payment, items | 194 of 206 orders are tagged `fastrr` (sourceName 424640577537). 9 are draft orders. |
| Meta pixel 1232524215695667, browser-only events | Site funnel (VC → ATC → IC) | ViewContent fires once per piece viewed (`JewelDetail.tsx:255`, `useViewContent.ts`). AddToCart fires per add (`CartContext.tsx:252/346`). InitiateCheckout fires on the Secure Checkout tap (`CartContext.tsx:454`). |
| Pixel, all sources | Ratios only | Server events mirror browser ones. Purchase: **692 events in 28d against about 204 orders** (about 3.4x). |
| Meta ad attribution | Comparing ads with each other | **243 attributed purchases against 206 total Shopify orders** in 30d, so purchase counts and ROAS are inflated. Attribution setting is `1d_view_7d_click_1d_ev`. |
| Pixel `aggregation=url` | — | Returns the host only (`https://nairaflore.com/`), with no path, so there is no per-PDP pixel funnel. |
| Pixel by device | — | Desktop shows 11,858 of 34,417 ViewContent (34%) in 7d, but only 95 ATC and **0 purchases**. That is non-shopper traffic, and it pulls VC→ATC down. |

## 1. Store funnel

**1a. Shopify sessions, shown for completeness only (not usable).** Query: `FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate SINCE -30d UNTIL today` (also run with `-7d` and with `GROUP BY session_device_type` / `landing_page_path`).

| Window | Sessions | With ATC | Reached checkout | Completed | CVR |
|---|---|---|---|---|---|
| 30d | 112 | 0 | 17 | 12 | 10.7% |
| 7d | 11 | 0 | 11 | 9 | 81.8% |
| 30d desktop / mobile | 56 / 56 | 0 / 0 | 0 / 17 | 0 / 12 | 0% / 21.4% |

**1b. The real site funnel.** Source: browser pixel events from `ads_get_dataset_stats` (dataset 1232524215695667, `aggregation=event`, `event_source=WEB_ONLY`, daily, 16 Oct to 12 Nov PT). The last step uses Shopify orders.

| Window | ViewContent (PDP views) | AddToCart | VC→ATC | InitiateCheckout | ATC→IC | Pixel Purchase | IC→Purchase | Shopify orders | Orders/IC | Orders/VC |
|---|---|---|---|---|---|---|---|---|---|---|
| 28d | 48,861 | 4,139 | **8.5%** | 832 | **20.1%** | 244 | 29.3% | about 204 | **24.5%** | 0.42% |
| 7d | 12,161 | 1,298 | **10.7%** | 240 | **18.5%** | 65 | 27.1% | 69 | 28.8% | 0.57% |

**1c. By device, 7d.** Source: `ads_get_dataset_stats aggregation=device_type`, per event, all sources. Absolute counts are inflated by server mirroring; read the ratios only.

| Device | VC | ATC | ATC/VC | IC | IC/ATC | Purchase | Purchase/IC |
|---|---|---|---|---|---|---|---|
| iPhone | 14,051 | 1,723 | 12.3% | 535 | 31.1% | 149 | 27.9% |
| Android phone | 8,508 | 1,259 | **14.8%** | 344 | 27.3% | 57 | **16.6%** |
| Desktop | 11,858 | 95 | 0.8% | 4 | — | 0 | — |

Android adds to cart more often than iPhone but finishes checkout much less often.

**Top landing pages:** these cannot be measured. Shopify only sees `/` and checkout URLs, and pixel URLs carry no path.

## 2. Product level (Meta catalogue ads)

Source: `ads_get_ad_entities` with `level=ad_account`, `breakdowns=["product_id"]`, `last_30d`, aggregated over variants in `scripts/prod.py`. It covers catalogue ads only: ₹83,310 of spend and 7,022 LPV. It returned exactly 200 variant rows, so it may be capped. ATC and purchases are attributed to the product shown in the ad, so treat them as directional. Shopify units come from `FROM sales SHOW orders, net_items_sold ... GROUP BY product_title SINCE -30d`.

| Product (top 10 by LPV) | Catalogue variants | LPV | ATC/LPV | Purchases/LPV | Shopify units, 30d |
|---|---|---|---|---|---|
| Roman Numeral Trio Ring | 3 | 926 | 17.5% | 1.9% | 16 |
| Silk Mesh Cuff | 2 | 705 | 27.7% | 3.1% | 13 |
| Baguette Huggies | 4 | 637 | 31.4% | 2.0% | 25 |
| Baguette Eternity Band | 15 | 384 | 16.1% | 1.6% | 15 |
| Chain Drop Dome Ring | 8 | 377 | 20.4% | 0.8% | under 4 |
| Mesh Band Ring | 10 | 367 | 29.7% | 2.5% | 6 |
| Linked Pair Ring | 5 | 269 | 18.2% | 0.0% | 5 |
| Baguette Tennis Bracelet | 3 | 231 | 32.5% | 1.3% | 27 |
| Woven Gold Hoops | 1 | 215 | 27.9% | 1.9% | 20 |
| Cushion Solitaire Ring | 1 | 212 | **37.3%** | **8.0%** | 11 |

- **Best:** Cushion Solitaire Ring (37.3% ATC/LPV, 8.0% purchases/LPV) and Kiss Knot Bangle (38.2% and 6.7%, but only 89 LPV).
- **Worst, among products with at least 100 LPV:** Brushed Gold Huggies (12.4%, 0 purchases), Baguette Eternity Band (16.1%), Watch Link Ring (16.4%, 8 variants), Roman Numeral Trio Ring (17.5%, and it has the most catalogue traffic), Linked Pair Ring (18.2%, 0 purchases), Star Point Band (19.0%, 9 variants).
- Prism Rivière Bracelet had only 77 LPV from catalogue ads (₹2,723 spend, 0 attributed purchases), yet 10 units sold in Shopify.

## 3. Orders

Source: GraphQL `orders(query:"created_at:>=2026-10-14")`, 3 pages, 206 orders. That matches ShopifyQL `FROM sales SHOW orders` = 206. Analysis in `scripts/orders*.py`.

| Metric | 30d | 7d |
|---|---|---|
| Orders | 206 | 69 |
| AOV (ShopifyQL `average_order_value`) | ₹1,511 | ₹1,379 |
| Mean / median order total (GraphQL `totalPrice`) | ₹1,781 / ₹1,519 | ₹1,627 / ₹1,299 |
| Items per order | 1.51 (310 units) | 1.43 |
| 1 / 2 / 3 / 4+ items | **68.4%** / 18.4% / 8.3% / 4.9% | **73.9%** / 14.5% / 5.8% / 5.8% |
| Ladder codes used | BUY2 33, BUY3 23, BUY4 2, NAIRA10 1 | BUY2 4, BUY3 5, BUY4 2 |
| COD / Razorpay / manual or none | **44.7%** / 51.0% / 4.4% | 42.0% / 46.4% / 11.6% |
| PrepaidDiscount (exactly 5.0%; stacks with the ladder) | 55 orders | 25 |
| Cancelled | 3 (1.5%) | 2 |
| Returns | 0 (all `NO_RETURN`) | 0 |
| RTO-tagged ("RTO Initiated via Shiprocket") | 14: 13 COD, 1 prepaid | — |

**Ladder uptake**
- When shoppers buy two or more pieces they use the ladder: 33 of 38 two-piece orders carried BUY2, and all 17 three-piece orders carried BUY3.
- Four two-piece orders on 9–11 Nov carried no BUY2: #1281, #1293, #1294, #1303. The BUY2 code is ACTIVE now at 10%, minimum quantity 2, `updatedAt` 2026-11-12.
- BUY3 is 20% and BUY4 is 30% (BUY4 started 7 Nov). All three verified with `codeDiscountNodeByCode`.

**The offer changed many times in 30 days.** `git log origin/main -- src/lib/promo.ts` shows commits on 2 Nov (20/30), 3 Nov (10/20), 7 Nov (BUY4 added, BUY2 removed) and 9 Nov (BUY2 back). Discount rates on the orders themselves confirm 10/20, then 15/25, then 10/20, then BUY4 30%. The share of Fastrr orders with 2+ items moved with it:

| Period | Fastrr orders | 2+ items |
|---|---|---|
| 16–26 Oct | 44 | 23% |
| 27 Oct – 2 Nov | 67 | 36% |
| 3–6 Nov | 36 | 42% |
| 7–12 Nov | 47 | 26% |

These samples are small.

**COD compared with prepaid**

| | COD | Prepaid |
|---|---|---|
| Mean order total | ₹1,699 | ₹1,866 |
| Orders with 2+ items | 25% | 38% |
| RTO rate | **21.4%** (12 of 56 COD orders created before 3 Nov) | 1 of 104 |

- COD share by week: 55% → 49% → 42% → 40%.
- Fastrr's `rto_prediction_high` tag was on 17 orders, but only 2 of the 14 RTOs carried it.

**Top products by units, 30d:** Baguette Tennis Bracelet 27, Baguette Huggies 25, Woven Gold Hoops 20, Roman Numeral Trio Ring 16, Baguette Eternity Band 15, Silk Mesh Cuff 13, Cushion Solitaire Ring 11, Prism Rivière Bracelet 10, Watch Link Ring 10, Cushion Halo Ring 9.

**Top products by units, 7d:** Baguette Huggies 7, Woven Gold Hoops 7, Cushion Halo Ring 7, Baguette Tennis Necklace 6.

## 4. Meta: top 6 ads by spend, last 30 days

Source: `ads_get_ad_entities` on account 903466039148509, `level=ad`, `last_30d`, `sort=amount_spent_descending`. These 6 ads are 47% of spend.

| Ad | Status | Spend ₹ | LPV | ATC (% of LPV) | IC (% of ATC) | Purchases (% of IC) | Purchases/LPV | ROAS (Meta) |
|---|---|---|---|---|---|---|---|---|
| Catalogue E2 carousel, 31 new pieces | ACTIVE | 31,066 | 4,137 | 875 (21.2%) | 173 (**19.8%**) | 63 (36.4%) | 1.52% | 2.38 |
| Bestsellers 1 set 2, catalogue carousel | ADSET_PAUSED | 26,997 | 1,834 | 590 (32.2%) | 110 (**18.6%**) | 49 (44.5%) | 2.67% | 2.04 |
| E2 fruit Ruby Anaar, Stories 9:16 | PAUSED | 14,378 | 785 | 205 (26.1%) | 37 (**18.0%**) | 24 (64.9%) | 3.06% | 2.27 |
| New 12, catalogue carousel | CAMPAIGN_PAUSED | 11,630 | 992 | 244 (24.6%) | 49 (**20.1%**) | 26 (53.1%) | 2.62% | 1.79 |
| Static Hoops "Apricot quiet", Feed | ADSET_PAUSED | 5,805 | 139 | 44 (31.7%) | 19 (43.2%) | 5 (26.3%) | 3.60% | 1.45 |
| W1 Woven Gold Hoops, Story | CAMPAIGN_PAUSED | 4,863 | 278 | 45 (16.2%) | 12 (26.7%) | 5 (41.7%) | 1.80% | 1.23 |
| **Account, 30d** | | 201,695 | 13,753 | 2,997 (21.8%) | 565 (**18.9%**) | 243 (43.0%) | 1.77% | 1.44 |
| **Account, 7d** | | 67,931 | 5,230 | 1,122 (21.5%) | 186 (**16.6%**) | 77 (41.4%) | 1.47% | 1.26 |

- **Biggest drop: add-to-cart → checkout.** About 18–20% of adds reach checkout, and the four big ads are almost identical on this step.
- On Shopify's numbers, spend per actual order is ₹979 (₹201,695 / 206 orders). Blended return is 1.81 (Shopify total sales ₹364,875 / spend).
- Carousels produce several LPVs per person: E2 had 4,137 LPV from 2,939 unique link clicks.

## 5. Where shoppers drop

| Step | 28d (browser pixel + orders) | Lost | Notes |
|---|---|---|---|
| PDP view → add to cart | 8.5% (10.7% in 7d; 12–15% on mobile) | about 44,700 views | Largest absolute loss. Desktop non-shopper views understate the rate. |
| Add to cart → Secure Checkout | 20.1% (Meta 18.9%) | about 3,300 adds | Lowest step rate on Meta, and flat across all top ads. Counts are per add event, so it is somewhat understated per shopper. |
| Checkout → order | 24.5% (orders / IC); Meta says 43% but that is inflated | about 630 | This happens on Fastrr, off our domain. On Android, purchases per checkout run at about 60% of iPhone's (16.6% vs 27.9%). |
| Order → kept | COD RTO 21.4% on the matured cohort; prepaid about 1% | — | Takes about 9.6% off all orders (0.447 × 0.214). |

## 5 conclusions for PDP design

1. **The first screen has to win the add.** 91% of PDP views end without one (8.5–10.7%). Price, the ladder price, COD, delivery and the add button should all be visible at 360px in the Instagram in-app browser. The best PDPs reach 37–38% ATC/LPV (Cushion Solitaire Ring, Kiss Knot Bangle), against 16–17% for the weakest.
2. **Most adds never reach checkout (18–20%, the same on every top ad).** 68–74% of orders are a single piece, so give the PDP a direct one-piece path to checkout (Buy now) next to Add to bag. State the full price including the offer on the PDP so the bag holds no surprise. The flat rate across ads points at the site rather than the creative.
3. **Average order value is the margin lever.** Ads cost ₹979 per order against a ₹1,511 AOV. Shoppers do use the ladder when they buy more than one piece (33 of 38 two-piece orders, 17 of 17 three-piece). Show "this piece at 2 / 3 / 4" in rupees plus a one-tap second piece. Keep the offer stable long enough to measure: it changed 4–5 times in 30 days, and the 2+ item share swung between 23% and 42%.
4. **Nudge prepaid without hiding COD.** COD is 45% of orders, and 21% of matured COD orders go RTO against about 1% prepaid. Prepaid orders already get 5% off (PrepaidDiscount, 55 orders, stacks with the ladder) and are more often multi-piece (38% vs 25%). Say "extra 5% off when you pay online" next to the price and the COD line. Android finishes checkout far less often, so keep the PDP light and the tap targets large.
5. **Fix ring-size certainty first, and measure correctly.** The weakest PDPs with real traffic are mostly multi-size rings: Baguette Eternity Band (15 variants, 16.1%), Watch Link Ring (16.4%), Linked Pair Ring (18.2%, 0 purchases), Star Point Band (19.0%). Roman Numeral Trio Ring gets the most catalogue traffic at 17.5%. Size help (a guide, and adjustable or fit details) is a hypothesis to test, not a proven cause. Judge PDP tests on browser-only pixel VC→ATC→IC plus Shopify orders, not on Shopify sessions (they cannot see the site) or Meta purchases (243 attributed against 206 orders).
