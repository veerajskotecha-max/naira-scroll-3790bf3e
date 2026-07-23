# Restore reverted features via cherry-pick

The revert commit `a1c1d8b` (main, ~5 min ago) rolled back 18 commits spanning three features. All three should come back as they were.

## Approach

Cherry-pick the 18 commits in chronological order onto the current branch. This reproduces the exact prior code (files, flags, routes) without hand-editing.

## Commits to cherry-pick (in order)

```text
cf8ac60  Changes
8c9d74a  Changes
a3e4a51  Changes
b547cfa  Added JewellerySection to shop
46c9a42  Changes
a1f237e  Changes
df23ba3  Added FloatingRing & page
0d90d96  Changes
8d6e943  Changes
6528f3f  Changes
307e676  Changes
8b250a7  Changes
9e2e095  Added Shop dropdown & route guard
de8acb8  Changes
62a0b94  Anchored ring to hero height
01127d5  Changes
1a80612  Changes
ced5bbd  Implemented clamped ring
```

## Files that will be restored / modified

- `src/components/FloatingRing.tsx` (new, ~230 lines)
- `src/components/JewelleryProductPage.tsx` (new, ~143 lines)
- `src/components/shop/JewellerySection.tsx` (new, ~104 lines)
- `src/components/shop/ComingSoonPanel.tsx` (new, ~83 lines)
- `src/config/features.ts` (new, feature flags)
- `src/components/Navbar.tsx` (Shop dropdown added back)
- `src/components/MobileMenu.tsx` (Shop entry updated)
- `src/pages/ShopAll.tsx` (Jewellery + coming-soon route guard)
- `src/App.tsx` (Jewellery PDP route)

## Conflict handling

Since the revert put main back to `8108ffb` and no new code has since touched those files, cherry-picks should apply cleanly. If a conflict does surface (most likely `Navbar.tsx` or `App.tsx` interacting with later PDP work), I'll resolve it in favor of keeping both the restored feature and the newer PDP changes, then continue the pick.

## Verification

After the picks:
1. Confirm all 5 new files exist and `features.ts` flags are present.
2. Load `/` (FloatingRing on hero), `/shop` (Jewellery section + coming-soon panel), and the Jewellery PDP route — screenshot each via Playwright to confirm no runtime error.
3. Report any conflicts resolved.

## Note

The revert was intentional 5 min ago, so if any of these features had a known issue you wanted fixed *before* restoration, tell me now — otherwise I'll restore them as-is.
