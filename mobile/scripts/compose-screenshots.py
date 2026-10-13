"""
Turns raw emulator captures into Play-compliant phone screenshots.

Play rejects an image whose longest side is more than twice the shortest. The
Pixel 8 Pro screen is 1344x2992 — a ratio of 2.23 — so raw captures are not
usable. Each one is scaled to fit 1080x1920 (9:16) and centred on the app's own
background colour, which keeps the whole UI visible and undistorted rather than
cropping content away.

The status bar and gesture bar are trimmed first: they carry the emulator's
clock and badge, which say nothing about the app.
"""
import sys
from PIL import Image

OUT_W, OUT_H = 1080, 1920
APP_BG = (250, 248, 245)
STATUS_BAR = 118   # px at this device's scale
GESTURE_BAR = 64

src_dir, out_dir = sys.argv[1], sys.argv[2]
names = sys.argv[3:]

for i, name in enumerate(names, start=1):
    im = Image.open(f'{src_dir}/{name}.png').convert('RGB')
    im = im.crop((0, STATUS_BAR, im.size[0], im.size[1] - GESTURE_BAR))

    scale = min(OUT_W / im.size[0], OUT_H / im.size[1])
    w, h = round(im.size[0] * scale), round(im.size[1] * scale)
    canvas = Image.new('RGB', (OUT_W, OUT_H), APP_BG)
    canvas.paste(im.resize((w, h), Image.LANCZOS), ((OUT_W - w) // 2, (OUT_H - h) // 2))

    out = f'{out_dir}/{i:02d}-{name.replace("sc-", "")}.png'
    canvas.save(out)
    ratio = max(OUT_W, OUT_H) / min(OUT_W, OUT_H)
    print(f'{out.split("/")[-1]:28s} {OUT_W}x{OUT_H}  ratio {ratio:.2f}  (limit 2.00)')
