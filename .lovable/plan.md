

## Plan: Update Trust Strip Items

Replace the current 4 items in the homepage Trust Strip marquee with a new set of 6 items (removing "Easy Returns" and "Customised Dresses", keeping "Authentic Handwork" reframed, and adding new ones).

### Edit `src/components/TrustStrip.tsx`

Replace the `items` array with:

| Label | Icon (lucide-react) |
|---|---|
| Pan India Shipping | `Truck` |
| Authentic Karigar Handwork | `Hand` |
| Free Design Consultation | `MessageCircle` |
| Premium Quality Fabrics | `Sparkles` |
| Secure Payments | `ShieldCheck` |
| 5,000+ Custom Pieces Made | `Scissors` |

Update the lucide-react import line accordingly. All styling, marquee animation (25s L→R loop), spacing, and triple-row duplication remain unchanged.

### Files
- **Edit**: `src/components/TrustStrip.tsx`

