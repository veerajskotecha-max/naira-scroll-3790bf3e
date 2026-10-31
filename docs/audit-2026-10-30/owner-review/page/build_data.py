"""Turn the owner-review workflow results plus questions.json into page-data.json.

Usage: python3 -I build_data.py <build result.json> <final-check result.json|journal.jsonl|-> <questions.json> <out.json>

Each card is one parent commit plus its 'fixup:' commits (matched on the git subject in
/tmp/own-<key>), so the owner approves the change and every later fix to it together.
Withdrawn commits (risk line starts with 'Withdrawn') and their fixups get no card.
"""
import hashlib
import json
import os
import re
import subprocess
import sys

GROUPS = {
    'tracking': ('What Meta is told', 'The pixel, the server copy of each event, and the cookies Meta reads. These change the numbers in Ads Manager, so each one is yours to approve.'),
    'checkout': ('Buy Now, bag and checkout', 'What reaches Shiprocket and Shopify when a shopper taps Buy Now or Checkout.'),
    'prices': ('Prices and stock', 'Which price and sold-out state the bag and the first paint show.'),
    'landings': ('Where ads and old links land', 'Catalogue ad links, old Shopify addresses and the error screen.'),
    'contrast': ('Text colours', 'Small text that is too faint to read on a phone in daylight, darkened within the brand palette.'),
}
ORDER = ['checkout', 'tracking', 'prices', 'landings', 'contrast']
BASE = 'ddb72b7'
HEX = re.compile(r'\b[0-9a-f]{7,40}\b')
INTERNAL_SKIP = re.compile(r'rewrit|history|commit message|autosquash', re.I)
# An optional fixup gets its own card (so it can be refused alone); its git subject repeats the
# parent's, so it needs its own title.
OPTIONAL_FIXUP_TITLES = {
    'ac7de45': "A product view that waited for Shopify keeps the piece's own page address",
}


def dep_hashes(text):
    # Only the first sentence names what a commit needs; later sentences list what builds on it
    # or what it works with or without.
    first = re.split(r'(?<=[.;])\s', (text or '').strip(), maxsplit=1)[0]
    if re.match(r'(?:Nothing|None|Independent)\b', first):
        return []
    return HEX.findall(first)


def clean_title(t):
    t = re.sub(r'^(?:fixup:\s*)+', '', t)
    t = re.sub(r'^(?:OPTIONAL|OPTION \d+):\s*', '', t)
    t = re.sub(r'^(?:Hold for the owner|Owner option for C\d+):\s*', '', t)
    t = re.sub(r'\s*\((?:Audit [^)]*|restores [0-9a-f]+|owner review|owner choice|held [^)]*|C\d+)\)', '', t).strip()
    return t[:1].upper() + t[1:]


def git_subjects(key):
    out = subprocess.run(['git', '-C', f'/tmp/own-{key}', 'log', '--reverse', '--format=%H%x09%s', f'{BASE}..own-{key}'],
                         capture_output=True, text=True, check=True).stdout
    return [tuple(l.split('\t', 1)) for l in out.splitlines() if l]


def load_build(path):
    d = json.load(open(path))
    return {g['key']: g for g in d.get('result', d)['groups'] if g}


def load_final(path):
    """Per group: {'reviews': [...], 'repairs': [...]} from a finished result or a running journal."""
    if path == '-':
        return {}
    if path.endswith('.jsonl'):
        labels, out = {}, {}
        for line in open(path):
            d = json.loads(line)
            if d.get('type') == 'started':
                labels[d['key']] = d['label']
            elif d.get('type') == 'result' and isinstance(d.get('result'), dict):
                m = re.match(r'final-(repair-)?(\w+)-r(\d)', labels.get(d['key'], ''))
                if m:
                    g = out.setdefault(m.group(2), {'reviews': [], 'repairs': []})
                    g['repairs' if m.group(1) else 'reviews'].append(d['result'])
        return out
    d = json.load(open(path))
    return {g['key']: {'reviews': [r for r in g['reviews'] if r], 'repairs': g.get('repairs') or ([g['report']] if g.get('report') else [])}
            for g in d.get('result', d)['groups'] if g}


