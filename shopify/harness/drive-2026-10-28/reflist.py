import json, sys, os
D = sys.argv[1]
nodes = json.load(open(os.path.join(D, 'live-nodes.json')))
rows = []
for p in nodes:
    if (p.get('vendor') or '').strip().lower() != 'naira petite': continue
    for i, e in enumerate(p['images']['edges']):
        url = e['node']['url']
        f = url.split('?')[0].split('/')[-1]
        rows.append({'handle': p['handle'], 'title': p['title'], 'i': i, 'url': url, 'file': f, 'alt': e['node'].get('altText')})
json.dump(rows, open(os.path.join(D, 'reflist.json'), 'w'))
with open(os.path.join(D, 'refurls.txt'), 'w') as fh:
    for r in rows:
        sep = '&' if '?' in r['url'] else '?'
        fh.write(f"{r['handle']}__{r['i']:02d}\t{r['url']}{sep}width=320\n")
print(len(rows), 'listing photos')
