# Size facts per store product, from the two supplier lists, with what the
# product page says today and the lines proposed for its Details list.
# card: A = supplier measurement photo (cleaned), B = our photo marked,
#       N = necklace length guide, W = bracelet length guide, R = ring guide.
import json, os

YF = 'Yiss Fera quotation (22 Sep 2026)'
KV = 'KAVNAR quotation'
P = []
def add(handle, code, src, supplier, propose, caption, card=None, img=None, conflicts=(), flags=(), measure=False):
    P.append(dict(handle=handle, code=code, source=src, supplier=list(supplier), propose=list(propose), caption=caption,
                  card=card, img=img, conflicts=list(conflicts), flags=list(flags), measure=measure))

# ── Yiss Fera: measurement photos in the sheet ────────────────────────────
add('tubogas-dome-ring', 'YF3608', YF, ['Band 5.8 mm wide', 'Weight 2.7 g', 'Sizes 6, 7, 8'],
    ['Width: Approximately 5.8mm', 'Weight: Approximately 2.7g'], 'Band 5.8 mm wide · US 6, 7, 8', 'A', 'r10_c8_40.jpg',
    ['Page says width ~10 mm; supplier 5.8 mm'])
add('marquise-layering-set', 'YF5244', YF, ['Solitaire necklace 40 + 5 cm, marquise 13 mm', 'Y-lariat 45 + 5 cm, drop 9 cm', 'Lariat 6 g'],
    ['Necklace one: 40cm plus a 5cm extender, marquise stone approximately 13mm', 'Necklace two: 45cm plus a 5cm extender, the Y-drop approximately 9cm'],
    '40 + 5 cm and 45 + 5 cm · 9 cm drop', 'A', 'r12_c8_41.jpg',
    ['Page says marquise ~10 × 5 mm; supplier 13 mm', 'Page gives no extender and no length for the lariat'])
add('silk-mesh-cuff', 'YF3482', YF, ['19 mm wide', 'Weight 32 g'], ['Width: Approximately 19mm', 'Weight: Approximately 32g'],
    'Cuff 19 mm wide · 32 g', 'A', 'r15_c8_44.jpg', ['Page says mesh ~15 mm wide; supplier 19 mm'])
add('fine-tennis-bracelet', 'YF7116', YF, ['3 mm wide', 'Length 17 cm', 'Weight 4.7 g'], ['Width: Approximately 3mm', 'Weight: Approximately 4.7g'],
    '17 cm long · 3 mm wide', 'A', 'r17_c8_45.jpg', ['Page says stones ~2.5 mm; supplier line 3 mm'])
add('petal-flower-studs', 'YF7126', YF, ['11.5 mm tall × 9 mm wide', 'Weight 1.6 g'],
    ['Size: Approximately 11.5mm tall and 9mm wide', 'Weight: Approximately 1.6g'], '11.5 mm tall · 9 mm wide', 'A', 'r18_c8_46.jpg',
    ['Page says ~13 mm tall; supplier 11.5 mm'])
add('kiss-knot-bangle', 'YF4152', YF, ['Knot 10 mm', 'Weight 14.2 g'], ['Knot: Approximately 10mm', 'Weight: Approximately 14.2g'],
    'Knot 10 mm · 14 g', 'A', 'r20_c8_47.jpg', ['Page says X ~12 mm; supplier 10 mm'])
add('droplet-open-cuff', 'YF3791-B', YF, ['Teardrop end 12.3 mm', 'Weight 30 g'], ['Teardrop: Approximately 12.3mm', 'Weight: Approximately 30g'],
    'Teardrop 12.3 mm · 30 g', 'A', 'r23_c8_48.jpg')
add('droplet-open-ring', 'YF3791-R', YF, ['Teardrop end 6.6 mm', 'Weight 4.6 g'], ['Teardrop: Approximately 6.6mm', 'Weight: Approximately 4.6g'],
    'Teardrop 6.6 mm · open, adjustable', 'A', 'r23_c8_48.jpg', ['Page says teardrop ~9 mm; supplier 6.6 mm'])
add('roman-numeral-trio-ring', 'YF2931', YF, ['Bands 3.1, 3.3 and 3.9 mm wide', 'Weight 9 g', 'Sizes 6 to 9'],
    ['Bands: Three bands, approximately 3.1mm, 3.3mm and 3.9mm wide', 'Weight: Approximately 9g the set'], 'Three bands · 3.1, 3.3, 3.9 mm', 'A', 'r26_c8_49.jpg',
    ['Page says height ~16 mm; supplier gives each band width (and a 17 mm mark)'])
