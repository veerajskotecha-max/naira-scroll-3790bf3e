# moves.py <D>  — the productReorderMedia moves that put each listing's new photos in place:
# after its own photos (a gold or silver photo after the last of its colour), then the gift box, then the size guide
import json, os, sys
D = sys.argv[1]
cur = json.load(open(os.path.join(D, 'current.json')))
parts, total = [], 0
for pid, items in cur.items():
    tag = {i.split(':')[0]: (i.split(':') + [''])[1] for i in items}
    order = [i.split(':')[0] for i in items]
    body = [m for m in order if tag[m] in ('', 'g', 's')]
    for m in [m for m in order if tag[m].startswith('n')]:
        colour = tag[m][1:]
        same = [k for k, x in enumerate(body) if colour and tag[x].lstrip('n') == colour]
        body.insert(same[-1] + 1 if same else len(body), m)
    want = body + [m for m in order if tag[m] == 'B'] + [m for m in order if tag[m] == 'Z']
    assert sorted(want) == sorted(order) and want[0] == order[0], pid
    sim, moves = list(order), []
    for k, m in enumerate(want):
        if sim[k] != m:
            sim.remove(m); sim.insert(k, m); moves.append((m, k))
    assert sim == want
    if moves:
        mv = ', '.join(f'{{id: "gid://shopify/MediaImage/{m}", newPosition: "{k}"}}' for m, k in moves)
        parts.append(f'r{len(parts)}: productReorderMedia(id: "gid://shopify/Product/{pid}", moves: [{mv}]) {{ job {{ id }} mediaUserErrors {{ field message }} }}')
        total += len(moves)
    json.dump(want, open(os.path.join(D, f'want-{pid}.json'), 'w'))
doc = 'mutation PlaceDrivePhotos {\n' + '\n'.join(parts) + '\n}'
open(os.path.join(D, 'reorder.graphql'), 'w').write(doc)
print(len(parts), 'listings to reorder,', total, 'moves,', len(doc), 'chars')
