"""Write the ship map (card -> commits) for the session branch. Usage: python3 -I cards_md.py page-data.json out.md"""
import json
import sys

d = json.load(open(sys.argv[1]))
L = ['# Owner-review patches: what each approval card ships', '',
     'Base: main `ddb72b7`. Branches are in `owner-patches.bundle` (`git fetch owner-patches.bundle "own-*:own-*"`).',
     'Approving a card means cherry-picking its commits, in this order, onto main. Ship the approved cards of a group in the order they are listed (the branch order): some cards only apply after an earlier one. Nothing here is on main or live.', '']
for g in d['patches']:
    L += [f"## {g['title']} (`{g['branch']}` at `{g['head']}`)", '', f"Check: {g['check']['text']}", '',
          '| Card | Commits (in order) | Optional / option | Needs |', '|---|---|---|---|']
    for it in g['items']:
        tag = 'optional' if it['optional'] else (it['pick'] + ', pick one' if it['pick'] else '')
        if it.get('squashInto'):
            tag += f"; a fixup: if approved, squash it into the \"{next(x['title'] for x in g['items'] if x['id'] == it['squashInto'])}\" commit"

        needs = '; '.join(x['title'] for x in it['deps'])
        L.append(f"| {it['title'].replace('|', '/')} | {' '.join('`'+c+'`' for c in it['commits'])} | {tag} | {needs.replace('|', '/')} |")
    if g['skipped']:
        L += ['', 'Left out on purpose:', ''] + [f"- {s['finding']}: {s['why']}" for s in g['skipped']]
    L.append('')
open(sys.argv[2], 'w').write('\n'.join(L))
print(sys.argv[2], sum(len(g['items']) for g in d['patches']), 'cards')
