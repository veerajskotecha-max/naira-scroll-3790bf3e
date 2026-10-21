# Site fixes waiting for the owner's review

`phone-fixes-for-review.patch` applies to the site's `main` at 45a63f3
("Hide Shiprocket's session code on the checkout loading screen"):

    git apply docs/pending/phone-fixes-for-review.patch

Nothing here is live. Each part ships only after the owner approves it.

Small phone fixes
- Pincode "Check" button pushed off screen on phones up to 390 px wide.
- iPhones zoom into the page when the size menu, sort menu, search,
  newsletter or contact fields are tapped (fields under 16 px). Fields are
  16 px on touch screens; the sort menu keeps its look (a 16 px native menu
  sits invisibly on top).
- Header logo touching the account icon below 360 px.
- "Most loved" row opening with its first piece cut off on small phones.
- 44 px tap areas for the FAQ/returns jump links, product-page footer links,
  sign-in page links and the unknown-page "Back to home" link.
- Gift-box title running past a 280 px screen.

Bigger changes (behaviour)
- Shop, collection and product pages fetch the live catalogue alongside the
  page's code and wait for it (at most 2.5 s from start), so the grid no
  longer rebuilds itself under the shopper's thumb after it appears.
- Search ranks real matches (ring -> rings, not earrings), understands
  "under 1500", "zircone", accents and common misspellings, and the phone
  keyboard's Go key works. The "Gifting" chip, which always found nothing,
  becomes "Pearl".
