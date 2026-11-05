"""
Turns raw emulator captures into Play-ready phone screenshots.

Each is a 1080x1920 (9:16) image: a short caption at the top in the app's
headline font, and the real capture below it with rounded corners and a soft
shadow, on the "All stores" blue colour mesh the app itself opens on. Play
rejects images whose longest side is more than twice the shortest, and the
Pixel 8 Pro screen (1344x2992) is 2.23, so raw captures cannot be used as
they are.

The status bar and gesture bar are trimmed first: they carry the emulator's
clock and badges, which say nothing about the app.

Usage, from mobile/:
    python3 scripts/compose-screenshots.py <raw-dir> store-assets/screenshots \\
        "sc-home=Every Genuine store in one app" "sc-product=Genuine products, honest prices" ...
Each argument is <capture name>=<caption>; the order is the order on Play.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_W, OUT_H = 1080, 1920
STATUS_BAR = 118   # px at this device's scale
GESTURE_BAR = 64
SHOT_H = 1540      # the capture's height on the canvas
TOP = 330          # where the capture starts; the caption sits above it
RADIUS = 46
FONT = 'node_modules/@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf'

src_dir, out_dir = sys.argv[1], sys.argv[2]
pairs = [arg.split('=', 1) for arg in sys.argv[3:]]


def mesh(w, h):
    """The app's "All stores" header: a blue gradient with sky, violet and
    orange glows (see storeMesh in src/theme/stores.ts)."""
    base = Image.new('RGB', (w, h))
    top, bottom = (47, 98, 234), (11, 44, 134)
    px = base.load()
    for y in range(h):
        for x in range(w):
            t = min(1, max(0, (x * 0.35 + y) / (w * 0.35 + h)))
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
    glows = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(glows)
    for (cx, cy, r, colour) in [
        (w * 0.95, 0, w * 0.75, (56, 189, 248, 150)),
        (0, h * 0.9, w * 0.8, (139, 92, 246, 140)),
        (w * 0.8, h * 1.05, w * 0.5, (249, 115, 22, 110)),
    ]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=colour)
    glows = glows.filter(ImageFilter.GaussianBlur(160))
    out = base.convert('RGBA')
    out.alpha_composite(glows)
    return out


def wrap(text, font, width, draw):
    """One line if it fits; otherwise two lines of about equal width, so a
    caption never ends on a lone word ("…in one / app")."""
    if draw.textlength(text, font=font) <= width:
        return [text]
    words = text.split()
    splits = [(' '.join(words[:k]), ' '.join(words[k:])) for k in range(1, len(words))]
    return list(min(splits, key=lambda ab: max(draw.textlength(t, font=font) for t in ab)))


background = mesh(OUT_W, OUT_H)
font = ImageFont.truetype(FONT, 68)

for i, (name, caption) in enumerate(pairs, start=1):
    shot = Image.open(f'{src_dir}/{name}.png').convert('RGB')
    shot = shot.crop((0, STATUS_BAR, shot.width, shot.height - GESTURE_BAR))
    w = round(shot.width * SHOT_H / shot.height)
    shot = shot.resize((w, SHOT_H), Image.LANCZOS)

    canvas = background.copy()
    left = (OUT_W - w) // 2

    # Soft shadow, then the capture with rounded corners.
    shadow = Image.new('RGBA', (OUT_W, OUT_H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (left, TOP + 24, left + w, TOP + SHOT_H + 24), radius=RADIUS, fill=(2, 6, 23, 120))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(36)))
    mask = Image.new('L', (w, SHOT_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, SHOT_H - 1), radius=RADIUS, fill=255)
    canvas.paste(shot, (left, TOP), mask)

    # Caption, centred in the space above the capture.
    draw = ImageDraw.Draw(canvas)
    lines = wrap(caption, font, OUT_W - 160, draw)
    line_h = 82
    y = (TOP - line_h * len(lines)) // 2 + 6
    for line in lines:
        draw.text((OUT_W / 2, y), line, font=font, fill=(255, 255, 255), anchor='ma')
        y += line_h

    out = f'{out_dir}/{i:02d}-{name.replace("sc-", "")}.png'
    canvas.convert('RGB').save(out)
    ratio = max(OUT_W, OUT_H) / min(OUT_W, OUT_H)
    print(f'{out.split("/")[-1]:24s} {OUT_W}x{OUT_H}  ratio {ratio:.2f} (limit 2.00)  "{caption}"')
