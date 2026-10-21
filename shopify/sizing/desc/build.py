"""Rebuild product descriptions: size lines first in Details, supplier-corrected numbers in the
copy, the size guide photo inside the Details section, and house-format copy for listings that
had only a one-line description.

  python3 build.py            -> desc/new.json  {handle: {id, html, changed, notes}}
"""
import html as H
import json
import re

S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad'
live = json.load(open(f'{S}/desc/live.json'))

STEEL_CARE = ('Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and '
              'harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.')
GENTLE_CARE = ('Keep it dry and away from perfume and harsh chemicals. Wipe with a soft dry cloth and store '
               'it in its pouch so pieces do not scratch each other.')
BOX = 'You will receive your piece in a Naira Petite box.'

# Labels that answer "how big is it", in the order they lead the Details list.
SIZE_ORDER = ['Size', 'Sizes', 'Length', 'Drop', 'Height', 'Width', 'Inner diameter', 'Inner width',
              'Necklace one', 'Necklace two', 'Bands', 'Weight']

# --- edits to existing descriptions ------------------------------------------------------------
# li: (label or exact old line) -> new line, or None to drop.   add: lines to add.
# intro: (old text, new text) replacements in the copy above Details (old must be present).
EDITS = {
    'tubogas-dome-ring': dict(
        li={'Width': 'Width: Approximately 5.8mm'}, add=['Weight: Approximately 2.7g'],
        intro=[('A wide ring of flexible tubogas, about 10mm across the finger,', 'A ring of flexible tubogas, about 5.8mm wide on the finger,')]),
    'marquise-layering-set': dict(
        li={'Necklace one': 'Necklace one: 40cm plus a 5cm extender, marquise stone approximately 13mm',
            'Necklace two': 'Necklace two: Y-lariat, 45cm plus a 5cm extender, the Y-drop approximately 9cm'},
        intro=[('a fine 1.2mm cable chain of about 40cm holding a single marquise cubic zirconia of roughly 10 x 5mm.',
                'a fine 1.2mm cable chain of 40cm, plus a 5cm extender, holding a single marquise cubic zirconia of about 13mm.'),
               ('The longer one is a Y-lariat scattered with 5mm marquise stations that falls just below it.',
                'The longer one is a 45cm Y-lariat, plus a 5cm extender, with marquise stations and a drop of about 9cm, so it falls just below the first.')]),
    'silk-mesh-cuff': dict(
        li={'Mesh': 'Mesh: Rounded tube of fine woven mesh, approximately 19mm wide'}, add=['Weight: Approximately 32g'],
        intro=[('about 15mm wide', 'about 19mm wide')]),
    'fine-tennis-bracelet': dict(
        li={'Stones': 'Stones: Round brilliant clear cubic zirconia, the line approximately 3mm wide'}, add=['Weight: Approximately 4.7g'],
        intro=[('each about 2.5mm and each in its own gold claw cup', 'the line about 3mm wide, each stone in its own gold claw cup')]),
    'petal-flower-studs': dict(
        li={'Size': 'Size: Approximately 11.5mm tall and 9mm wide'}, add=['Weight: Approximately 1.6g']),
    'kiss-knot-bangle': dict(
        li={'Front': 'Front: The two ends cross under one smooth polished X, approximately 10mm'}, add=['Weight: Approximately 14.2g']),
    'droplet-open-ring': dict(
        li={'Ends': 'Ends: A round ball and a long teardrop, the teardrop approximately 6.6mm'}, add=['Weight: Approximately 4.6g']),
    'roman-numeral-trio-ring': dict(
        li={'Height': None}, add=['Bands: Three bands, approximately 3.1mm, 3.3mm and 3.9mm wide', 'Weight: Approximately 9g the set']),
    'mint-pear-drop-earrings': dict(
        li={'Length': 'Length: Approximately 18mm',
            'Stones': 'Stones: Three small clear pear cut cubic zirconia leading to one pale mint green pear, approximately 7mm'},
        add=['Weight: Approximately 2.7g'],
        intro=[('About 22mm long', 'About 18mm long')]),
    'baguette-tennis-necklace': dict(
        li={'Length': 'Length: Approximately 36cm, choker length',
            'Stone': 'Stone: Rectangular baguette cut cubic zirconia set crosswise, the line approximately 6mm wide'},
        add=['Weight: Approximately 12g'],
        intro=[('About 5mm wide, it sits close at the base of the neck.', 'About 6mm wide and 36cm long, it sits close at the base of the neck.')]),
    'crystal-baguette-eternity-ring': dict(li={'Width': 'Width: Approximately 8mm'}, add=['Weight: Approximately 5.4g']),
    'chain-drop-dome-ring': dict(
        li={'Band': 'Band: Polished dome, approximately 4.9mm wide', 'Drop': 'Drop: One pear cut clear cubic zirconia, approximately 6.3mm'},
        add=['Weight: Approximately 6.2g']),
    'watch-link-ring': dict(li={'Width': 'Width: Approximately 7.5mm'}, add=['Weight: Approximately 5g']),
    'marquise-drop-choker': dict(
        li={'Stone': 'Stone: One marquise cut clear cubic zirconia, approximately 12.3mm, set sideways at the front'},
        add=['Length: 41cm plus a 5cm extender', 'Weight: Approximately 9.3g']),
    'mesh-band-ring': dict(li={'Width': 'Width: Approximately 8mm'}, add=['Weight: Approximately 3.2g']),
    'duo-link-necklace': dict(
        li={'Length': 'Length: 41cm plus a 5cm extender'}, add=['Links: Approximately 7mm wide', 'Weight: Approximately 21.4g']),
    'duo-link-bracelet': dict(li={'Length': 'Length: 17cm plus a 5cm extender'}, add=['Weight: Approximately 9.6g']),
    'baroque-shell-bracelet': dict(
        li={'Pearls': 'Pearls: Flat baroque shell pearls, approximately 9 to 11mm, each a little different in shape and lustre',
            'Closure': 'Closure: Gold tone toggle clasp, T bar through ring, approximately 12mm'},
        add=['Length: Approximately 21cm', 'Weight: Approximately 27.6g']),
    'bold-nocturne-drops': dict(li={'Length': 'Length: Approximately 23mm'}, add=['Weight: Approximately 11.8g the pair']),
    'baguette-huggies': dict(
        li={'Size': 'Size: Approximately 15mm across'}, add=['Stones: Baguette row, approximately 4.4mm wide', 'Weight: Approximately 3.3g']),
    'baguette-eternity-band': dict(li={'Width': 'Width: Approximately 6.8mm'}, add=['Weight: Approximately 3.8g'],
                                   intro=[('About 5mm wide.', 'About 6.8mm wide.')]),
    'verdant-circlet-studs': dict(li={'Height': 'Height: Approximately 16.8mm'},
                                  intro=[('Each stud stands about 20mm tall', 'Each stud stands about 16.8mm tall')]),
    'verdant-drop-earrings': dict(
        li={'Drop': 'Size: Approximately 20mm long and 8mm wide',
            'Stone': 'Stone: One cushion cut cubic zirconia in vivid mint turquoise green, approximately 8mm'},
        intro=[('Each earring drops about 25mm:', 'Each earring drops about 20mm:'), ('stone of about 9mm', 'stone of about 8mm')]),
    'ribbon-bow-earrings': dict(li={'Size': 'Size: Approximately 12mm'},
                                intro=[('These studs measure about 15mm wide', 'These studs measure about 12mm across')]),
    'textured-gold-hoops': dict(li={'Size': 'Size: Approximately 20mm across'},
                                intro=[('measure about 22mm across', 'measure about 20mm across')]),
    'baguette-arc-hoops': dict(li={'Size': 'Size: Approximately 52mm across, a statement size'},
                               intro=[('These open hoops measure about 20mm across', 'These open hoops measure about 52mm across')]),
    'solitaire-whisper-studs': dict(li={'Size': 'Size: Approximately 9mm square'},
                                    intro=[('Each stud measures about 12mm square', 'Each stud measures about 9mm square')]),
    'brushed-gold-huggies': dict(li={'Size': 'Size: Approximately 14mm by 9.8mm'},
                                 intro=[('These huggie hoops measure about 12mm across', 'These huggie hoops measure about 14mm by 9.8mm')]),
    'silver-drop-earrings': dict(li={'Length': 'Length: Total drop approximately 44mm'},
                                 intro=[('These drops fall about 40mm from the ear', 'These drops fall about 44mm from the ear')]),
    'pearl-blossom-earrings': dict(li={'Size': 'Size: Approximately 13.5mm by 12mm'},
                                   intro=[('Each stud stands about 18mm tall', 'Each stud measures about 13.5mm by 12mm')]),
    'pearl-point-studs': dict(li={'Size': 'Size: Approximately 18.5mm across'},
                              intro=[('These studs measure about 16mm across', 'These studs measure about 18.5mm across')]),
    'prism-riviere-bracelet': dict(li={'Length': 'Length: 18cm'}),
    'cushion-halo-ring': dict(li={'Size': 'Size: Inner diameter approximately 17mm, between US 6 and 7'},
                              intro=[('Made in a fixed US size 7, it works', 'Made in a fixed size of about 17mm inside, between US 6 and 7, it works')]),
    'blush-cluster-ring': dict(li={'Size': 'Size: Inner diameter approximately 17mm, between US 6 and 7'},
                               intro=[('Made in a fixed US size 7, it is', 'Made in a fixed size of about 17mm inside, between US 6 and 7, it is')]),
    'vintage-halo-ring': dict(li={'Size': 'Size: US 6, inner diameter approximately 16.5mm'},
                              intro=[('Made in US size 7, it wears', 'Made in US size 6, about 16.5mm inside, it wears')]),
    'whisper-pave-band': dict(li={'Size': 'Size: Inner diameter approximately 17mm, between US 6 and 7'},
                              intro=[('Made in US size 7, it suits', 'Made in a fixed size of about 17mm inside, between US 6 and 7, it suits')]),
    'pearl-nugget-hoops': dict(li={'Size': 'Size: Approximately 23mm tall and 20.5mm wide'}),
    'droplet-open-cuff': dict(li={'Ends': 'Ends: A round ball, approximately 9mm, and a smooth teardrop, approximately 12.3mm'},
                              add=['Weight: Approximately 30g']),
    'baguette-tennis-bracelet': dict(
        li={'Stone': 'Stone: Rectangular baguette cut cubic zirconia set crosswise, the line approximately 6mm wide'},
        add=['Weight: Approximately 8g'], intro=[('About 4 to 5mm wide:', 'About 6mm wide:')]),
    'crystal-pear-ear-cuff': dict(
        li={'Size': 'Size: Approximately 12.8mm across', 'Stone': 'Stone: One pear cut clear cubic zirconia, approximately 7.8mm, in gold claws'},
        add=['Weight: Approximately 3.3g']),
    'emerald-square-ear-cuff': dict(li={'Size': 'Size: Approximately 12.8mm across'}, add=['Weight: Approximately 3g']),
    'triple-coil-wrap-bangle': dict(add=['Inner width: Approximately 6cm']),
    'star-point-band': dict(add=['Width: Approximately 6mm', 'Weight: Approximately 5.2g']),
    'north-star-bangle': dict(li={'Band': 'Band: Approximately 5.8mm wide, mirror polished'}, add=['Weight: Approximately 19.2g'],
                              intro=[('about 6mm wide and mirror polished', 'about 5.8mm wide and mirror polished')]),
    'riviere-eternal-bracelet': dict(add=['Weight: Approximately 6.3g']),
    'rose-verdant-band': dict(add=['Size: Inner diameter approximately 16.5mm (US 6) at rest, the open back eases a little larger']),
    'verdant-eternity-band': dict(li={'Size': 'Size: Inner diameter approximately 16.5mm at rest, open back adjusts from about US 6 to 8'}),
    'petite-pave-band': dict(li={'Size': 'Size: Inner diameter approximately 17mm at rest, open back adjusts from about US 6 to 8'}),
    'classic-solitaire-ring': dict(add=['Size: Inner diameter approximately 17mm, about US 6½']),
    'halo-curve-ring': dict(
        li={'Band': 'Band: Solid gold tone band, inner diameter approximately 17mm, metal approximately 1.5mm'},
        add=['Size: Inner diameter approximately 17mm, about US 6½'],
        intro=[('This solid gold band of about 17mm inner diameter', 'This solid gold tone band of about 17mm inner diameter')]),
    # pieces whose size sat under another label, so the size leads Details like everywhere else
    'clover-charm-necklace': dict(add=['Length: Approximately 42cm']),
    'first-light-set': dict(add=['Length: 42cm plus a 5cm extender']),
    'granule-dome-ring': dict(add=['Size: Open back, adjustable, fits about US 7']),
    'golden-duet-ring': dict(li={'Fit: Open band, inner diameter approximately 16.3mm': None},
                             add=['Sizes: US 6, 7 and 8 (choose above)']),
}