add('mint-pear-drop-earrings', 'YF7034', YF, ['18 mm long', 'Green pear 7 mm', 'Weight 2.7 g'],
    ['Length: Approximately 18mm', 'Stone: Mint green pear, approximately 7mm', 'Weight: Approximately 2.7g'], '18 mm long · 7 mm stone', 'A', 'r27_c8_50.jpg',
    ['Page says ~22 mm long and ~9 mm stone; supplier 18 mm and 7 mm'])
add('baguette-tennis-necklace', 'YF3165-NE', YF, ['Length 36 cm', '6 mm wide', 'Weight 12 g'],
    ['Length: Approximately 36cm', 'Width: Approximately 6mm', 'Weight: Approximately 12g'], '36 cm · sits close at the base of the neck', 'N', None,
    ['Page says ~40 cm; supplier 36 cm. A 36 cm necklace is choker length'], ['Supplier photo shows black and green stones, not our colours, so a drawn guide is used'])
add('baguette-tennis-bracelet', 'YF3165-BR', YF, ['Length 17 cm', '6 mm wide', 'Weight 8 g'],
    ['Width: Approximately 6mm', 'Weight: Approximately 8g'], '17 cm · fits wrists about 14.5–15.5 cm', 'W', None)
add('crystal-baguette-eternity-ring', 'YF2604', YF, ['8 mm wide', 'Weight 5.4 g', 'Sizes 6, 7, 8'],
    ['Width: Approximately 8mm', 'Weight: Approximately 5.4g'], 'Band 8 mm wide · US 6, 7, 8', 'A', 'r36_c8_68.jpg',
    ['Page says width ~5 mm; supplier 8 mm'])
add('chain-drop-dome-ring', 'YF8086', YF, ['Band 4.9 mm', 'Pear drop 6.3 mm', 'Weight 6.2 g'],
    ['Band: Approximately 4.9mm wide', 'Drop: Pear cut stone, approximately 6.3mm', 'Weight: Approximately 6.2g'], 'Band 4.9 mm · pear 6.3 mm', 'A', 'r37_c8_53.jpg',
    ['Page says dome ~6 mm and pear ~7 mm; supplier 4.9 mm and 6.3 mm'])
add('watch-link-ring', 'YF2645', YF, ['7.5 mm wide', 'Weight 5 g', 'Sizes 6 to 9'], ['Width: Approximately 7.5mm', 'Weight: Approximately 5g'],
    'Band 7.5 mm wide · US 6, 7, 8', 'A', 'r38_c8_54.jpg', ['Page says width ~11 mm; supplier 7.5 mm'])
add('crystal-pear-ear-cuff', 'YF3652-WHT', YF, ['12.8 mm across', 'Pear 7.8 mm', 'Weight 3.3 g'],
    ['Size: Approximately 12.8mm across', 'Stone: Pear cut, approximately 7.8mm', 'Weight: Approximately 3.3g'], '12.8 mm across · 7.8 mm stone', 'A', 'r40_c8_55.jpg')
add('emerald-square-ear-cuff', 'YF3652-GRN', YF, ['12.8 mm across', 'Square stone 5.1 mm', 'Weight 3 g'],
    ['Size: Approximately 12.8mm across', 'Weight: Approximately 3g'], '12.8 mm across · 5.1 mm stone', 'A', 'r40_c8_55.jpg')
add('marquise-drop-choker', 'YF7059', YF, ['Length 41 + 5 cm', 'Marquise 12.3 mm', 'Drop marked 14.7 mm', 'Weight 9.3 g'],
    ['Length: 41cm plus a 5cm extender', 'Stone: Marquise cut, approximately 12.3mm', 'Weight: Approximately 9.3g'], '41 + 5 cm · 12.3 mm marquise', 'A', 'r43_c8_57.jpg',
    ['Page says marquise ~10 mm; supplier 12.3 mm', 'Page says drop ~6 cm; supplier marks 14.7 mm, so measure one'], [], True)
add('mesh-band-ring', 'YF3558', YF, ['8 mm wide', 'Weight 3.2 g', 'Sizes 6 to 9'], ['Width: Approximately 8mm', 'Weight: Approximately 3.2g'],
    'Band 8 mm wide · US 6, 7, 8', 'A', 'r44_c8_58.jpg', ['Page says width ~10 mm; supplier 8 mm'])
