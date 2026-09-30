import json
B = 0.36584; b = lambda k: round(k * B, 4)   # her track's fitted beat (164.01 BPM)
bc = lambda k: round(round(k * B * 30) / 30, 4)   # a cut beat, on the plate's frame grid
TR = json.load(open('../tracks.json')); M = json.load(open('../marks.json'))
D = {
  'fps': 30, 'beat': B, 'dur': 19.6, 'nFrames': 461,
  'frames': '../frames/f_', 'panelL': '../panelL/p_', 'panelR': '../panelRw/p_', 'panelN': 25,
  'tracks': TR['tracks'], 'panelTracks': {'L': TR['panelL'], 'R': TR['panelR']},
  'every': {'y': 420, 'py': 575},
  'cutBeats': [0, 4, 7, 10, 13, 16, 20, 23, 30, 33, 38],
  'marks': {'flower': M['flower'], 'wordmark': {'w': M['wordmark']['w'], 'h': M['wordmark']['h'], 'letters': M['letters']}},
  'cut': {'hug': '../hug.png', 'hugW': 373, 'hugH': 230, 'tog': '../tog_sharp.png', 'togW': 482, 'togH': 624},
  'tags': [
    # land right after the cut so each tag reads for most of its shot; (dx, dy) is the eyelet, (ax, ay) the knot on the piece
    {'t0': bc(7) + .06, 't1': b(10), 'track': 'dr2', 'dx': 60, 'dy': -222, 'ax': 0, 'ay': -35, 'rest': -2, 'name': 'BRUSHED GOLD<br>HUGGIES', 'price': '₹1,099'},
    {'t0': bc(13) + .2, 't1': b(16), 'track': 'dr4', 'dx': -60, 'dy': -262, 'ax': -6, 'ay': -44, 'rest': -2, 'name': 'TOGGLE LINK<br>CHAIN', 'price': '₹1,499'},
  ],
  'exit': {'shrink': b(40), 'flip': b(41), 'grow': b(42.5), 'logo': b(44), 'letters': b(45), 'prods': b(46), 'price': b(47), 'url': b(48)},
}
json.dump(D, open('data.json', 'w'))
print('exit', D['exit'])
