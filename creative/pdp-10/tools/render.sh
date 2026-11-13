#!/bin/bash
# Render the prototype and cut it into reviewable phone screens: fold.png (first screen, 2x), screens_N.jpg (4 screens each, 1x).
D=/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10
cd "$D" && node shoot.js "$D/proto" || exit 1
rm -f "$D"/screens_*.jpg
python3.13 -I - "$D" <<'PY'
import sys; sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image
D=sys.argv[1]; full=Image.open(f'{D}/full.png').convert('RGB')
full=full.resize((360, full.height//2), Image.LANCZOS)
shots=[full.crop((0,y,360,min(full.height,y+640))) for y in range(0,full.height,600)]
for k in range(0,len(shots),4):
    g=shots[k:k+4]; O=Image.new('RGB',(370*len(g)-10,640),(60,60,60))
    for j,s in enumerate(g): O.paste(s,(j*370,0))
    O.save(f'{D}/screens_{k//4+1}.jpg',quality=88)
print('screens', len(shots), 'sheets', -(-len(shots)//4))
PY
