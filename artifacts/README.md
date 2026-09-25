# artifacts/

Coded pieces that ship as pages rather than as part of the storefront.

## prism-riviere-3d.html

A 3D render of the **Prism Rivière Bracelet** (SKU B00681C) in Three.js r160.
Published at https://claude.ai/artifact/FX3b4peWrgPxG1dbahcmzZ

Built from the product record, not from a likeness:

| From the product | In the model |
| --- | --- |
| Cushion cut CZ, ~5 mm | superellipse lofted through table → girdle → culet, flat shaded |
| Fine pavé halo | 26 stones per link at 1/7 the centre stone's size |
| Aqua, pink, yellow repeating | `#7FC8DC`, `#F0A6BE`, `#F2DC9B` |
| Rhodium plated | `metalness: 1`, `roughness: 0.07` |
| Fold over clasp | plate + leaf + two lips, length = the chord of the gap |
| 18 cm, 15–19 adjustable | 19 links, radius derived from link pitch |

The three tints were **measured, not chosen**: a k-means pass over the
saturated pixels of `prism-riviere-bracelet-0.jpg` returned aqua `#9bc0c6`,
pink `#d2b9b8`, yellow `#d0b88d` and metal `#b1adaa` as means. The material
colours sit more saturated than those numbers because the renderer washes
them out through transmission and specular the same way the camera did.

### Things that cost a render pass each, so they are written down

- **An HDR environment cannot be loaded** — the artifact CSP blocks images
  from every host. The studio is painted to a canvas instead. Without an
  environment map a faceted gem renders as a grey lump; the reflections are
  the whole read.
- **A jewellery studio is a dark room with bright sources**, not a bright
  room. Pass 2 used a pale gradient and every link turned to chalk.
- **Transmission against a dark room means a dark stone.** Real CZ stays pale
  because it returns light internally; a little emissive of the stone's own
  tint is what gets the pastels back.
- **Pavé scale is a ratio, not a taste call.** 0.7 mm against a 5 mm centre is
  a seventh. At a third it reads as a daisy chain.
- **A link is placed with `rotation.y = -a + PI/2`**, which puts its local +z
  radially outward and +x along the tangent. The clasp built long on z pointed
  straight into the middle of the bracelet for three passes.
- **Element screenshots time out on a spinning canvas** — Playwright waits for
  the element to be stable and it never is. Clip a page screenshot instead.

Rendered and compared against the product photography six times; the harness
is `shopify/harness/render3d.mjs`.