add('duo-link-necklace', 'YF8079-NEC', YF, ['Length 41 + 5 cm', 'Links 7 mm wide', 'Weight 21.4 g'],
    ['Length: 41cm plus a 5cm extender', 'Links: Approximately 7mm wide', 'Weight: Approximately 21.4g'], '41 + 5 cm · 7 mm links', 'A', 'r46_c8_60.jpg',
    ['Page says ~45 cm; supplier 41 cm + 5 cm extender'])
add('duo-link-bracelet', 'YF8079-BRA', YF, ['Length 17 + 5 cm', 'Links 7 mm wide', 'Weight 9.6 g'],
    ['Length: 17cm plus a 5cm extender', 'Weight: Approximately 9.6g'], '17 + 5 cm · 7 mm links', 'A', 'r47_c8_59.jpg',
    ['Page says ~18 cm; supplier 17 cm + 5 cm extender'])
add('triple-coil-wrap-bangle', 'YF3937', YF, ['6 cm across inside', 'End caps 8 mm and 4 mm'],
    ['Inner width: Approximately 6cm', 'Ends: Pave caps, approximately 8mm'], '6 cm across inside', 'A', 'r48_c8_61.jpg')
add('ribbon-bead-bracelet', 'YF8156', YF, ['Bow 10 × 5.5 mm', 'Length 16–19 cm', 'Weight 2 g'], ['Weight: Approximately 2g'],
    '16–19 cm · bow 10 mm', 'A', 'r50_c8_62.jpg')
add('baroque-shell-bracelet', 'YF3925', YF, ['Length 21 cm', 'Pearls 9–11 mm', 'Toggle 12 mm', 'Weight 27.6 g'],
    ['Length: Approximately 21cm', 'Pearls: Approximately 9 to 11mm', 'Clasp: Toggle, approximately 12mm', 'Weight: Approximately 27.6g'],
    '21 cm · pearls 9–11 mm', 'A', 'r51_c8_63.jpg', ['Page has no size at all'])
add('bold-nocturne-chain', 'YF5144', YF, ['Length 46 + 5 cm', 'Links 10 mm', 'Clasp 11.7 mm', 'Weight 47.6 g'], [],
    '46 + 5 cm · 10 mm links', 'A', 'r53_c8_64.jpg', [], ['Page already matches the supplier'])
add('bold-nocturne-bracelet', 'YF5144-BRA', YF, ['Length 20 + 3 cm', 'Weight 20.6 g'], [], '20 + 3 cm', 'A', 'r53_c8_64.jpg', [], ['Page already matches the supplier'])
add('bold-nocturne-drops', 'YF5144-EAR', YF, ['23 mm long', 'Weight 11.8 g'], ['Length: Approximately 23mm', 'Weight: Approximately 11.8g the pair'],
    '23 mm long', 'A', 'r53_c8_64.jpg', ['Page says ~30 mm; supplier 23 mm'])
add('halo-curve-ring', 'YF8453', YF, ['Inner diameter 17 mm', 'Band 1.5 mm', 'Stone 11.8 mm', 'Weight 4 g'], [],
    '17 mm inside · about US 6½', 'A', 'r55_c8_65.jpg', [], ['Page already matches the supplier'])
add('star-point-band', 'YF5214', YF, ['6 mm wide', 'Weight 5.2 g', 'Sizes 6, 7, 8'], ['Width: Approximately 6mm', 'Weight: Approximately 5.2g'],
    'Band 6 mm wide', 'A', 'r56_c8_66.jpg', [], ['Store has a Metal option but no Size option, while the page says sizes are confirmed at order; the supplier offers US 6, 7, 8'])
add('north-star-bangle', 'YF5204', YF, ['5.8 mm wide', 'Weight 19.2 g'], ['Width: Approximately 5.8mm', 'Weight: Approximately 19.2g'],
    'Bangle 5.8 mm wide', 'A', 'r58_c8_67.jpg')
add('baguette-huggies', 'YF3923', YF, ['Hoop 15 mm', 'Stone row 4.4 mm', 'Weight 3.3 g'],
    ['Size: Approximately 15mm', 'Stones: Baguette row, approximately 4.4mm wide', 'Weight: Approximately 3.3g'], 'Hoop 15 mm · 4.4 mm stone row', 'A', 'r61_c8_69.jpg',
    ['Page says ~18 mm; supplier 15 mm'])
add('baguette-eternity-band', 'YF3143', YF, ['6.8 mm wide', 'Weight 3.8 g', 'Sizes 6 to 9'], ['Width: Approximately 6.8mm', 'Weight: Approximately 3.8g'],
    'Band 6.8 mm wide · US 6, 7, 8', 'A', 'r65_c8_71.jpg', ['Page says width ~5 mm; supplier 6.8 mm'], ['Supplier photo shows clear stones; the listing offers ruby, emerald and amethyst'])
