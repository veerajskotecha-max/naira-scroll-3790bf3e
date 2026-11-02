"""Every shot the three ads use: source, in point (s), length (s). extract.py pulls exactly these frames."""
SRC = {
    'grwm':   ('src/grwm.mp4', 'pc'),
    'riya':   ('src/riya_F67FB13D.mp4', 'pc'),
    'bb':     ('v14/dl/8BB38387-8A4F-4E75-BEE3-B25BB1F487CD/8BB38387-8A4F-4E75-BEE3-B25BB1F487CD.mp4', 'pc'),
    'pankti': ('src/pankti_raw.mp4', 'hlg'),
    'aihoops':   ('ai/hoops_hero.mp4', 'tv'),
    'aihuggies': ('ai/huggies_hero.mp4', 'tv'),
}
# id: (source, in, length). Lengths carry a few spare frames for speed ramps.
SHOTS = {
    'grwm_hoopheld':  ('grwm', 0.00, 1.95),     # hand holds the hoop up to the lens
    'grwm_fist':      ('grwm', 8.50, 2.40),     # fist under the chin, the 10/10 look
    'grwm_pose':      ('grwm', 20.80, 2.30),
    'grwm_close':     ('grwm', 8.60, 1.30),
    'riya_ringbox':   ('riya', 5.10, 2.80),     # Naira box opening on the Cushion Halo Ring
    'riya_ringmacro': ('riya', 15.15, 1.38),
    'riya_hoopbox':   ('riya', 16.60, 1.40),    # Naira box of Woven Gold Hoops
    'riya_flip':      ('riya', 18.05, 1.20),    # hair flip wearing the hoops
    'riya_portrait':  ('riya', 19.28, 1.00),
    'riya_wear':      ('riya', 21.70, 2.20),
    'bb_close':       ('bb', 0.00, 1.28),       # Sonal close-up, hoops
    'pk_box':         ('pankti', 0.40, 2.85),   # Naira box opens on the toggle chain
    'pk_hugheld':     ('pankti', 7.22, 1.75),   # huggies held to the lens
    'pk_hugon':       ('pankti', 9.06, 1.30),
    'pk_palm':        ('pankti', 13.72, 1.48),  # chain across her palm
    'pk_toggle':      ('pankti', 17.30, 1.60),
    'pk_neck':        ('pankti', 21.50, 1.20),
    'pk_portrait':    ('pankti', 27.90, 2.60),  # wearing chain + huggies
    'ai_hoops':       ('aihoops', 0.00, 5.00),
    'ai_huggies':     ('aihuggies', 0.00, 5.00),
}
