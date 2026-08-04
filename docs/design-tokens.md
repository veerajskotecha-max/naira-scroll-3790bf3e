# Naira Flore Design Tokens

Three-layer token architecture extracted from the shipped UI on 2026-08-04.
The extraction is behaviour-preserving: every token value is the exact value
the site already rendered. Nothing here changes how anything looks.

Sources of truth:

| What | Where |
| --- | --- |
| All token values (all three layers) | `src/index.css`, block headed `NAIRA FLORE DESIGN TOKENS` |
| Tailwind utilities over the tokens | `tailwind.config.ts` (`colors.nf.*`, `letterSpacing.nf-*`, `fontFamily.nf-*`) |
| Reference implementations | `src/components/jewellery/JewelCard.tsx`, `src/components/Footer.tsx`, `src/pages/Jewellery.tsx`, `src/components/wow/Reveal.tsx` |

## The three layers

```
Primitive  (raw values)      --nf-ivory: #FBF3EC
    v
Semantic   (purpose)         --nf-surface: var(--nf-ivory)
    v
Component  (per-component)   --nf-footer-surface: hsl(var(--nf-sage-logo-hsl))
```

Rules:

1. Only primitives hold raw values. Semantic and component tokens are
   `var()` references (plus alpha where the component needs it).
2. Components consume semantic or component tokens. Reaching down to a
   primitive is acceptable only for the Tailwind alpha-modifier pattern
   (`text-nf-ink/60`), which is inherently primitive-plus-alpha.
3. Never reintroduce a raw hex, `hsl()` or arbitrary `tracking-[...]`
   for a value that already has a token.
4. Sharp corners everywhere on brand surfaces: radius stays 0
   (`--radius: 0px` and the zeroed `borderRadius` scale are already
   enforced globally; do not add rounded corners).

### Layer 1: primitives

Colour core (each has a hex twin and an `-rgb` channel triplet; keep them in sync):

| Token | Value | Role |
| --- | --- | --- |
| `--nf-ivory` | `#FBF3EC` | page ground |
| `--nf-ivory-deep` | `#F4EBE2` | pressed-linen surface (packshots, skeletons) |
| `--nf-ink` | `#1A1614` | near-black text and fills |
| `--nf-gold` | `#C99A4C` | bright gold: hairlines, dots, sparkle |
| `--nf-gold-deep` | `#B0843A` | mid gold: eyebrows, focus ring |
| `--nf-gold-shadow` | `#9A7634` | umbral gold: small text on ivory |
| `--nf-sage` | `#99B4AF` | brand sage tint |
| `--nf-blush` | `#FFBDA8` | pressed-flower blush tint |

Footer palette (logo-derived, deliberately distinct from `--nf-sage`; HSL channels):

| Token | Value |
| --- | --- |
| `--nf-sage-logo-hsl` | `162 14% 61%` |
| `--nf-sage-logo-deep-hsl` | `162 18% 38%` |
| `--nf-cream-hsl` | `33 33% 95%` |

Type stacks:

| Token | Value |
| --- | --- |
| `--nf-font-display` | `'Velista', 'Cormorant Garamond', Georgia, serif` |
| `--nf-font-editorial` | `'Cormorant Garamond', Georgia, serif` |
| `--nf-font-label` | `'Jost', 'Inter', sans-serif` |

Tracking ladder (names are hundredths of an em): `--nf-track-4` (0.04em),
`-8`, `-10`, `-16`, `-18`, `-20`, `-24`, `-25`, `-28`, `-30`, `-32`, `-34`,
`-40`, `-50` (0.5em). Label typography lives between 0.18em and 0.5em;
the smaller steps serve the footer and dense metadata.

Motion: `--nf-ease-reveal` (`cubic-bezier(0.22, 1, 0.36, 1)`, the shared
scroll-in curve, same as Tailwind `ease-reveal`), `--nf-reveal-duration`
(0.6s), `--nf-reveal-rise` (16px). These complement the pre-existing
`--ease-out-strong` and `--ease-drawer`.

### Layer 2: semantic

| Token | Points at | Use for |
| --- | --- | --- |
| `--nf-surface` | ivory | default page ground |
| `--nf-surface-raised` | ivory-deep | packshot / skeleton ground |
| `--nf-text` | ink | primary copy |
| `--nf-text-inverse` | ivory | copy on ink fills |
| `--nf-accent` | gold | hairlines, dots, sparkle SVGs |
| `--nf-accent-strong` | gold-deep | category eyebrows |
| `--nf-accent-quiet` | gold-shadow | small gold text on ivory (contrast-safe) |
| `--nf-tint-sage` / `--nf-tint-blush` | sage / blush | soft tints |
| `--nf-focus-ring` | gold-deep | global keyboard focus outline |

### Layer 3: component

Jewel card: `--nf-card-shadow` (the gold-umbra packshot shadow).

