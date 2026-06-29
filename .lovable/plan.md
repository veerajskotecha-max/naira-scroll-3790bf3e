## Goal
Match the reference image exactly: all three words use **Cormorant Garamond** (not Velista). "SOFTLY, SLOWLY," in upright uppercase capitals, "worn." in italic lowercase.

## Why
Current code uses `velista` (Velista serif) for "Softly, slowly," and also for "worn.". The reference image is clearly classic Cormorant Garamond — thin elegant serifs, traditional capital shapes — not Velista's more decorative form.

## Change
In `src/components/HeroSection.tsx` (~lines 165–172):
- Change the `<h1>` from `style={velista}` → `style={editorial}` and add `uppercase` to its className so "Softly, slowly," renders as "SOFTLY, SLOWLY," in Cormorant Garamond.
- Change the "worn." span from `style={velista}` → `style={editorial}` (keeps existing `italic` class), so it renders in Cormorant Garamond italic.

No changes to animation, sizing, color, or layout. No other files touched.
