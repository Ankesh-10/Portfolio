"""Badge photo: white studio backdrop -> dark card tone, black and white, 4:5 crop, 800x1000 JPEG.

Usage: python3 scripts/bw-photo.py <input.jpg> public/images/me-bw.jpg [alpha-preview.png]
Needs Pillow and numpy. Works best on a plain white/very light backdrop (spec §14).
"""
import sys, numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
preview = sys.argv[3] if len(sys.argv) > 3 else None
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
H, W, _ = im.shape
mn, mx = im.min(2), im.max(2)
lum = im @ np.array([0.299, 0.587, 0.114], np.float32)

# 1) backdrop = bright, unsaturated pixels connected to the image border
cand = (mn > 222) & ((mx - mn) < 30)
bg = np.zeros_like(cand)
bg[0, :], bg[-1, :], bg[:, 0], bg[:, -1] = cand[0, :], cand[-1, :], cand[:, 0], cand[:, -1]
for _ in range(4000):
    g = bg.copy()
    g[1:] |= bg[:-1]; g[:-1] |= bg[1:]; g[:, 1:] |= bg[:, :-1]; g[:, :-1] |= bg[:, 1:]
    g &= cand
    if (g == bg).all(): break
    bg = g

# 1b) backdrop pockets enclosed by curls: bright, colourless pixels close to the backdrop
near = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(31))) > 0
bg = bg | (cand & near)

# 2) edges: in a thin band around the backdrop, take the true foreground tone F from the darker
# neighbours (hair is dark, skin mid-grey), then solve observed = a*F + (1-a)*255 for a.
# Edge pixels then fade to the dark backdrop instead of glowing white.
bgimg = Image.fromarray((bg * 255).astype(np.uint8))
band = (np.asarray(bgimg.filter(ImageFilter.MaxFilter(9))) > 0) & ~bg
fgonly = np.where(bg, 255, lum).astype(np.uint8)
F = np.asarray(Image.fromarray(fgonly).filter(ImageFilter.MinFilter(9))).astype(np.float32)
alpha = np.ones((H, W), np.float32)
a_band = np.clip((255 - lum) / np.maximum(255 - F, 20), 0, 1)
alpha[band] = a_band[band]
alpha[bg] = 0
alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
fg = np.where(band, F, lum)

# black and white with a little more contrast (gentle S-curve), lifted slightly so the suit keeps detail
x = fg / 255
x = np.clip(0.5 + (x - 0.5) * 1.12, 0, 1)
x = x ** 0.95

# 4) dark backdrop that matches the card: #0a0a0a at the edges, a touch lighter behind the head
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
d = np.sqrt(((xx - W * 0.5) / (W * 0.6)) ** 2 + ((yy - H * 0.38) / (H * 0.7)) ** 2)
back = (10 + 12 * np.clip(1 - d, 0, 1)) / 255
outimg = x * alpha + back * (1 - alpha)

# 5) crop to 4:5 around the face, then 800x1000
img = Image.fromarray((np.clip(outimg, 0, 1) * 255).astype(np.uint8), "L")
cw = int(H * 0.8)
left = (W - cw) // 2
img = img.crop((left, 0, left + cw, H)).resize((800, 1000), Image.LANCZOS)
img.save(out, quality=86, optimize=True, progressive=True)
if preview:
    Image.fromarray((alpha * 255).astype(np.uint8)).resize((W // 3, H // 3)).save(preview)
print(img.size, round(bg.mean(), 3))
