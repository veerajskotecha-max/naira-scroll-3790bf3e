# attachdoc.py <D> <sha>  — one productUpdate per listing adding its manifest photos (raw GitHub URLs pinned to <sha>);
# inputs travel as variables, which the 16 KB document limit does not count
import json, os, sys
D, sha = sys.argv[1], sys.argv[2]
rows = json.load(open(os.path.join(D, 'manifest.json')))
ids = json.load(open(os.path.join(D, 'products.json')))
base = f"https://raw.githubusercontent.com/veerajskotecha-max/naira-scroll-3790bf3e/{sha}/shopify/photos/drive-2026-10-28/"
by = {}
for r in rows: by.setdefault(r['handle'], []).append(r)
decl, body, v = [], [], {}
for k, (h, rs) in enumerate(by.items()):
    decl.append(f'$m{k}: [CreateMediaInput!]')
    body.append(f'p{k}: productUpdate(product: {{id: "gid://shopify/Product/{ids[h]}"}}, media: $m{k}) {{ product {{ handle media(last: {len(rs)}) {{ nodes {{ id alt status }} }} }} userErrors {{ field message }} }}')
    v[f'm{k}'] = [{'originalSource': base + r['file'] + '.jpg', 'alt': r['alt'], 'mediaContentType': 'IMAGE'} for r in rs]
doc = 'mutation AddDrivePhotos(' + ', '.join(decl) + ') {\n' + '\n'.join(body) + '\n}'
open(os.path.join(D, 'attach.graphql'), 'w').write(doc)
json.dump(v, open(os.path.join(D, 'attach-vars.json'), 'w'), ensure_ascii=False)
print(len(by), 'listings', sum(len(x) for x in by.values()), 'photos | document', len(doc), 'chars')
