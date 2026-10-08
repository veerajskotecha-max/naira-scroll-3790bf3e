"""Remove colour-management chunks (cICP, cHRM, gAMA, sRGB, iCCP) from PNGs in place, so a browser
shows the stored pixel values unchanged instead of colour-converting them."""
import struct, sys, zlib, glob
DROP = {b'cICP', b'cHRM', b'gAMA', b'sRGB', b'iCCP'}
n = 0
for p in sorted(glob.glob(sys.argv[1] + '/*.png')):
    b = open(p, 'rb').read(); i = 8; out = [b[:8]]; changed = False
    while i < len(b):
        ln = struct.unpack('>I', b[i:i + 4])[0]; t = b[i + 4:i + 8]
        if t in DROP: changed = True
        else: out.append(b[i:i + 12 + ln])
        i += 12 + ln
        if t == b'IEND': break
    if changed: open(p, 'wb').write(b''.join(out)); n += 1
print('stripped', n, 'files')