Footer: `--nf-footer-surface`, `--nf-footer-cta`, `--nf-footer-text`,
`--nf-footer-text-muted`, `--nf-footer-text-faint`, `--nf-footer-hairline`,
`--nf-footer-hairline-strong`, `--nf-footer-chip-bg`,
`--nf-footer-chip-bg-hover`, `--nf-footer-input-bg`,
`--nf-footer-input-bg-focus`.

Add a component token only when a component needs a value that is not a
plain semantic token (a baked-in alpha, a shadow recipe, a pairing that
must move together). Otherwise use the semantic layer directly.

## Using the tokens

In JSX class names (preferred):

```tsx
// before
<p className="text-[10px] tracking-[0.4em] text-[#9A7634]">
// after
<p className="text-[10px] tracking-nf-40 text-nf-gold-shadow">
```

Alpha modifiers keep working because the Tailwind colours are declared
over channel triplets: `text-nf-ink/60`, `bg-nf-ivory/85`,
`group-hover:border-nf-gold/60`, `placeholder:text-nf-cream/85`.

In inline styles and SVG attributes:

```tsx
const jost = { fontFamily: "var(--nf-font-label)" } as const;
<path fill="var(--nf-accent)" />
e.currentTarget.style.backgroundColor = "var(--nf-footer-chip-bg-hover)";
```

In CSS: `background-color: var(--nf-surface-raised);` (see
`.atelier-shimmer` and the global focus ring in `src/index.css`).

Shadows: use the typed utility `shadow-nf-card` (declared under
`boxShadow` in `tailwind.config.ts`). Never write
`shadow-[var(--nf-card-shadow)]`: Tailwind v3 cannot type a bare `var()`
inside a `shadow-*` arbitrary value, treats it as a shadow colour, and
emits NO `box-shadow` property, so the card silently loses its shadow.
If you must inline a shadow token, the typed arbitrary form
`shadow-[shadow:var(--nf-card-shadow)]` also works. For other
token-backed utilities without a Tailwind mapping, prefer adding the
mapping in `tailwind.config.ts` over arbitrary values.

## Migration guide

Reference implementations to copy from: `JewelCard.tsx` (classes, SVG
fills, shadow token), `Footer.tsx` (inline styles, JS hover handlers,
component layer), `Jewellery.tsx` (page-level classes, font consts),
`Reveal.tsx` (motion tokens in inline styles).

Per file:

1. Map every raw class to its token utility:
   `bg-[#FBF3EC]` -> `bg-nf-ivory`, `text-[#1A1614]/60` -> `text-nf-ink/60`,
   `border-[#C99A4C]` -> `border-nf-gold`, `text-[#B0843A]` -> `text-nf-gold-deep`,
   `text-[#9A7634]` -> `text-nf-gold-shadow`, `bg-[#F4EBE2]` -> `bg-nf-ivory-deep`,
   `tracking-[0.3em]` -> `tracking-nf-30`, and so on. Preserve every alpha
   suffix exactly.
2. Replace inline colour strings with `var(--nf-...)` (works in `style`
   props, JS style assignments, and SVG presentation attributes).
3. Replace the `jost` and `editorial` font consts with
   `var(--nf-font-label)` / `var(--nf-font-editorial)`. Do NOT touch the
   `velista` const (next section).
4. Verify pixel identity before merging: run typecheck and build, then
   compare full-page screenshots of the affected routes at desktop and
   mobile widths against the pre-change build. Anything but a byte-level
   or zero-diff match is a regression.

New colours: add a primitive (hex plus channel triplet), route it through
a semantic token, then expose it in `colors.nf.*` if classes need it.
Changing a brand value means editing the hex AND its channel twin.

## The display-font landmine

Many components carry
`const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" }`.
`--font-cormorant` is defined nowhere, so per the CSS custom-property
spec the whole declaration is invalid at computed-value time and those
headings actually inherit the app sans stack. Verified in a real browser
during extraction: the `/jewellery` h1 computes to
`ui-sans-serif, system-ui, ...`, not Velista.

That inherited look is the current, approved pixel output. Therefore:

- The `velista` consts were left byte-for-byte untouched in the migrated
  components.
- Swapping them to `var(--nf-font-display)` WOULD render Velista and
  visibly change every heading that uses them. That is a deliberate
  design decision to make some day, with a visual review, not a cleanup.
- The Tailwind class `font-cormorant` is unaffected and does render
  Velista; `--nf-font-display` matches it exactly.

## Invariants this system must never break

- Jewellery never shows prices; every piece shows "Pre-order open".
  Catalogue data in `src/data/jewellery.ts` is user-approved as-is.
- Radius 0 on brand surfaces. No rounded corners.
- Quiet-luxury voice, Indian English, no exclamation marks, no em dashes
  in user-visible copy.
- WhatsApp 919561557935, support email shopatnaira@gmail.com and the
  NAIRA10 banner are fixed.
- The reveal fallback system (`src/lib/revealFallback.ts`) stays.
