"""
Rebuilds every logo-derived asset from the supplied `mobile/logo.png`.

The source is a 1437x710 RGBA lockup: the "Shop genuine" wordmark inside a
rounded frame, with a blue shopping-cart roundel in the frame's bottom-right
gap. The roundel is the brand's compact mark, so it becomes the app icon; the
full lockup is what the Logo component and the splash screen show.

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

# ---- 4. iOS / fallback icon -------------------------------------------
# iOS applies no safe-zone padding and renders no transparency, so the disc is
# inset slightly and sits on the white the lockup itself uses.
square(disc, 1024, bg=(255, 255, 255, 255), inset=0.055).convert('RGB').save('assets/icon.png')
print('assets/icon.png               1024x1024  disc on white, inset 5.5%')

# ---- 5. Android adaptive icon -----------------------------------------
# Android masks to a circle or squircle and crops roughly 25% away, so a
# disc inside that mask would read as a target. The cart glyph goes on the
# foreground and the brand blue becomes the background instead.
# 0.26 leaves the glyph filling about 67% of the visible circle once Android
# has cropped the outer quarter away — at 0.235 the cart handle crowded the mask.
square(glyph_big, 1024, inset=0.26).save('assets/android-icon-foreground.png')
Image.new('RGB', (1024, 1024), BRAND_BLUE).save('assets/android-icon-background.png')
# A themed icon is tinted by the launcher, so only alpha survives.
square(glyph_big, 1024, inset=0.26).save('assets/android-icon-monochrome.png')
print(f'assets/android-icon-*.png     1024x1024  cart on #{"%02X%02X%02X" % BRAND_BLUE}')

# ---- 6. Notification icon ---------------------------------------------
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

# ---- 7. Favicon -------------------------------------------------------
square(disc, 48, bg=(255, 255, 255, 255)).convert('RGB').save('assets/favicon.png')
print('assets/favicon.png            48x48')

# ---- Previews ---------------------------------------------------------
sheet = Image.new('RGB', (260 * 4 + 48, 260), (255, 255, 255))
ad = Image.open('assets/android-icon-background.png').convert('RGBA')
ad.alpha_composite(Image.open('assets/android-icon-foreground.png').convert('RGBA'))
mask = Image.new('L', (1024, 1024), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 1023, 1023), fill=255)
circ = Image.new('RGBA', (1024, 1024), (250, 248, 245, 255))
circ.paste(ad, (0, 0), mask)
tinted = Image.new('RGBA', (1024, 1024), (60, 60, 60, 255))
nb = Image.new('RGBA', (1024, 1024), (249, 115, 22, 0))
big_notif = Image.open('assets/notification-icon.png').convert('RGBA').resize((1024, 1024), Image.NEAREST)
solid = Image.new('RGBA', (1024, 1024), (249, 115, 22, 255))
solid.putalpha(big_notif.getchannel('A'))
tinted.alpha_composite(solid)
for i, cell in enumerate([Image.open('assets/icon.png').convert('RGBA'), ad, circ, tinted]):
    pad = Image.new('RGBA', (1024, 1024), (255, 255, 255, 255))
    pad.alpha_composite(cell)
    sheet.paste(pad.convert('RGB').resize((260, 260), Image.LANCZOS), (i * 276, 0))
sheet.save(f'{SCRATCH}/icons-sheet.png')
print('preview: icon | adaptive | adaptive circle-masked | notification tinted')

# ---- A note on the splash screen --------------------------------------
# `imageWidth` in app.json's expo-splash-screen config is capped by Android,
# not by taste. Android 12+ renders the splash icon through a circular mask
# about 186dp across (measured on an API 36 emulator), so a 2.0974:1 lockup is
# clipped above roughly 168dp wide — at 260 it read "shop enuine" with the cart
# roundel sliced in half. 160 fits with a margin. Raising it needs a device
# check, not arithmetic alone.