add('serpentine-whisper-chain', 'YF8439', YF, ['Length 40 + 5 cm', 'Weight 10 g'], [], '40 + 5 cm · base of the neck', 'N', None, [], ['Page already matches the supplier'])
add('serpentine-whisper-chain-silver', 'YF8439-SLV', YF, ['Length 40 + 5 cm', 'Weight 10 g'], [], '40 + 5 cm · base of the neck', 'N', None, [], ['Page already matches the supplier'])
add('riviere-eternal-bracelet', 'YF7085', YF, ['5 mm wide', 'Length 18 cm', 'Weight 6.3 g'], ['Weight: Approximately 6.3g'], '18 cm · fits wrists about 15.5–16.5 cm', 'W', None,
    [], ['Supplier photo shows oval coloured stones, while the page describes 3 mm round clear stones and a buckle; confirm it is the same piece'])
add('birthstone-heart-necklace', 'heart birthstone', YF, ['Length 45 cm', 'Pendant 4.3 mm', 'Weight 1.8 g'], [], '', None, None,
    ['Page says ~40 cm plus extender; supplier 45 cm'], ['Supplier photo shows a bar pendant, not a heart; measure before changing'], True)

# ── KAVNAR: sizes typed in the quotation ────────────────────────────────────
add('aqua-heart-drops-silver', 'WE22108C3', KV, ['29 mm long'], ['Length: Approximately 29mm'], 'Drop 29 mm, post to tip', 'B', None, ['Page has no size'])
add('quatrefoil-eclat-studs', 'FE03783B', KV, ['15 mm'], ['Size: Approximately 15mm'], 'Stud 15 mm, tip to tip', 'B', None, ['Page has no size'])
add('bold-dome-huggies', 'E20057O', KV, ['16 mm'], ['Size: Approximately 16mm across'], 'Hoop 16 mm across', 'B', None, ['Page has no size'])
add('torsade-huggies', 'E15697O', KV, ['20 × 18 mm'], ['Size: Approximately 20mm by 18mm'], '20 × 18 mm', 'B', None, ['Page has no size'])
add('verdant-circlet-studs', 'FE02847B', KV, ['16.8 mm'], ['Size: Approximately 16.8mm'], '16.8 mm tall', 'B', None, ['Page says height ~20 mm; supplier 16.8 mm'])
add('verdant-drop-earrings', 'E21572E1', KV, ['20 × 8 mm'], ['Size: Approximately 20mm long and 8mm wide'], '20 mm long · 8 mm wide', 'B', None,
    ['Page says drop ~25 mm and stone ~9 mm; supplier 20 × 8 mm'])
add('ribbon-bow-earrings', 'E16075B', KV, ['12 mm'], ['Size: Approximately 12mm'], 'Bow 12 mm', 'B', None, ['Page says ~15 mm wide; supplier 12 mm'])
add('textured-gold-hoops', 'FE03586B', KV, ['20 × 20 mm'], ['Size: Approximately 20mm across'], 'Hoop 20 mm', 'B', None, ['Page says ~22 mm; supplier 20 mm'])
add('baguette-arc-hoops', 'WE14387B', KV, ['5.2 cm'], ['Size: Approximately 52mm across'], 'Hoop 52 mm', 'B', None,
    ['Page says ~20 mm across; supplier 5.2 cm (52 mm). Check which is right before anything goes live'], [], True)
add('solitaire-whisper-studs', 'E16355C', KV, ['9 mm'], ['Size: Approximately 9mm square'], 'Stud 9 mm', 'B', None, ['Page says ~12 mm square; supplier 9 mm'])
add('brushed-gold-huggies', 'E14776S', KV, ['14 × 9.8 mm'], ['Size: Approximately 14mm by 9.8mm'], '14 × 9.8 mm', 'B', None,
    ['Page says ~12 mm across; supplier 14 × 9.8 mm'], ['Supplier photo shows brushed bean studs; the page calls them huggies'])
add('silver-drop-earrings', 'E16676C', KV, ['44 mm long'], ['Length: Approximately 44mm'], 'Drop 44 mm', 'B', None, ['Page says ~40 mm; supplier 44 mm'])
add('pearl-blossom-earrings', 'E20997C', KV, ['13.5 × 12 mm'], ['Size: Approximately 13.5mm by 12mm'], '13.5 × 12 mm', 'B', None,
    ['Page says ~18 mm tall; supplier 13.5 × 12 mm'])
