"""Size-card upload helper.
  cards.py prep NAME h1 h2 ...      -> upload/NAME.json (rows) and prints stagedUploadsCreate variables
  cards.py post NAME RESULT.json    -> posts every file to its staged target
  cards.py attach NAME              -> writes upload/NAME-attach-K.json mutation docs (14 per doc)
"""
import json, os, subprocess, sys
S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad'
U = f'{S}/upload'
cmd, name = sys.argv[1], sys.argv[2]
if cmd == 'prep':
    ids = {p['handle']: p['id'] for p in json.load(open('/home/user/naira-scroll-3790bf3e/shopify/sizing/backup/products-media-2026-10-21.json'))}
    titles = {p['handle']: p['title'] for p in json.load(open(f'{S}/catalogue/products.json'))}
    titles.update(json.load(open(f'{S}/sizing/draft-titles.json')))
    rows = []
    for h in sys.argv[3:]:
        f = f'{S}/sizing/cards/{h}.jpg'
        rows.append({'handle': h, 'id': ids[h], 'title': titles[h], 'file': f, 'size': os.path.getsize(f)})
    json.dump(rows, open(f'{U}/{name}.json', 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({'input': [{'filename': f"{r['handle']}-size-guide.jpg", 'mimeType': 'image/jpeg', 'resource': 'IMAGE', 'httpMethod': 'POST', 'fileSize': str(r['size'])} for r in rows]}, separators=(',', ':')))
elif cmd == 'post':
    rows = json.load(open(f'{U}/{name}.json'))
    res = json.load(open(sys.argv[3]))
    targets = res['data']['stagedUploadsCreate']['stagedTargets'] if 'data' in res else res['stagedUploadsCreate']['stagedTargets']
    targets = targets[:len(rows)]  # padding targets (pad-N.jpg) are ignored
    ok = 0
    for r, t in zip(rows, targets):
        assert t['resourceUrl'].endswith(f"/{r['handle']}-size-guide.jpg"), r['handle']
        tf = f"{U}/t-{r['handle']}.json"
        json.dump({'url': t['url'], 'parameters': t['parameters']}, open(tf, 'w'))
        code = subprocess.run(['python3', f'{U}/post.py', tf, r['file']], capture_output=True, text=True).stdout.strip()
        r['resourceUrl'] = t['resourceUrl']; r['post'] = code; ok += code == '201'
        if code != '201': print('FAIL', r['handle'], code)
    json.dump(rows, open(f'{U}/{name}.json', 'w'), indent=1, ensure_ascii=False)
    print('posted', ok, '/', len(rows))
elif cmd == 'attach':
    rows = json.load(open(f'{U}/{name}.json'))
    for ci in range(0, len(rows), 14):
        ch = rows[ci:ci + 14]
        decl, body, v = [], [], {}
        for i, r in enumerate(ch):
            decl.append(f'$p{i}: ProductUpdateInput!, $m{i}: [CreateMediaInput!]')
            body.append(f'a{i}: productUpdate(product: $p{i}, media: $m{i}) {{ product {{ handle }} userErrors {{ field message }} }}')
            v[f'p{i}'] = {'id': r['id']}
            v[f'm{i}'] = [{'originalSource': r['resourceUrl'], 'alt': f"Size guide — {r['title']}", 'mediaContentType': 'IMAGE'}]
        doc = {'query': 'mutation attach(' + ', '.join(decl) + ') { ' + ' '.join(body) + ' }', 'variables': v}
        out = f'{U}/{name}-attach-{ci // 14}.json'
        json.dump(doc, open(out, 'w'), ensure_ascii=False)
        print(out)
        print(doc['query']); print(json.dumps(v, ensure_ascii=False))