# --- house-format copy for listings that had a one-line description ----------------------------
FULL = {
    'bold-dome-huggies': dict(
        intro='A plain huggie with real presence. Each hoop measures about 16mm across, a full rounded dome of polished gold tone metal that catches the light along its whole curve, closed with a hinged snap so it clicks shut close to the lobe. No stones and no texture, just one confident shape that works from morning to evening.',
        tip='Wear them alone with your hair tucked back, or pair them with a small stud in a second piercing.',
        details=['Size: Approximately 16mm across', 'Profile: Rounded dome, plain polished', 'Closure: Hinged snap',
                 'Sold as: One pair', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'quatrefoil-eclat-studs': dict(
        intro='A clover that is all sparkle. Each stud is a four-lobed quatrefoil of about 15mm, every lobe filled edge to edge with micro pavé clear cubic zirconia set in gold tone metal, so the whole face reads as light. It sits flat on the lobe on a stud fitting, polished enough for every day and bright enough for an evening out.',
        tip='Let them be the only sparkle: a plain neckline and hair tucked behind the ear.',
        details=['Size: Approximately 15mm', 'Shape: Four-lobed quatrefoil', 'Stones: Micro pavé clear cubic zirconia',
                 'Fitting: Stud', 'Sold as: One pair', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'torsade-huggies': dict(
        intro='A twisted rope, turned into a hoop. Each huggie measures about 20mm by 18mm and carries a fine twisted rope texture all the way round, so the surface catches light in short bright lines instead of one smooth flash. Gold tone, close to the lobe and easy to wear every day.',
        tip='Pair them with a plain stud above for a simple stacked ear.',
        details=['Size: Approximately 20mm by 18mm', 'Surface: Twisted rope texture all the way round', 'Fitting: Huggie',
                 'Sold as: One pair', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'aqua-heart-drops-silver': dict(
        intro='A curve of light with a heart at the end. Each earring is an open C-shaped arc in silver tone metal, about 29mm long, set with round brilliant stones along the outer edge and upright baguettes along the inner wall, with a pale blue heart cut stone hanging point down from the lower tip. It moves a little as you turn, so the blue keeps catching the light.',
        tip='Wear them with your hair tucked behind the ear and a cool toned outfit so the blue reads.',
        details=['Length: Approximately 29mm', 'Shape: Open C-arc',
                 'Stones: Round brilliant and baguette clear cubic zirconia, with one pale blue heart cut stone',
                 'Sold as: One pair', 'Plating: Rhodium plated silver tone'], care=GENTLE_CARE),
    'torsade-pearl-cuff': dict(
        intro='A cable cuff, finished with pearls. A twisted gold tone cable runs about 17cm end to end and opens at the back, each end capped by a collar of two pavé rows and one large round white pearl, so the two pearls face each other across the opening. Slip it on sideways at the narrowest part of the wrist.',
        tip='Wear it alone on a bare wrist, or beside a slim watch for an everyday stack.',
        details=['Length: Approximately 17cm end to end, open back', 'Surface: Twisted cable',
                 'Ends: Two-row pavé collars, each finished with one round white pearl', 'Plating: 18k gold tone plated'],
        care=GENTLE_CARE),
    'molten-panel-bracelet': dict(
        intro='Flexible, flat and full of light. This 17cm bracelet is built from small oval gold tone plates laid in five staggered rows like brickwork, articulated so it moves and drapes around the wrist, and closed with a box clasp. It wears like a classic watch strap without the watch.',
        tip='Wear it alone on the wrist bone, or beside a fine chain bracelet for contrast.',
        details=['Length: 17cm', 'Construction: Small oval plates in five staggered rows, flexible', 'Closure: Box clasp',
                 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'verdant-cushion-studs': dict(
        intro='A green stone with a bright frame. Each stud holds one cushion cut green cubic zirconia at the centre, ringed by a halo of small round clear stones and set in gold tone metal. The green is cubic zirconia, not emerald, and the halo keeps it lit from every side.',
        tip='Wear them with an ivory or white outfit so the green reads clearly.',
        details=['Stone: Cushion cut green cubic zirconia', 'Halo: Small round clear cubic zirconia', 'Fitting: Stud',
                 'Sold as: One pair', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'baguette-halo-drops': dict(
        intro='Light above, a pearl below. Each earring is a small circle of channel set baguette cut clear cubic zirconia, with a round white pearl hanging just beneath it so it moves as you turn. Gold tone metal frames both. The shape is classic enough for a wedding function and quiet enough for dinner.',
        tip='Wear them with your hair up so the pearl swings freely.',
        details=['Top: Circle of channel set baguette cut clear cubic zirconia', 'Drop: One round white pearl',
                 'Sold as: One pair', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'petite-square-huggies': dict(
        intro='A huggie with corners. Each hoop is squared off, four straight sides joined by softly rounded corners, in polished gold tone metal that sits close to the lobe. The shape is small and neat, so it reads modern without being loud.',
        tip='Stack them with a round huggie in the next piercing to play the shapes off each other.',
        details=['Shape: Square with softly rounded corners', 'Finish: Polished', 'Fitting: Huggie', 'Sold as: One pair',
                 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'pearl-circlet-studs': dict(
        intro='A pearl, lit from the edges. Each stud holds a round white pearl at the centre, ringed by a halo of small round clear cubic zirconia in gold tone metal. Soft in the middle and bright at the rim, it suits office days and festive evenings alike.',
        tip='Wear them with a crisp collar or a saree blouse for an easy polished finish.',
        details=['Centre: Round white pearl', 'Halo: Small round clear cubic zirconia', 'Fitting: Stud', 'Sold as: One pair',
                 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'petite-bow-studs': dict(
        intro='A small bow, set with light. Each stud is a bow of gold tone ribbon, two loops and a centre knot, with small clear stones set along the ribbon so the shape sparkles as you move. Petite enough for every day and sweet enough for a birthday.',
        tip='Pair them with a ribbon in your hair or a soft knit for a gentle look.',
        details=['Shape: Bow with two loops and a centre knot', 'Stones: Small clear cubic zirconia set along the ribbon',
                 'Fitting: Stud', 'Sold as: One pair', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'prism-cluster-studs-silver': dict(
        intro='A small row of colour. Each stud is a gentle curve of coloured stones in silver tone metal: a purple princess cut, a pink baguette, a yellow emerald cut at the centre, then purple and pink again, with six tiny round white pearls tucked into the gaps. Playful and bright, and still delicate on the ear.',
        tip='Let them be the colour in an otherwise neutral outfit.',
        details=['Stones: Purple princess cut, pink baguette and yellow emerald cut cubic zirconia',
                 'Accents: Six tiny round white pearls', 'Shape: Curved cluster', 'Fitting: Stud', 'Sold as: One pair',
                 'Plating: Rhodium plated silver tone'], care=GENTLE_CARE),
    'lilac-papillon-ring': dict(
        intro='A butterfly, twice over. A solid four-wing butterfly in warm gold tone metal, its wings filled edge to edge with dense micro pavé of pale violet lilac stones in crisp bezels and a plain body bar between them, sits over an openwork frame whose larger butterfly outline is traced in tiny round clear stones. The shank is slim and plain, so the front does all the talking.',
        tip='Wear it alone on the middle finger as the one statement piece.',
        details=['Front: Four-wing butterfly in lilac micro pavé over an openwork butterfly frame of clear stones',
                 'Shank: Slim and plain', 'Plating: 18k gold tone plated'], care=GENTLE_CARE),
    'triple-dawn-cuff': dict(
        intro='Three lines, one cuff. A triple-layer cuff in bold polished gold tone, the three bands graduated so they sit together as one piece. Wear it as the statement and let everything else stay quiet.',
        tip='Wear it alone on a bare wrist with a sleeveless or three-quarter sleeve top.',
        details=['Style: Three graduated bands joined as one cuff', 'Finish: Polished', 'Plating: 18k gold tone plated',
                 'Material: 316L stainless steel', 'Wear: Waterproof and non-tarnish, hypoallergenic, nickel free and lead free'],
        care=STEEL_CARE),
}


def label(line):
    m = re.match(r'([^:]{1,40}):\s', line)
    return m.group(1).strip() if m else None


def size_rank(line):
    lb = label(line)
    # a size line names a measurement: "Drop: One larger pearl" is a design note, not a size
    if lb not in SIZE_ORDER or not re.search(r'\d', line.split(':', 1)[1]):
        return None
    return SIZE_ORDER.index(lb)


def order_details(lines):
    sized = sorted([l for l in lines if size_rank(l) is not None], key=size_rank)  # stable: same label keeps order
    return sized + [l for l in lines if size_rank(l) is None]


def li_html(lines):
    return '<ul>\n' + '\n'.join(f'<li>{H.escape(l, quote=False)}</li>' for l in lines) + '\n</ul>'


def size_img(v):
    if not v['size_guide']:
        return ''
    url = v['size_guide'].split('?')[0]
    return f'<p><img src="{url}" alt="Size guide — {H.escape(v["title"])}" width="420"></p>'


def render_full(v, f):
    return (f'<p>{H.escape(f["intro"], quote=False)}</p>'
            f'<p><strong>STYLING TIP:</strong> {H.escape(f["tip"], quote=False)}</p>'
            f'<p><strong>Details</strong></p>{li_html(order_details(f["details"]))}{size_img(v)}'
            f'<p><strong>Care</strong></p><p>{f["care"]}</p><p>{BOX}</p>')


DETAILS_RE = re.compile(r'(<p><strong>Details</strong></p>\s*)<ul>(.*?)</ul>', re.S)


def edit_existing(h, v, notes):
    src = v['html']
    m = DETAILS_RE.search(src)
    if not m:
        notes.append('no Details section; left as is')
        return src
    pre, post = src[:m.start()], src[m.end():]
    lines = [H.unescape(re.sub(r'<[^>]+>', '', x)).strip() for x in re.findall(r'<li>(.*?)</li>', m.group(2), re.S)]
    e = EDITS.get(h, {})
    for key, new in e.get('li', {}).items():
        hit = [i for i, l in enumerate(lines) if l == key or label(l) == key]
        if not hit:
            notes.append(f'MISSING li {key!r}')
            continue
        i = hit[0]
        if new is None:
            lines.pop(i)
        else:
            lines[i] = new
    have = {label(l) for l in lines}
    for new in e.get('add', []):
        if label(new) in have and label(new) not in ('Necklace one', 'Necklace two'):
            notes.append(f'kept existing {label(new)} line, skipped {new!r}')
            continue
        lines.append(new)
    for old, new in e.get('intro', []):
        if old not in pre:
            notes.append(f'MISSING intro text {old[:50]!r}')
            continue
        pre = pre.replace(old, new, 1)
    lines = order_details(lines)
    post = re.sub(r'<p><img [^>]*size-guide[^>]*></p>', '', post)  # idempotent re-runs
    return pre + m.group(1) + li_html(lines) + size_img(v) + post


out = {}
for h, v in live.items():
    notes = []
    if h in FULL:
        new = render_full(v, FULL[h])
    elif v['html'] and '<strong>Details</strong>' in v['html'] and (v['size_guide'] or h in EDITS):
        new = edit_existing(h, v, notes)
    elif v['html']:
        notes.append('no size guide yet; left as is')
        new = v['html']
    else:
        notes.append('no description to edit (draft or empty)')
        new = v['html']
    norm = lambda x: re.sub(r'\s+', '', x or '')
    out[h] = {'id': v['id'], 'status': v['status'], 'html': new, 'changed': norm(new) != norm(v['html']), 'notes': notes}
json.dump(out, open(f'{S}/desc/new.json', 'w'), indent=1, ensure_ascii=False)
print('changed', sum(o['changed'] for o in out.values()), 'of', len(out))
for h, o in out.items():
    if any(n.startswith('MISSING') or n.startswith('kept') for n in o['notes']):
        print(h, o['notes'])