add('pearl-point-studs', 'E19263B', KV, ['18.5 mm'], ['Size: Approximately 18.5mm across'], 'Stud 18.5 mm', 'B', None, ['Page says ~16 mm; supplier 18.5 mm'])
add('prism-riviere-bracelet', 'B00681C', KV, ['Length 18 cm'], ['Length: 18cm'], '18 cm', 'W', None, ['Page says 15–19 cm adjustable links; supplier 18 cm'])
add('cushion-halo-ring', 'WR20902K8', KV, ['21 mm tall', 'Inner diameter 17 mm'], ['Inner diameter: Approximately 17mm (between US 6 and 7)'],
    '17 mm inside · about US 6½', 'R', None, ['Page says US 7 (17.3 mm); supplier 17 mm'])
add('blush-cluster-ring', 'WR10914B2', KV, ['21 mm tall', 'Inner diameter 17 mm'], ['Inner diameter: Approximately 17mm (between US 6 and 7)'],
    '17 mm inside · about US 6½', 'R', None, ['Page says US 7, fixed, not adjustable; the supplier photo shows an open band'])
add('rose-verdant-band', 'R18345A1', KV, ['20.5 mm tall', 'Inner diameter 16.5 mm'], ['Inner diameter: Approximately 16.5mm (US 6) at rest, the open back eases a little larger'],
    '16.5 mm inside · US 6, open back', 'R', None)
add('verdant-eternity-band', 'WR23024K', KV, ['20.5 mm tall', 'Inner diameter 16.5 mm'], ['Inner diameter: Approximately 16.5mm at rest'],
    '16.5 mm inside · open back', 'R', None)
add('vintage-halo-ring', 'WR23569K8', KV, ['21 mm tall', 'Inner diameter 16.5 mm'], ['Inner diameter: Approximately 16.5mm (US 6)'],
    '16.5 mm inside · US 6', 'R', None, ['Page says US 7; supplier inner diameter 16.5 mm is US 6. A US 7 buyer would find it tight'])
add('whisper-pave-band', 'WR10170K7', KV, ['21 mm tall', 'Inner diameter 17 mm'], ['Inner diameter: Approximately 17mm (between US 6 and 7)'],
    '17 mm inside · about US 6½', 'R', None, ['Page says US 7'], ['The page describes an 8 mm stone in a 12 mm halo, copied from Cushion Halo Ring; the supplier photo shows a solitaire with pave shoulders'])
add('petite-pave-band', 'WR12518B', KV, ['20.5 mm tall', 'Inner diameter 17 mm'], ['Inner diameter: Approximately 17mm at rest'],
    '17 mm inside · open back', 'R', None)

add('pearl-nugget-hoops', 'WE25240B', KV, ['23 × 20.5 mm'], ['Size: Approximately 23mm tall and 20.5mm wide'], '23 × 20.5 mm', None, None,
    ['Page says ~22 mm across; supplier 23 × 20.5 mm'], ['Matched by photo: the listing SKU is our own code (N20-PEARL), the piece is KAVNAR WE25240B'])

# ── KAVNAR rows with no usable size: measure one in hand ───────────────────
for h, c, why in [
    ('woven-gold-hoops', 'E20267O', 'No size in the quotation; page says ~25 mm'),
    ('verdant-cushion-studs', 'E19712C', 'Quotation says 18 cm, impossible for a stud'),
    ('baguette-halo-drops', 'WE23818B', 'No size in the quotation'),
    ('petite-square-huggies', 'WE25284B1', 'Same piece as KAVNAR E15284B1 (matched by photo), whose row says 18 cm, impossible for a huggie'),
    ('pearl-circlet-studs', 'WE20796C', 'Not on this quotation'),
    ('petite-bow-studs', 'E17967C', 'No size in the quotation'),
    ('prism-cluster-studs-silver', 'E15838C1', 'No size in the quotation'),
    ('lilac-papillon-ring', 'WR11674B2', 'No size and no photo in the quotation'),
    ('pearl-ribbon-ring', 'FR03136B', 'No size in the quotation; page says US 7'),
]:
    add(h, c, KV, [], [], '', None, None, [why], [], True)

json.dump(P, open(os.path.join(os.environ.get('NF_WORK', '.'), 'sizing', 'data.json'), 'w'), indent=1)
from collections import Counter
print(len(P), Counter(p['card'] for p in P), 'conflicts', sum(1 for p in P if p['conflicts']), 'measure', sum(p['measure'] for p in P))
