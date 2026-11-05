# Every AI shot in the colour campaign (Higgsfield, 4–5 Nov 2026)

How every shot was made:
1. **Start frames:** nano_banana_2_1 at 2K, 9:16, built on the REAL listing photos (their Higgsfield media ids are below).
2. **Motion:** kling4_0 image-to-video, 1080p, 5 s, from those frames. Where the piece must stay exact through a
   transformation, both the start and the end frames are pinned.
3. **Element plates:** veo3_1_lite, 8 s, shot alone on pure black. `tools/plate.py` turns them into RGBA, and the engine
   lays them over the real photos and footage.
4. **4K:** a Topaz 2160p upscale of each clip. Real photos go through the ByteDance 4K image upscale.

Every frame was checked against the listing photo before any motion credit was spent.

## Reference media (the real listing photos)

| Piece | Higgsfield media ids |
| --- | --- |
| Prism Rivière | prism_0 `414875eb-4a1b-483b-8d7e-9c8170fd5a67`, prism_5 `ae08cf16-7418-4234-9a64-a088944a3c46` (prism_5 carries a white NAIRA logo baked in: never use it as a frame) |
| Verdant Circlet Studs | `4ec11f77-f651-459b-85c9-61d8fddc1abf`, `14c73609-3f1d-485a-b1d6-7badc4a94da9` |
| Baguette Tennis Necklace | ruby `61c435af-…`, emerald `f75d2583-…`, crystal `81968689-…` |
| Woven Gold Hoops | hoops_0 `b1099892-…`, hoops_2 `7af85079-…` |
| Halo Curve Ring | halo_curve_a `dab2c9fb-…`, halo_curve_c `8ca0068e-…` |
| Toggle Link Chain | the owner's own clasp photo, cleaned of its measurement line: `0f94b3bc-e293-4e0f-aaa6-da6e7168816b` (file: `refs/toggle-clasp-ref.png`); toggle_1 `358637b8-…` |

The Toggle clasp is a round polished spring-gate ring about 15 mm across, with a small pavé bar of clear CZ on a jump
ring. It is NOT a long toggle bar or an extended clasp: the owner flagged this, and every Toggle prompt says so.

## Shots

| Ad | Shot | Start frame (nano) | Motion (kling unless noted) | Used? |
| --- | --- | --- | --- | --- |
| 1 Prism | standing on a plinth, pastel gulal blooming behind | `25c6c2e4` | `fe10274a` | NO: the owner said "remove the standing part" |
| 1 Prism | macro glide along the stones | `38f98ae9` | `8a3a73e9` (4K `c37dcbba`) | yes, the opening |
| 1 Prism | overhead: powder draws a rangoli round it | start `9881f81e`, end `574473e5` (edited from the start) | `a72013fc` (4K `6ea6fcd4`) | yes |
| 2 Verdant | one stud on emerald silk, green gulal and gold dust falling | `e5004db3` | `fd6c715d` (4K `5cc82ed4`) | yes |
| 2 Verdant | on the ear: festive profile, jasmine | `cb41a050` | `deb23ef6` (4K `4bd3185a`) | yes |
| 2 Verdant | the pair on a gold-edged plinth, green mist rising | `b994f623` | `8c42fd0b` (4K `509d34f0`) | yes |
| 3 Baguette | on-neck: garnet world to emerald under a green powder cloud | start `c23c93fa` (ruby), end `8e665eca` (emerald, edited from ruby) | `351b34f3` (4K `1dd21382`) | yes, the hook |
| 3 Baguette | on-neck: emerald to crystal under gold-ivory smoke | start `8e665eca`, end `9d48087f` (crystal) | `c19682da` | not used: the ad went practical |
| 3 Baguette | the REAL listing photos, three colourways | real photos, 4K via image upscale `469bd703` / `8027e2c5` / `1b6d35ae` | — | yes |
| 4 Hoops | the pair on a brass thali, marigold petals raining | `fc2be3df` | `cb4f99fa` (4K `1605e3ee`) | yes |
| 4 Hoops | on the ear at a haldi | `8be2e3dc` | `b560ab07` (4K `2c99b4c6`) | yes (first 2.5 s, while the hoop faces camera) |
| 5 Halo Curve | wind uncovers the ring from amber sand | start `f51faf6f` (buried, edited from the clean frame), end `05809ea6` (clean) | `977f608f` (4K `ba1f9590`) | yes |
| 5 Halo Curve | golden sand streaming past the hand | `30ff2b17` | `eec275e7` (1080 only) | yes |
| Toggle 1+2 | clasp macro on a jade-green plate, gold dust swirling up | `c6c4ac79` | `16629b8e` (1080 only) | yes, both |
| Toggle 2 | worn, clasp-front, ivory linen | `bbf1b715` (still, pushed in by the engine) | not generated: the account ran out of credits | the still is used |

## Element plates (veo3_1_lite, alone on black)

| Plate | Job | Used in |
| --- | --- | --- |
| Pastel gulal (aqua, pink, butter) rising | `bbe2028d` | Ad 0, colour coming off the stone into the end card |
| Emerald-green powder wave | `1ecad387` | Baguette (crystal to emerald), Toggle 1 |
| Crimson powder wave | `d7a409cb` | Baguette (emerald to ruby) |
| Gold-ivory shimmer wave | `a2be0600` | Baguette (into the end card), Toggle 1, Toggle 2 |

Run each plate through `tools/plate.py`:
- gain 1.6–2.4 so dense powder reads solid;
- `--band -100,40,90` to remove the light the model left at the top of frame.

Code-drawn 2D powder (`engine/fx7.js`) was tested and rejected as digital confetti. Use it only for subtle accents.

## Model notes from this run
- **Kling 4.0** holds stone count and order through slow push-ins and turns from a start frame. Pinning start AND end
  frames makes a transformation safe: the piece is exact at both ends and the powder covers the middle.
- **The plan's limits:** 2 concurrent Kling jobs, 2 concurrent Topaz jobs, and nano and veo are rate-limited in bursts.
- **Topaz cost:** a 2160p upscale of a 5 s clip cost far more than the 11 credits per 15 s that Ad 0 suggested. Budget
  about 10 per clip.
