#!/usr/bin/env python3
"""
myTCteam Promo — Premium Edition v3
30s @ 24fps · 1920×1080 → 4K
"""
import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H  = 1920, 1080
FPS   = 24
OUT   = "/tmp/tc_v11"
os.makedirs(OUT, exist_ok=True)

FONT_B = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
FONT_M = "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"
FONT_R = "/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf"
FONT_L = "/usr/share/fonts/truetype/google-fonts/Poppins-Light.ttf"

BG      = (4, 4, 12)
INDIGO  = (99, 102, 241)
INDIGO2 = (129, 140, 248)
PURPLE  = (139, 92, 246)
WHITE   = (255, 255, 255)
GRAY    = (130, 130, 158)
LTGRAY  = (200, 200, 220)
GREEN   = (52, 211, 153)
TEAL    = (45, 212, 191)
YELLOW  = (251, 191, 36)
RED     = (239, 68, 68)

LB = 96

_FC = {}
def fnt(path, size):
    k = (path, size)
    if k not in _FC: _FC[k] = ImageFont.truetype(path, size)
    return _FC[k]

def eio(t):  return t*t*(3-2*t)
def eoq(t):  return 1-(1-t)**4
def eo3(t):  return 1-(1-t)**3

# ── Background ────────────────────────────────────────────────────────────────
_BG = None
def make_bg():
    global _BG
    if _BG is not None: return _BG
    arr = np.zeros((H, W, 3), dtype=np.float32)
    arr[:] = np.array(BG, dtype=np.float32)
    ys, xs = np.mgrid[0:H, 0:W]
    d0 = np.sqrt(((xs-W/2)/(W*.55))**2 + ((ys-H/2)/(H*.55))**2)
    arr += np.clip(1-d0*1.3, 0, 1)[...,None] * [7,7,22]
    d1 = np.sqrt(((xs-W*.72)/(W*.42))**2 + ((ys-H*.18)/(H*.42))**2)
    arr += np.clip(1-d1*1.6, 0, 1)[...,None] * [6,5,28]
    d2 = np.sqrt(((xs-W*.22)/(W*.42))**2 + ((ys-H*.82)/(H*.42))**2)
    arr += np.clip(1-d2*1.6, 0, 1)[...,None] * [10,4,24]
    _BG = Image.fromarray(np.clip(arr,0,255).astype(np.uint8))
    return _BG

random.seed(42)
_PARTS = [(random.randint(0,W), random.randint(LB+20,H-LB-20),
           random.uniform(.12,.45), random.uniform(.5,1.6)) for _ in range(55)]

def draw_particles(img, f):
    for i,(x0,y0,spd,sz) in enumerate(_PARTS):
        cx = int((x0+f*spd)%W)
        al = max(10,min(50,int(28+18*math.sin(f*.035+i*.65))))
        r  = sz
        tmp = Image.new("RGBA",(int(r*2)+2,int(r*2)+2),(0,0,0,0))
        ImageDraw.Draw(tmp).ellipse([0,0,int(r*2),int(r*2)],fill=(*INDIGO2,al))
        img.paste(tmp,(cx,y0),tmp)

def letterbox(img):
    d = ImageDraw.Draw(img)
    d.rectangle([0,0,W,LB],fill=(0,0,0))
    d.rectangle([0,H-LB,W,H],fill=(0,0,0))