def card_source(it):
    src = {k: it[k] for k in ('title', 'question', 'shoppers', 'meta', 'checkout', 'risk')}
    src['fixes'] = [{k: x[k] for k in ('title', 'shoppers', 'meta', 'checkout')} for x in it['fixes']]
    src['optional'], src['pick'] = it['optional'], it['pick']
    return src, hashlib.sha1(json.dumps(src, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]


def real(rv):
    return [i for i in (rv or {}).get('issues', []) if i.get('reproduced')]


def check_state(early, fin):
    revs, reps = fin.get('reviews', []), fin.get('repairs', [])
    n_early = sum(len(real(r)) for r in early + revs[:-1])
    earlier = f' Earlier checks found {n_early} problem{"s" if n_early != 1 else ""}; all were fixed.' if n_early else ''
    if not revs:
        return {'state': 'pending', 'text': 'Final check running.' + earlier}
    last = revs[-1]
    issues, corr = real(last), last.get('ownerLineCorrections') or []
    fixed_after = len(reps) >= len(revs)
    if not issues and not corr:
        return {'state': 'passed', 'text': 'Passed the final check.' + earlier}
    if not issues:
        n = len(corr)
        if fixed_after:
            return {'state': 'passed', 'text': f'Passed the final check. It corrected the wording of {n} line{"s" if n != 1 else ""}; the corrected wording is shown here.' + earlier}
        return {'state': 'pending', 'text': f'Final check corrected {n} line{"s" if n != 1 else ""} of wording; applying now.' + earlier}
    n = len(issues)
    if fixed_after:
        return {'state': 'repaired', 'text': f'The final check found {n} more problem{"s" if n != 1 else ""}; fixed, and not checked again.' + earlier}
    return {'state': 'pending', 'text': f'The final check found {n} problem{"s" if n != 1 else ""}; being fixed now.' + earlier}


def main(build_path, final_path, qpath, out):
    builds, finals, q = load_build(build_path), load_final(final_path), json.load(open(qpath))
    here = os.path.dirname(os.path.abspath(out))
    sums = {}
    if os.path.exists(os.path.join(here, 'summaries.json')):
        for g in json.load(open(os.path.join(here, 'summaries.json'))):
            for c in (g or {}).get('cards', []):
                sums[c['id']] = c
    stale = []
    groups = []
    for key in ORDER:
        g = builds.get(key)
        if not g or not g.get('build'):
            continue
        fin = finals.get(key, {})
        report = (fin.get('repairs') or [None])[-1] or g['build']
        early = [r for r in g.get('reviews', []) if r]
        subjects = git_subjects(key)
        full = {h[:7]: s for h, s in subjects}
        by7 = {c['commit'][:7]: c for c in report['commits']}
        missing = [h for h in full if h not in by7]
        if missing:
            raise SystemExit(f'{key}: commits on the branch but not in the report: {missing}')
        # parent of each commit: itself, or the earliest non-fixup commit with the same subject
        parent, fixes_card, subj = {}, {}, {h[:7]: sx for h, sx in subjects}
        for h, s in subjects:
            h7 = h[:7]
            if s.startswith('fixup: '):
                target = s[len('fixup: '):]
                p = next((x[:7] for x, sx in subjects if sx == target), None)
                if not p:
                    raise SystemExit(f'{key}: no parent for {h7} "{s}"')
                root = parent.get(p, p)
                root_optional = by7[root].get('optional') or re.match(r'(?:OPTIONAL|OPTION \d+|Owner option)', subj[root])
                if by7[h7].get('optional') and not root_optional:
                    if h7 not in OPTIONAL_FIXUP_TITLES:
                        raise SystemExit(f'{key}: optional fixup {h7} needs a title in OPTIONAL_FIXUP_TITLES')
                    parent[h7], fixes_card[h7] = h7, root
                else:
                    parent[h7] = parent.get(p, p)
            else:
                parent[h7] = h7
        withdrawn = {h for h in full if parent[h] == h and (by7[h].get('risk') or '').startswith('Withdrawn')}
        cards, skipped = {}, [s for s in (report.get('skipped') or []) if not INTERNAL_SKIP.search(s.get('why', ''))]
        for h, s in subjects:
            h7 = h[:7]
            c, p = by7[h7], parent[h7]
            if p in withdrawn:
                if p == h7:
                    skipped.append({'finding': clean_title(c['title']), 'why': 'Withdrawn: an earlier version of this change, cancelled by its own reverse commit and replaced by the two options below. It will not be shipped.'})
                continue
            if p == h7:
                m = re.match(r'^OPTION (\d+):', s)
                cards[h7] = {
                    'id': f'{key}-{h7}', 'finding': by7[fixes_card[h7]].get('finding', '') if h7 in fixes_card else c.get('finding', ''), 'title': OPTIONAL_FIXUP_TITLES.get(h7) or clean_title(c['title']),
                    'question': c.get('ownerQuestion', ''), 'shoppers': c.get('forShoppers', ''), 'meta': c.get('forMeta', ''),
                    'checkout': c.get('forCheckout', ''), 'risk': c.get('risk', ''), 'test': c.get('test', ''),
                    'optional': bool(c.get('optional')) or s.startswith('OPTIONAL'),
                    'pick': f'Option {m.group(1)}' if m else '',
                    'depsRaw': ([fixes_card[h7]] if h7 in fixes_card else []) + dep_hashes(c.get('dependsOn')),
                    'commits': [h7], 'fixes': [], 'squashInto': f'{key}-{fixes_card[h7]}' if h7 in fixes_card else '',
                }
            else:
                cards[p]['commits'].append(h7)
                cards[p]['depsRaw'] += dep_hashes(c.get('dependsOn'))
                t = c['title']
                cards[p]['fixes'].append({
                    'title': '' if t.startswith('fixup:') else clean_title(t),
                    'shoppers': c.get('forShoppers', ''), 'meta': c.get('forMeta', ''), 'checkout': c.get('forCheckout', ''),
                    'commit': h7,
                })
        picks = [x['id'] for x in cards.values() if x['pick']]
        items = []
        for it in cards.values():
            deps = []
            for hh in it.pop('depsRaw'):
                p = parent.get(hh[:7])
                if p and p in cards and p != it['commits'][0] and all(d['id'] != cards[p]['id'] for d in deps):
                    deps.append({'id': cards[p]['id'], 'title': cards[p]['title']})
            it['deps'] = deps
            it['rivals'] = [x for x in picks if x != it['id']] if it['pick'] else []
            src, it['hash'] = card_source(it)
            sm = sums.get(it['id'])
            if sm and sm.get('hash') == it['hash']:
                it['sum'] = {k: sm[k] for k in ('what', 'shoppers', 'meta', 'ask', 'advice', 'why')}
            else:
                stale.append(it['id'])
            items.append(it)
        json.dump({'group': GROUPS[key][0], 'cards': [{'id': i['id'], 'hash': i['hash'], **card_source(i)[0]} for i in items]},
                  open(os.path.join(here, f'src-{key}.json'), 'w'), ensure_ascii=False, indent=1)
        found = [i for r in early + fin.get('reviews', []) for i in real(r)]
        groups.append({
            'key': key, 'title': GROUPS[key][0], 'intro': GROUPS[key][1],
            'branch': report['branch'], 'head': report['head'][:7], 'check': check_state(early, fin),
            'fixed': [{'summary': i['summary'], 'severity': i['severity']} for i in found],
            'skipped': skipped, 'items': items,
        })
    data = {'patches': groups, 'questions': q['groups']}
    json.dump(data, open(out, 'w'), ensure_ascii=False, indent=1)
    n = sum(len(g['items']) for g in groups)
    m = sum(len(g['items']) for g in q['groups'])
    print(f'{len(groups)} patch groups, {n} cards, {m} questions -> {out}')
    print(f'  cards without a current plain-English summary: {len(stale)} {stale if len(stale) < 12 else ""}')
    for g in groups:
        print(f"  {g['key']}: {len(g['items'])} cards from {sum(len(i['commits']) for i in g['items'])} commits; {g['check']['state']}: {g['check']['text']}")


if __name__ == '__main__':
    main(*sys.argv[1:5])
