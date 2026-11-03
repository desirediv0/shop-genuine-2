"""
Rebuilds every logo-derived asset from the supplied `mobile/logo.png`.

The source is a 1437x710 RGBA lockup: the "Shop genuine" wordmark inside a
rounded frame, with a blue shopping-cart roundel in the frame's bottom-right
gap. The client asked for the full lockup as the app icon (2026-11-03), so it
is the launcher icon, the Play listing icon, the splash and the Logo
component. The cart glyph alone survives only where a wordmark cannot be
read: the 24dp status-bar notification icon.

Usage, from mobile/:  python3 <this file> <scratch dir for previews>
"""
import sys
import math
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SCRATCH = sys.argv[1] if len(sys.argv) > 1 else '.'
SRC = 'logo.png'
# Found by flood-filling from the disc centre, so it is the disc exactly.
ROUNDEL = (1124, 374, 1419, 676)
BRAND_BLUE = (1, 61, 172)

src = Image.open(SRC).convert('RGBA')


def trimmed(img, threshold=8):
    """Drop transparent margins so a pinned aspect ratio stays honest."""
    box = img.getchannel('A').point(lambda v: 255 if v > threshold else 0).getbbox()
    return img.crop(box) if box else img


def sharpen(img, percent=85):
    """Restore the edge definition LANCZOS softens on a big upscale."""
    return img.filter(ImageFilter.UnsharpMask(radius=3, percent=percent, threshold=2))


def square(fg, size, bg=None, inset=0.0):
    """Centre `fg` on a square canvas, inset by a fraction on every side."""
    canvas = Image.new('RGBA', (size, size), bg or (0, 0, 0, 0))
    span = max(1, round(size * (1 - inset * 2)))
    off = (size - span) // 2
    canvas.alpha_composite(fg.resize((span, span), Image.LANCZOS), (off, off))
    return canvas


# ---- 1. The lockup, for Logo.tsx and the splash screen -------------------
lockup = trimmed(src)
lockup.save('assets/logo.png')
print(f'assets/logo.png               {lockup.size[0]}x{lockup.size[1]}  '
      f'aspect {lockup.size[0] / lockup.size[1]:.4f}')

# ---- 2. The roundel, upscaled once -------------------------------------
# The crop's bottom-left corner catches the tail of the frame's bottom rule,
# which showed up as a speck beside the icon's disc. The roundel is a circle,
# so clip it to one (drawn oversized and downsampled, for a smooth edge).
roundel = src.crop(ROUNDEL)
W, H = roundel.size
circle = Image.new('L', (W * 4, H * 4), 0)
ImageDraw.Draw(circle).ellipse((0, 0, W * 4 - 1, H * 4 - 1), fill=255)
roundel.putalpha(ImageChops.multiply(
    roundel.getchannel('A'), circle.resize((W, H), Image.LANCZOS)))
disc = sharpen(roundel.resize((1024, 1024), Image.LANCZOS), 90)

# ---- 3. The cart glyph, lifted out of the disc -------------------------
# The glyph is white and the disc is saturated blue, so min(R,G,B) separates
# them (glyph >= 248, disc <= 13). max(R,G,B) does not: the disc's gradient
# reaches 223 in the blue channel at the top. Ramp rather than threshold, so
# the glyph keeps its anti-aliased edges instead of going jaggy.
r, g, b, alpha = roundel.split()
darkest = ImageChops.darker(ImageChops.darker(r, g), b)
LO, HI = 110, 215
ramp = darkest.point(lambda v: 0 if v <= LO else (255 if v >= HI else round((v - LO) * 255 / (HI - LO))))

# The white ring rides at 93-100% of the radius; the glyph stops near 52%.
keep = Image.new('L', (W, H), 0)
R = min(W, H) / 2 * 0.86
ImageDraw.Draw(keep).ellipse((W / 2 - R, H / 2 - R, W / 2 + R, H / 2 + R), fill=255)

