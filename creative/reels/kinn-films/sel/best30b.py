"""30 s best parts, recut: jewellery and hair first, no fan, one laugh to close (1.2 s). Cut on the beat of the user's track (B,
175.24 BPM): beat 0 at 1.3277 s of the song, so the clip pull lands on the song's silence and the hair falls on the drop (beat 64)."""
import json, sys
S = sys.argv[1]; P = 0.34238; F = lambda b: round(b * P * 30)
shots = [  # (from beat, to beat, clip, source in, note)
    (0, 4, '62379666', 0.00, 'cover close-up, hair down'), (4, 8, '041FCDC6', 8.10, 'hoop close-up, profile'),
    (8, 12, '62379666', 3.40, 'kada at the chin, ring, hoop'), (12, 16, '74FA1A49', 20.10, 'hoop macro going in'),
    (16, 20, '041FCDC6', 10.90, 'tucks her hair: hoop and kada'), (20, 24, '212E5E27', 19.75, 'peekaboo ring'),
    (24, 26, '5627AA72', 7.85, 'hand over the lens (wipe)'), (26, 28, '267E722A', 0.10, 'hair-up close-up'),
    (28, 32, 'E3C6EA7D', 9.60, 'over the shoulder, hair up'), (32, 38, '267E722A', 6.40, 'the turn: laced back'),
    (38, 42, 'A352935A', 10.00, 'fist at the collar: kada and ring'), (42, 46, 'F2532C01', 18.75, 'fingers spread over her face: the rings'),
    (46, 50, 'FB8CD2FD', 6.00, 'over the shoulder, hair down'), (50, 54, 'C64FD42F', 21.00, 'over the shoulder, hair cascading'),
    (54, 58, '398F157B', 8.00, 'side profile, hoop, hand at ear'), (58, 66, 'E3C6EA7D', 13.60, 'clip out on the silence, hair falls on the drop'),
    (66, 72, '5627AA72', 13.30, '360 spin and hair whip'), (72, 76, 'E2552016', 4.60, 'hair toss, going up'),
    (76, 78, 'FB8CD2FD', 11.00, 'turns away, hair swish'), (78, 80, '212E5E27', 18.55, 'side profile, hoop'),
    (80, 82, '76D95B49', 1.00, 'hands at her ear, hoop'), (82, 84, '069EEAED', 0.50, 'hands at the chin: kada and ring'),
    (84, None, 'DE17C1BF', 7.70, 'the laugh, to the lens')]
segs = []
for b0, b1, clip, s0, note in shots:
    n = (F(b1) if b1 is not None else 900) - F(b0)
    segs.append(dict(clip=f'{S}/v14/dl/{clip}/{clip}.mov', **{'in': s0, 'out': round(s0 + n / 30, 4)}, note=note, frames=n))
tot = sum(s['frames'] for s in segs); assert tot == 900, tot
json.dump(dict(audio='silent', segments=segs), open(f'{S}/v15/sel/best30b.json', 'w'), indent=1)
print(len(segs), 'shots', tot, 'frames; laugh', segs[-1]['frames'] / 30, 's')
