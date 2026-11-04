# UGC-style brand imagery

Five phone-snapshot-style shots of real catalogue pieces, made 8 Aug 2026.

| # | Shot | SKU | Piece | Score |
|---|---|---|---|---|
| 01 | wrist on a bedsheet, window light | YF6667 | Cuban Pearl Bracelet | 9.0 |
| 02 | ear, hair tucked back, warm bulb | E20267O | Woven Gold Hoops | 9.5 |
| 03 | ring in the open box on a table | WR20902K8 | Cushion Halo Ring | 9.5 |
| 04 | collarbone, evening, mixed light | YF6403 | Dewdrop Bezel Necklace | 9.0 |
| 05 | pair of studs loose in a palm | E19263B | Pearl Point Studs | 9.5 |

## What these are for

Lifestyle and styling imagery: an on-site gallery, paid social, ad units,
email. They are brand-produced photographs of our own pieces and should be
presented as such.

They are **not** customer reviews and must not be published as customer
reviews — no invented reviewer name, no star rating, no "verified buyer"
badge, no fabricated purchase date. Fabricated reviews are prohibited under
the Indian consumer-review framework (BIS IS 19000:2022) and under the US
FTC's Consumer Reviews and Testimonials rule, which names AI-generated
reviews explicitly. `docs/reviews-playbook.md` covers how to collect the real
ones through Judge.me.

## How they were made

**Reference the verified frame, never re-describe the product.** Each prompt
carries the SKU's already-audited e-com still as an image reference, so the
jewellery cannot drift. The prompt's job is the room, the light and the
camera, not the piece.

**Scale is stated as a geometric test, never in millimetres.** Saying "16mm"
does nothing; the first pass at shot 05 drew the studs at roughly double size
and filled the palm. What works is a check the model can run against its own
output: *"each stud is about as wide as one of her fingers — it does not span
two."* Landed first try on the retry. Same fix as the ring and bracelet scale
failures earlier in the catalogue shoot.

**Realism is mechanical, not an adjective.** Asking for "candid" produces
studio work with a messy background. What actually reads as a phone photo:

- uncorrected, often mixed white balance — shot 04 has a warm lamp on one side
  and a cold green spill from a doorway on the other
- unretouched skin, kept explicitly: shot 02 holds visible pores and blemishes,
  and that single choice does more than everything else combined
- focus on the piece, letting the hand or jaw go soft
- auto-exposure getting it slightly wrong — shot 05 is lifted too far and sits
  grey and flat
- domestic debris: lint on the velvet, crumbs and scratches on the table, a
  phone corner half out of frame
- a frame that is cropped carelessly and tilted a couple of degrees

**Anti-brief, stated every time.** Plaster plinths, seamless sweeps, gradient
grounds, rim lighting and centred composition are the e-com look and will
reappear unless explicitly forbidden. Cards, certificates, warranty slips,
pouches, ribbons and tissue are forbidden outright — the box is the only
packaging that appears, and only where it earns its place.

## Two things that will bite on a larger run

**The safety classifier throws false positives.** Shot 03 — a pink box on a
wooden table — came back `nsfw` on first submit. No credits are spent when
this happens; rephrasing cleared it immediately. A batch of 50 will hit this
several times, so the runner needs a retry-with-rewording path rather than
silently dropping frames.

**The box wordmark drops out.** Shot 03's first pass returned a completely
blank lid. Naming the mark and saying "the lid must not be blank" fixed it.
Check every box shot for this specifically.

Model: `nano_banana_pro`, 4:5, 2K, 2 credits per image.
