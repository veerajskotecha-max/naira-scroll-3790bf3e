import json, sys
tpl = open('template.html').read()
data = json.load(open('page-data.json'))
s = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
open('index.html', 'w').write(tpl.replace('__DATA__', s))
print('index.html', len(tpl) + len(s), 'bytes')
