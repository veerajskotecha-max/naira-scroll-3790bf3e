# SOFTLY, SLOWLY, WORN — Volume One

A ten-shot advertising campaign for Naira Flore. One idea: the long quiet of an
Indian afternoon — the same table, the same day, the light moving across it.

## Why this campaign

Of ~400 live demi-fine jewellery ads sampled from the Meta Ad Library, **22% are
discount and price-flash tiles**, and **craft/provenance imagery is under 2%
globally and close to zero in India**. That gap is the one position Naira's
slow-made story can occupy and competitors structurally cannot copy — GIVA and
Palmonas can cut price tomorrow, they cannot manufacture a twenty-year atelier.

Five of the ten frames are built directly on it: clay that remembers the ring,
khadi that dents under the pearls, a cardamom pod lending its size to a stone.
The other five do the ordinary selling jobs — two colour-block heroes for
category authority, three body crops for projection.

## Method

Nano Banana Pro, 4:5, 2K, one product per frame. Each frame references **its own
delivered e-com still** rather than the supplier photo: the product is already
isolated on a neutral set there, which makes it a cleaner reference than a
packshot with a model and a background in it.

Prompts follow the six-block shape from the `imagegenerationnaira` skill — shot
type, fidelity lock, scale, scene, light, negatives — with two rules doing most
of the work:

1. **A fidelity clause naming what will morph.** "The braided rope must stay a
   visible braid of separate twisted strands, never a smooth plain tube."
2. **A scale test the model can check itself against.** Not "petite" but "the
   bow is 16mm and a finger is 16mm across, so the two loops reach the edges of
   the finger and stop there."

## Scores

Every frame was rated against the brief and re-shot if it missed. Five passed
first time; five were re-shot. **Average 9.0.**

| # | Shot | Product | Ad job | v1 | Final |
|---|---|---|---|---|---|
| 01 | Sage Hero | E20267O Woven Gold Hoops | Category authority, copy shelf | 6.0 | **8.5** |
| 02 | Blush Hero | YF6403 Dewdrop Bezel Necklace | Category authority, A/B pair | 5.0 | **9.5** |
| 03 | Ear | E19263B Pearl Point Studs | Projection | 7.0 | **9.0** |
| 04 | Throat | YF8439 Serpentine Whisper Chain | Projection | — | **8.5** |
| 05 | Hand | FR03136B Pearl Ribbon Ring | Projection + scale proof | 6.5 | **8.5** |
| 06 | Cardamom | WR23024K Emerald Eternity Band | Craft proof | — | **9.0** |
| 07 | Khadi | YF3925 Pearl Legacy Bracelet | Provenance | — | **9.0** |
| 08 | Terracotta | JDR0104337 Amber Dome Ring | Provenance | — | **9.0** |
| 09 | Jaali | JDB201083 Fine Chain Circle Station | Brand recall | — | **9.5** |
| 10 | Paper | WE24089B Pearl Halo Studs | Layout frame | 8.5 | **9.5** |

## What the first pass got wrong

Two failure modes, and both are worth keeping:

**Scale collapse on body shots.** Shots 1, 3 and 5 all rendered the piece far
larger than its stated millimetres — the hoops read as bangles, the 16mm stud
covered the whole lobe, the ring bow hung out over the side of the finger.
Stating the dimension is not enough. What fixed it was giving the model a
*geometric test it can check against the body*: "the stud sits within the lobe
with a visible margin of bare skin all the way round it"; "the two loops reach
the edges of the finger and stop there". A rule with a checkable edge beats an
adjective every time.

**Reference bleed on the colour-block heroes.** Shots 1 and 2 both inherited the
plaster plinth from the e-com still used as reference, which is exactly what a
colour-block hero must not have. Shot 2 came back as another e-com frame, clasp
and extender laid out on a block — a 5.0. The fix was to say what is *absent*,
at length: no horizon, no wall, no floor, no table, no plinth, no block, no
shelf, no gradient — and then to say what the object is doing instead: *the
necklace is hanging in the air, not lying down.* It went to 9.5.

## Reuse

`build-campaign.py` rebuilds the book from the frames. The prompts live in the
session transcript; the two rules above are the transferable part.