mask = ImageChops.multiply(ImageChops.multiply(ramp, alpha), keep)
glyph = Image.merge('RGBA', (*Image.new('RGB', (W, H), (255, 255, 255)).split(), mask))
glyph = trimmed(glyph, threshold=6)
glyph_big = sharpen(glyph.resize((1024, 1024), Image.LANCZOS), 70)
print(f'cart glyph                    {glyph.size[0]}x{glyph.size[1]} in source')

# ---- 4. Where the lockup can safely go --------------------------------
def max_radius(img, threshold=32):
    """Furthest visible pixel from the centre, in pixels of `img`. Measured on
    the real outline rather than the bounding box: the frame's corners are
    rounded, so the lockup can sit a little larger than its box suggests."""
    small = img.getchannel('A').resize((img.width // 4, img.height // 4), Image.BILINEAR)
    cx, cy = small.width / 2, small.height / 2
    px = small.load()
    far = 0.0
    for y in range(small.height):
        for x in range(small.width):
            if px[x, y] > threshold:
                far = max(far, math.hypot(x + 0.5 - cx, y + 0.5 - cy))
    return far * 4


def placed(fg, size, width):
    """`fg` scaled to `width` and centred on a transparent square."""
    height = round(fg.height * width / fg.width)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(sharpen(fg.resize((width, height), Image.LANCZOS), 60),
                           ((size - width) // 2, (size - height) // 2))
    return canvas


reach = max_radius(lockup)  # in lockup pixels

# ---- 5. iOS / legacy / Play listing icon ------------------------------
# A square on white (the frame's inside is transparent, and the blue
# "genuine" needs white behind it). iOS rounds the corners by ~22% and the
# Play listing by ~20%; at 86% wide the lockup's rounded corners stay clear.
WHITE = (255, 255, 255, 255)
icon = Image.new('RGBA', (1024, 1024), WHITE)
icon.alpha_composite(placed(lockup, 1024, round(1024 * 0.86)))
icon.convert('RGB').save('assets/icon.png')
icon.resize((512, 512), Image.LANCZOS).save('store-assets/play-icon-512.png')
print('assets/icon.png               1024x1024  full lockup on white, 86% wide')
print('store-assets/play-icon-512.png 512x512')

# ---- 6. Android adaptive icon -----------------------------------------
# The foreground is a 108dp square, of which launchers show the middle 72dp
# through their own mask (circle, squircle, rounded square). Only a circle
# 66dp across is guaranteed to show on every launcher, so the lockup is
# sized until its furthest visible pixel sits just inside that circle.
SAFE_R = 1024 * 33 / 108 * 0.97
fg_width = math.floor(lockup.width * SAFE_R / reach)
foreground = placed(lockup, 1024, fg_width)
foreground.save('assets/android-icon-foreground.png')
Image.new('RGB', (1024, 1024), (255, 255, 255)).save('assets/android-icon-background.png')
print(f'assets/android-icon-*.png     1024x1024  lockup {fg_width}px wide on white '
      f'({fg_width / (1024 * 72 / 108):.0%} of the visible icon)')

# A themed (Android 13+) icon is tinted by the launcher, so only alpha
# survives. Keep the coloured parts — letters, frame, the cart disc — and let
# the white ones (the cart glyph, the disc's ring) fall through, so the cart
# still reads as a cart instead of a filled blob.
fr, fgc, fb, fa = foreground.split()
light = ImageChops.darker(ImageChops.darker(fr, fgc), fb)
inked = light.point(lambda v: 255 if v <= 150 else (0 if v >= 220 else round((220 - v) * 255 / 70)))
mono_alpha = ImageChops.multiply(fa, inked)
mono = Image.merge('RGBA', (*Image.new('RGB', (1024, 1024), (255, 255, 255)).split(), mono_alpha))
mono.save('assets/android-icon-monochrome.png')

# ---- 7. Notification icon ---------------------------------------------
# Android discards colour here and tints by the plugin's `color`, so only the
# silhouette matters. Alpha must reach 255 or the icon renders translucent,
# and the glyph is inset because some launchers crop it to a circle.
notif = square(glyph_big, 96, inset=0.14)
na = notif.getchannel('A')
hi = na.getextrema()[1]
if hi and hi < 255:
    na = na.point(lambda v: min(255, round(v * 255 / hi)))
notif.putalpha(na)
notif.save('assets/notification-icon.png')
print(f'assets/notification-icon.png  96x96  alpha reaches {na.getextrema()[1]}')

# ---- 8. Favicon -------------------------------------------------------
square(disc, 48, bg=(255, 255, 255, 255)).convert('RGB').save('assets/favicon.png')
print('assets/favicon.png            48x48')

# ---- Previews ---------------------------------------------------------
# icon | adaptive in a circle mask | in a squircle | themed (tinted) |
# notification. Each mask shows the middle 72dp of the 108dp canvas.
def masked(kind):
    full = Image.open('assets/android-icon-background.png').convert('RGBA')
    full.alpha_composite(Image.open('assets/android-icon-foreground.png').convert('RGBA'))
    shown = full.crop((171, 171, 853, 853)).resize((1024, 1024), Image.LANCZOS)
    m = Image.new('L', (1024, 1024), 0)
    d = ImageDraw.Draw(m)
    if kind == 'circle':
        d.ellipse((0, 0, 1023, 1023), fill=255)
    else:
        d.rounded_rectangle((0, 0, 1023, 1023), radius=300, fill=255)
    out = Image.new('RGBA', (1024, 1024), (40, 44, 52, 255))
    out.paste(shown, (0, 0), m)
    return out


themed = Image.new('RGBA', (1024, 1024), (40, 44, 52, 255))
disc_bg = Image.new('L', (1024, 1024), 0)
ImageDraw.Draw(disc_bg).ellipse((0, 0, 1023, 1023), fill=255)
themed.paste(Image.new('RGBA', (1024, 1024), (219, 228, 255, 255)), (0, 0), disc_bg)
ink = Image.new('RGBA', (1024, 1024), (30, 58, 138, 255))
mono_shown = Image.open('assets/android-icon-monochrome.png').convert('RGBA').crop((171, 171, 853, 853)).resize((1024, 1024), Image.LANCZOS)
ink.putalpha(ImageChops.multiply(mono_shown.getchannel('A'), disc_bg))
themed.alpha_composite(ink)

notif_big = Image.open('assets/notification-icon.png').convert('RGBA').resize((1024, 1024), Image.NEAREST)
tinted = Image.new('RGBA', (1024, 1024), (40, 44, 52, 255))
orange = Image.new('RGBA', (1024, 1024), (249, 115, 22, 255))
orange.putalpha(notif_big.getchannel('A'))
tinted.alpha_composite(orange)

cells = [Image.open('assets/icon.png').convert('RGBA'), masked('circle'), masked('squircle'), themed, tinted]
sheet = Image.new('RGB', (276 * len(cells) + 16, 292), (40, 44, 52))
for i, cell in enumerate(cells):
    sheet.paste(cell.convert('RGB').resize((260, 260), Image.LANCZOS), (16 + i * 276, 16))
sheet.save(f'{SCRATCH}/icons-sheet.png')
print('preview: icon | circle mask | squircle mask | themed | notification')

# ---- A note on the splash screen --------------------------------------
# `imageWidth` in app.json's expo-splash-screen config is capped by Android,
# not by taste. Android 12+ renders the splash icon through a circular mask
# about 186dp across (measured on an API 36 emulator), so a 2.0974:1 lockup is
# clipped above roughly 168dp wide — at 260 it read "shop enuine" with the cart
# roundel sliced in half. 160 fits with a margin. Raising it needs a device
# check, not arithmetic alone.