# ── Text helpers (correct font-metric centering) ───────────────────────────────
def fade_text(img, y_top, txt, font, color, t, delay=0.0, slide=14):
    """Smooth fade-up. y_top = VISUAL top of glyphs."""
    if delay >= 1: eff = t
    else:          eff = max(0.0,(t-delay)/(1.0-delay))
    eff = min(1.0, eff)
    al  = int(255*min(eff*1.8, 1.0))
    if al == 0: return
    et  = eio(eff)
    yy  = y_top + int((1-et)*slide)
    d   = ImageDraw.Draw(img)
    bb  = d.textbbox((0,0), txt, font=font)
    tw  = bb[2]-bb[0]
    d.text(((W-tw)//2 - bb[0], yy - bb[1]), txt, font=font, fill=(*color,al))

def punch_text(img, y_top, txt, font, color, t):
    """Smooth confident slide-in across the full beat duration."""
    al  = int(255 * min(t * 4.0, 1.0))   # fully opaque by t=0.25
    if al == 0: return
    et  = eio(min(t, 1.0))               # smooth-step over full t
    yy  = y_top + int((1-et) * 24)       # gentle 24px slide-up
    d   = ImageDraw.Draw(img)
    bb  = d.textbbox((0,0), txt, font=font)
    tw  = bb[2]-bb[0]
    d.text(((W-tw)//2 - bb[0], yy - bb[1]), txt, font=font, fill=(*color,al))

def draw_line(img, y, w_frac, color, t, delay=0.0):
    if delay >= 1: eff = t
    else:          eff = max(0.0,(t-delay)/(1.0-delay))
    eff = min(1.0, eoq(eff))
    lw  = int(W*w_frac*eff)
    if lw < 2: return
    ImageDraw.Draw(img).line([(W//2-lw//2,y),(W//2+lw//2,y)], fill=color, width=2)

def draw_pill(img, cx, cy, txt, color, font, alpha=255):
    d  = ImageDraw.Draw(img)
    bb = d.textbbox((0,0), txt, font=font)
    tw = bb[2]-bb[0]; th = bb[3]-bb[1]
    px,py = 30,12
    w,h   = tw+px*2, th+py*2
    tmp   = Image.new("RGBA",(w+4,h+4),(0,0,0,0))
    td    = ImageDraw.Draw(tmp)
    td.rounded_rectangle([0,0,w,h], radius=h//2,
                         fill=(*color,int(alpha*.15)), outline=(*color,alpha), width=2)
    td.text((px-bb[0], py-bb[1]), txt, font=font, fill=(*color,alpha))
    img.paste(tmp,(cx-w//2, cy-h//2), tmp)

# ── Logo — T and C precisely centred in their circles ─────────────────────────
def draw_logo(img, cx, cy, r=52, alpha=255):
    """
    Left  circle:  ellipse [0, 4, r*2, r*2+4] → centre (r,   r+4)
    Right circle:  ellipse [r-10, 4, r*3-10, r*2+4] → centre (r*2-10, r+4)
    """
    if r < 4: return
    tmp = Image.new("RGBA",(r*4, r*3),(0,0,0,0))
    td  = ImageDraw.Draw(tmp)
    td.ellipse([0,    4, r*2,   r*2+4], fill=(*INDIGO,  int(alpha*.95)))
    td.ellipse([r-10, 4, r*3-10,r*2+4], fill=(*INDIGO2, int(alpha*.88)))
    lf  = fnt(FONT_B, max(6, int(r*.85)))
    # Circle centres in tmp coordinates
    left_cx,  circle_cy = r,       r+4
    right_cx             = r*2-10
    for char, tcx in [("T", left_cx), ("C", right_cx)]:
        bb  = td.textbbox((0,0), char, font=lf)
        tw_ = bb[2]-bb[0]; th_ = bb[3]-bb[1]
        # draw position so visual centre = (tcx, circle_cy)
        td.text((tcx - tw_//2 - bb[0],
                 circle_cy - th_//2 - bb[1]),
                char, font=lf, fill=(255,255,255,alpha))
    img.paste(tmp,(cx-r*2+10, cy-r), tmp)

def draw_logo_glow(img, cx, cy, r, alpha):
    for ri,oa in [(r*1.9,.18),(r*2.7,.10),(r*3.5,.05)]:
        tmp = Image.new("RGBA",(int(ri*2)+4,int(ri*2)+4),(0,0,0,0))
        al  = int(alpha*oa)
        ImageDraw.Draw(tmp).ellipse([0,0,int(ri*2)+2,int(ri*2)+2],
                                    outline=(*INDIGO,max(0,al)), width=2)
        img.paste(tmp,(int(cx-ri-1),int(cy-ri-1)),tmp)

# ── Portal — $20K premium design ──────────────────────────────────────────────
def draw_portal(img, t):
    """
    t=0.00→0.22  portal slides up
    t=0.08→0.20  header + nav fade in (staggered)
    t=0.18→0.25  KPI cards pop in
    t=0.28→0.68  progress bars fill with glow sweep + percentage counters
    t=0.65→1.00  deal-closed toast slides in from right
    """
    LW, LH = 1200, 680
    et_enter = eoq(min(t / 0.22, 1.0))
    lx = (W - LW) // 2
    ly = (H - LH) // 2 + 14 + int((1 - et_enter) * 210)
    al = int(255 * min(t / 0.14, 1.0))

    tmp = Image.new("RGBA", (LW, LH), (0,0,0,0))
    td  = ImageDraw.Draw(tmp)

    # ── Outer panel — dark glass ────────────────────────────────────────────
    td.rounded_rectangle([0, 0, LW-1, LH-1], radius=18,
                         fill=(7, 8, 18, al), outline=(38, 42, 88, al), width=1)
    # Subtle top-edge highlight (glass sheen)
    for gy in range(18):
        ga = int(al * 0.07 * (1 - gy / 18))
        td.line([(2, gy), (LW-2, gy)], fill=(140, 150, 255, ga))

    # ── Sidebar ─────────────────────────────────────────────────────────────
    SW = 196
    td.rounded_rectangle([0, 0, SW, LH-1], radius=18, fill=(5, 5, 14, al))
    td.line([(SW, 0), (SW, LH)], fill=(28, 30, 65, al), width=1)

    # Logo
    lf2 = fnt(FONT_B, 16)
    td.text((16, 18), "myTC", font=lf2, fill=(*INDIGO2, al))
    td.text((70, 18), "team", font=lf2, fill=(*WHITE,   al))
    td.line([(14, 46), (SW-14, 46)], fill=(28, 30, 65, al), width=1)

    # Nav (stagger fade after t=0.10)
    nav_al = int(255 * min(max(0, (t-0.10)/0.14), 1.0))
    nav = [("Deals", True), ("Documents", False), ("Contacts", False),
           ("Reports", False), ("Settings", False)]
    nf = fnt(FONT_R, 13)
    for i, (item, active) in enumerate(nav):
        ny = 60 + i * 46
        if active:
            td.rounded_rectangle([8, ny-5, SW-8, ny+24], radius=8,
                                 fill=(*INDIGO, int(nav_al * 0.28)))
            td.rectangle([8, ny-5, 12, ny+24], fill=(*INDIGO, nav_al))
            td.text((20, ny), item, font=nf, fill=(*INDIGO2, nav_al))
        else:
            td.text((20, ny), item, font=nf, fill=(*GRAY, nav_al))

    # ── Top bar ─────────────────────────────────────────────────────────────
    hdr_al = int(255 * min(max(0, (t-0.08)/0.12), 1.0))
    td.rectangle([SW, 0, LW, 54], fill=(5, 6, 16, hdr_al))
    td.line([(SW, 54), (LW, 54)], fill=(28, 30, 65, hdr_al), width=1)
    td.text((SW+20, 12), "Active Deals", font=fnt(FONT_B, 16), fill=(*WHITE, hdr_al))
    td.text((SW+20, 34), "Live tracking dashboard",
            font=fnt(FONT_R, 11), fill=(*GRAY, hdr_al))

    # Pulsing LIVE dot
    pulse_r = int(hdr_al * (0.72 + 0.28 * math.sin(t * 18)))
    if pulse_r > 0:
        td.ellipse([LW-44, 15, LW-22, 37], fill=(*GREEN, pulse_r))
        td.ellipse([LW-50, 9,  LW-16, 43], outline=(*GREEN, pulse_r//4), width=2)
    td.text((LW-90, 20), "LIVE", font=fnt(FONT_B, 11), fill=(*GREEN, hdr_al))

    # ── KPI Cards (count-up animation) ──────────────────────────────────────
    kpi_al   = int(255 * min(max(0, (t-0.18)/0.12), 1.0))
    bar_fill = eoq(min(max(0, (t-0.28)/0.40), 1.0))   # 0.28→0.68
    CW2      = (LW - SW - 44) // 4

    kpi_count  = int(14  * bar_fill)
    kpi_pipe   = f"${2.4 * bar_fill:.1f}M"
    kpi_ontime = f"{int(98 * min(bar_fill*1.5,1.0))}%"
    cards = [
        (str(kpi_count) or "0", "Active Deals", INDIGO,  [30,24,21,18,19,22,25,28]),
        ("3",                   "Closing Soon",  YELLOW,  [1,1,2,2,2,3,3,3]),
        (kpi_pipe,              "Pipeline",      PURPLE,  [1600,1700,1800,1900,2000,2050,2080,2100]),
        (kpi_ontime,            "On-Time",       GREEN,   [88,90,92,95,96,97,98,98]),
    ]
    cy0 = 68
    for ci, (val, lbl, col, spark) in enumerate(cards):
        cx0 = SW + 10 + ci*(CW2+8)
        # Card with subtle border
        td.rounded_rectangle([cx0, cy0, cx0+CW2, cy0+100], radius=10,
                             fill=(11, 12, 26, kpi_al),
                             outline=(*col, int(kpi_al*0.40)), width=1)
        td.text((cx0+12, cy0+12), val, font=fnt(FONT_B, 24), fill=(*col, kpi_al))
        td.text((cx0+12, cy0+44), lbl, font=fnt(FONT_L, 11), fill=(*GRAY, kpi_al))
        # Sparkline
        smax, smin = max(spark), min(spark); sm = (smax-smin) or 1
        pts = [(cx0+10+i*((CW2-20)//7), cy0+90-int((v-smin)/sm*22))
               for i, v in enumerate(spark)]
        for j in range(len(pts)-1):
            td.line([pts[j], pts[j+1]], fill=(*col, int(kpi_al*0.60)), width=2)

    # ── Deal rows ────────────────────────────────────────────────────────────
    cols_x = [SW+14, SW+300, SW+492, SW+638, SW+848]
    row_al = int(255 * min(max(0, (t-0.22)/0.12), 1.0))
    ry = cy0 + 118
    for hdr, cx0 in zip(["Address", "Stage", "Price", "Progress", "Status"], cols_x):
        td.text((cx0, ry), hdr, font=fnt(FONT_M, 10), fill=(*GRAY, row_al))
    ry += 20
    td.line([(SW+8, ry), (LW-8, ry)], fill=(28, 30, 60, row_al), width=1)
    ry += 8

    deals = [
        ("1432 Maple Ave", "In Escrow", "$485K",  72, "⚡ Appraisal due"),
        ("8891 Pine Blvd", "Pending",   "$612K",  45, "📋 Docs needed"),
        ("334 Oak Circle", "Closing",   "$529K",  91, "✅ Ready to close"),
        ("7720 Cedar Dr",  "Active",    "$398K",  28, "📞 Follow up"),
    ]
    rf = fnt(FONT_R, 12); sf = fnt(FONT_M, 11)

    for di, (addr, stage, price, prog, status) in enumerate(deals):
        ry0 = ry + di * 52

        # Row bg — hot deal gets green tint
        if stage == "Closing":
            td.rounded_rectangle([SW+6, ry0-5, LW-6, ry0+38], radius=7,
                                 fill=(8, 28, 14, int(row_al*0.55)))
            # Subtle left accent stripe for hot deal
            td.rectangle([SW+6, ry0-5, SW+10, ry0+38],
                         fill=(*GREEN, int(row_al*0.80)))
        elif di % 2 == 0:
            td.rounded_rectangle([SW+6, ry0-5, LW-6, ry0+38], radius=7,
                                 fill=(12, 13, 30, int(row_al*0.40)))

        td.text((cols_x[0], ry0+5), addr, font=rf, fill=(*WHITE, row_al))

        # Stage badge
        sc = (GREEN if stage=="Closing" else
              INDIGO if stage=="In Escrow" else
              YELLOW if stage=="Pending" else GRAY)
        bb2 = td.textbbox((0,0), stage, font=sf)
        pw, ph = bb2[2]-bb2[0], bb2[3]-bb2[1]
        td.rounded_rectangle([cols_x[1]-5, ry0+1, cols_x[1]+pw+12, ry0+ph+9],
                             radius=5, fill=(*sc, int(row_al*0.22)))
        td.text((cols_x[1]+3, ry0+3), stage, font=sf, fill=(*sc, row_al))

        td.text((cols_x[2], ry0+5), price, font=fnt(FONT_M, 12), fill=(*WHITE, row_al))

        # ── Progress bar with glow sweep ─────────────────────────────────
        bw = 158
        td.rounded_rectangle([cols_x[3], ry0+10, cols_x[3]+bw, ry0+24],
                             radius=5, fill=(18, 18, 46, row_al))
        bc = GREEN if prog>80 else (INDIGO if prog>40 else YELLOW)
        pb = int(bw * prog/100 * bar_fill)
        if pb > 0:
            td.rounded_rectangle([cols_x[3], ry0+10, cols_x[3]+pb, ry0+24],
                                 radius=5, fill=(*bc, row_al))
            # Glowing leading-edge sweep (bright tip that moves as bar fills)
            if bar_fill < 0.97:
                tip_w = 14
                tip_x0 = max(cols_x[3], cols_x[3]+pb-tip_w)
                tip_x1 = cols_x[3]+pb
                tip_al = int(row_al * 0.85)
                td.rounded_rectangle([tip_x0, ry0+9, tip_x1+3, ry0+25],
                                     radius=5, fill=(*bc, tip_al))

        # Animated percentage counter
        shown_pct = int(prog * bar_fill)
        pct_al = int(row_al * min(bar_fill*3, 1.0))
        td.text((cols_x[3]+bw+7, ry0+8), f"{shown_pct}%",
                font=fnt(FONT_M, 10), fill=(*bc, pct_al))

        td.text((cols_x[4], ry0+5), status, font=rf, fill=(*GRAY, row_al))

    # ── Deal-closed toast (slides in from right at t=0.65) ─────────────────
    tt = max(0.0, (t - 0.65) / 0.35)
    if tt > 0:
        et2  = eoq(tt)
        tw2, th2 = 340, 90
        rest_x   = LW - tw2 - 18
        tx = int((LW + 24) + (rest_x - (LW+24)) * et2)
        ty = LH - th2 - 20
        tal = int(255 * min(tt * 4.0, 1.0))

        # Soft drop-shadow
        for s in range(6, 0, -1):
            td.rounded_rectangle([tx-s, ty-s, tx+tw2+s, ty+th2+s], radius=14+s,
                                 fill=(0, 60, 20, int(tal * s * 0.04)))
        # Body
        td.rounded_rectangle([tx, ty, tx+tw2, ty+th2], radius=14,
                             fill=(5, 20, 10, tal))
        # Outer border
        td.rounded_rectangle([tx, ty, tx+tw2, ty+th2], radius=14,
                             outline=(*GREEN, tal), width=2)
        # Green left accent bar
        td.rounded_rectangle([tx, ty, tx+6, ty+th2], radius=14, fill=(*GREEN, tal))

        # Check icon
        ic_cx, ic_cy = tx+32, ty+th2//2
        td.ellipse([ic_cx-16, ic_cy-16, ic_cx+16, ic_cy+16],
                   fill=(*GREEN, int(tal*0.30)))
        td.text((ic_cx-10, ic_cy-14), "✓", font=fnt(FONT_B, 20), fill=(*GREEN, tal))

        # Text block
        td.text((tx+58, ty+12), "Deal Closed!",
                font=fnt(FONT_B, 18), fill=(*GREEN, tal))
        td.text((tx+58, ty+36), "1432 Maple Ave — $485K",
                font=fnt(FONT_M, 14), fill=(*WHITE, tal))
        td.text((tx+58, ty+58), "Loan approved  ·  just now",
                font=fnt(FONT_R, 11), fill=(*GRAY,  tal))
        # Timestamp dots
        td.text((tx+tw2-52, ty+12), "now", font=fnt(FONT_R,10), fill=(*GRAY, tal))

    img.paste(tmp, (lx, ly), tmp)

# ── Scene boundaries (720 frames = 30s @ 24fps) ───────────────────────────────
TOTAL    = 720
S1_END   = 72    # 0-71    Brand               3.0s
S2_END   = 132   # 72-131  Value prop          2.5s
S3A_END  = 156   # 132-155 "Contracts."        1.0s — sharp beat
S3B_END  = 180   # 156-179 "Deadlines."        1.0s — sharp beat
S3C_END  = 228   # 180-227 "Documents."        2.0s — beat + "All covered."
S4_END   = 432   # 228-431 Portal              8.5s  (saved S3 frames go here)
S5A_END  = 492   # 432-491 More affordable     2.5s
S5B_END  = 552   # 492-551 More automated      2.5s
S5C_END  = 612   # 552-611 More organized      2.5s  ← same duration as others
S6_END   = 708   # 612-707 CTA                 4.0s
#                # 708-719 Hold                0.5s

CTA_LOGO_CY = 240
CTA_LINE_Y  = CTA_LOGO_CY + 160
CTA_MAIN_Y  = CTA_LOGO_CY + 185
CTA_SUB_Y   = CTA_LOGO_CY + 320
CTA_PILL_Y  = CTA_LOGO_CY + 435
CTA_TAG_Y   = CTA_LOGO_CY + 490

def render_cta(img, t, la=None):
    la = la if la is not None else int(255*min(t*3.0,1.0))
    draw_logo_glow(img, W//2, CTA_LOGO_CY, 40, la)
    draw_logo(img,     W//2, CTA_LOGO_CY, r=40, alpha=la)
    if t > 0.12:
        draw_line(img, CTA_LINE_Y, 0.60, INDIGO, (t-0.12)/0.28)
    fade_text(img, CTA_MAIN_Y, "Better TC.",     fnt(FONT_B,96), WHITE,   min(t*2.8,1.0))
    if t > 0.20:
        fade_text(img, CTA_SUB_Y,  "Better price.", fnt(FONT_B,72), INDIGO2, (t-0.20)/0.80)
    if t > 0.52:
        draw_pill(img, W//2, CTA_PILL_Y, "mytcteam.online",
                  INDIGO, fnt(FONT_M,26), int(255*eoq((t-0.52)/0.48)))
    if t > 0.68:
        fade_text(img, CTA_TAG_Y, "Start saving on your next closing.",
                  fnt(FONT_L,22), GRAY, (t-0.68)/0.32)

# Word positions for S3 (stacked, clear vertical rhythm)
W3_Y = [320, 440, 560]   # Contracts, Deadlines, Documents

def render_frame(f):
    img = make_bg().copy().convert("RGBA")
    draw_particles(img, f)

    # ── S1: Brand (0-71) ──────────────────────────────────────────────────────
    if f < S1_END:
        t  = f / S1_END
        la = int(255*min(t*3.0,1.0))
        draw_logo_glow(img, W//2, 370, 52, la)
        draw_logo(img,     W//2, 370, r=52, alpha=la)
        if t > 0.20:
            fade_text(img, 510, "myTCteam", fnt(FONT_B,96), LTGRAY, (t-0.20)/0.80)
        if t > 0.48:
            draw_line(img, 632, 0.32, INDIGO, (t-0.48)/0.52)
        if t > 0.55:
            fade_text(img, 650, "Transaction coordination, upgraded.",
                      fnt(FONT_L,30), GRAY, (t-0.55)/0.45)

    # ── S2: Value prop (72-131) ───────────────────────────────────────────────
    elif f < S2_END:
        t = (f-S1_END)/(S2_END-S1_END)
        fade_text(img, 400, "We handle everything",
                  fnt(FONT_B,84), WHITE, min(t*2.8,1.0))
        fade_text(img, 525, "between contract and close.",
                  fnt(FONT_M,52), INDIGO2, min(t*2.8,1.0), delay=0.18)

    # ── S3A: "Contracts." (132-155) — 1-second sharp beat ────────────────────
    elif f < S3A_END:
        t = (f-S2_END)/(S3A_END-S2_END)
        punch_text(img, W3_Y[0], "Contracts.", fnt(FONT_B,80), WHITE, t)

    # ── S3B: "Deadlines." (156-179) — 1-second sharp beat ────────────────────
    elif f < S3B_END:
        t = (f-S3A_END)/(S3B_END-S3A_END)
        punch_text(img, W3_Y[0], "Contracts.", fnt(FONT_B,80), WHITE,   1.0)
        punch_text(img, W3_Y[1], "Deadlines.", fnt(FONT_B,80), INDIGO2, t)

    # ── S3C: "Documents." (180-227) — 2-second beat + "All covered." ─────────
    elif f < S3C_END:
        t = (f-S3B_END)/(S3C_END-S3B_END)
        punch_text(img, W3_Y[0], "Contracts.", fnt(FONT_B,80), WHITE,   1.0)
        punch_text(img, W3_Y[1], "Deadlines.", fnt(FONT_B,80), INDIGO2, 1.0)
        punch_text(img, W3_Y[2], "Documents.", fnt(FONT_B,80), LTGRAY,  t)
        if t > 0.60:
            fade_text(img, 680, "All covered.", fnt(FONT_L,34), GRAY, (t-0.60)/0.40)

    # ── S4: Portal (288-431) — 6 seconds, full animation sequence ────────────
    elif f < S4_END:
        t = (f-S3C_END)/(S4_END-S3C_END)
        fade_text(img, LB+22, "Your deal. Live.",
                  fnt(FONT_B,40), LTGRAY, min(t*3.5,1.0))
        draw_portal(img, t)

    # ── S5a-c: Pillars (432-611) — each gets 2.5 seconds ─────────────────────
    elif f < S5A_END:
        t = (f-S4_END)/(S5A_END-S4_END)
        fade_text(img, 448, "More affordable.",  fnt(FONT_B,90), WHITE, min(t*3.5,1.0))
        draw_line(img, 570, 0.28, INDIGO, t, delay=0.35)

    elif f < S5B_END:
        t = (f-S5A_END)/(S5B_END-S5A_END)
        fade_text(img, 448, "More automated.",   fnt(FONT_B,90), WHITE, min(t*3.5,1.0))
        draw_line(img, 570, 0.28, TEAL,   t, delay=0.35)

    elif f < S5C_END:
        t = (f-S5B_END)/(S5C_END-S5B_END)   # same formula as S5A/S5B
        fade_text(img, 448, "More organized.",  fnt(FONT_B,90), WHITE, min(t*3.5,1.0))
        draw_line(img, 570, 0.28, PURPLE, t, delay=0.35)

    # ── S6: CTA (612-707) ────────────────────────────────────────────────────
    elif f < S6_END:
        t = (f-S5C_END)/(S6_END-S5C_END)
        render_cta(img, t)

    # ── Hold (708-719) ───────────────────────────────────────────────────────
    else:
        t  = (f-S6_END)/(TOTAL-S6_END)
        ha = max(0, int(255*(1-t*2.0)))
        render_cta(img, 1.0, la=ha)

    letterbox(img)
    return img.convert("RGB")

print(f"Rendering {TOTAL} frames …")
make_bg()
for f in range(TOTAL):
    render_frame(f).save(f"{OUT}/f{f:04d}.png")
    if f % 72 == 0:
        print(f"  {f}/{TOTAL}  {f/TOTAL*100:.0f}%")
print("Done!")
