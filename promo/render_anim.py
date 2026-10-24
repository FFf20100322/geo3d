# -*- coding: utf-8 -*-
"""
逐帧渲染 Geo3D 演示动画，直接把 raw RGBA 管道给 ffmpeg 编码。

为什么不用浏览器截帧：headless + swiftshader 下 1920x1080 截图只有 ~1.6fps，
做不出流畅动画。PIL 逐帧画 + 管道输出是 30fps 的，且完全可控、不依赖任何外部软件。

输出：promo/out/anim-raw.mp4（1920x1080 / 30fps / H.264）
"""
import math
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

FFMPEG = r"D:\FormatFactory\ffmpeg.exe"
OUT = r"F:\deep seek-harness\geo3d\promo\out\anim-raw.mp4"

W, H, FPS = 1920, 1080, 30
DUR = 69.0
TOTAL = int(DUR * FPS)

BG = (8, 12, 22)
WHITE = (255, 255, 255)
CYAN = (79, 209, 197)
GREY = (154, 166, 184)
ORANGE = (255, 159, 69)
DIM = (201, 211, 227)

F_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
F_REG = r"C:\Windows\Fonts\msyh.ttc"


def font(size, bold=True):
    return ImageFont.truetype(F_BOLD if bold else F_REG, size, index=0)


FT = {
    "big": font(168),
    "sub": font(50, False),
    "line": font(70),
    "kick": font(42),
    "step": font(38),
    "feat": font(52),
    "num": font(210),
    "th": font(34),
    "td": font(38),
    "limit": font(46),
    "foot": font(28, False),
}


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def prog(t, start, dur=0.75):
    if t < start:
        return 0.0
    return ease((t - start) / dur)


def text_at(frame, xy, s, f, color, alpha, anchor="lt"):
    if alpha <= 0:
        return
    a = int(max(0, min(255, alpha)))
    bbox = f.getbbox(s)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    layer = Image.new("RGBA", (w + 8, h + 8), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((4 - bbox[0], 4 - bbox[1]), s, font=f, fill=(*color, a))
    x, y = xy
    if anchor == "mt":
        x -= w / 2
    elif anchor == "rt":
        x -= w
    frame.alpha_composite(layer, (int(x - 4), int(y - 4)))


def center_text(frame, t, s, f, color, y, start, dur=0.75, rise=34):
    e = prog(t, start, dur)
    if e <= 0:
        return
    text_at(frame, (W / 2, y + (1 - e) * rise), s, f, color, 255 * e, "mt")


# ---------- 背景：旋转立方体 + 网格 ----------
V = [(-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
     (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]
E = [(0, 1), (1, 2), (2, 3), (3, 0), (4, 5), (5, 6), (6, 7), (7, 4),
     (0, 4), (1, 5), (2, 6), (3, 7)]


def draw_bg(img, t, strength=1.0):
    d = ImageDraw.Draw(img)
    # 网格（很淡，只当底噪，不抢字）
    g = 80
    col = (9, 14, 23)
    for x in range(0, W, g):
        d.line([(x, 0), (x, H)], fill=col)
    for y in range(0, H, g):
        d.line([(0, y), (W, y)], fill=col)

    ry = t * 0.26
    rx = math.sin(t * 0.21) * 0.36
    cyr, syr = math.cos(ry), math.sin(ry)
    cxr, sxr = math.cos(rx), math.sin(rx)
    # 立方体只占画面一小部分，别把字压在线上
    scale = min(W, H) * 0.16
    pts = []
    for x, y, z in V:
        X = x * cyr + z * syr
        Z = -x * syr + z * cyr
        Y = y * cxr - Z * sxr
        Z = y * sxr + Z * cxr
        k = 3.4 / (3.4 - Z)
        pts.append((W / 2 + X * scale * k, H / 2 + Y * scale * k))

    base = int(105 * strength)
    line_col = (base // 3, base, int(base * 0.92))
    for a, b in E:
        d.line([pts[a], pts[b]], fill=line_col, width=1)
    for p in pts:
        d.ellipse([p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2], fill=(70, 92, 104))


# ---------- 各场景 ----------
def scene_title(img, t):
    draw_bg(img, t, 1.0)
    # "Geo3D" 两色分段画，不能用两次 center_text（会重叠）
    # 用单行画 "Geo3D"，两色不好做，改为整行白 + 3D 青色分段
    img2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    e = prog(t, 0.5, 0.9)
    if e > 0:
        s1, s2 = "Geo", "3D"
        f = FT["big"]
        w1 = f.getbbox(s1)[2] - f.getbbox(s1)[0]
        w2 = f.getbbox(s2)[2] - f.getbbox(s2)[0]
        x0 = W / 2 - (w1 + w2) / 2
        y0 = 400 + (1 - e) * 40
        text_at(img2, (x0, y0), s1, f, WHITE, 255 * e)
        text_at(img2, (x0 + w1, y0), s2, f, CYAN, 255 * e)
        img.alpha_composite(img2)
    center_text(img, t, "高中立体几何 · 3D 解题与演示", FT["sub"], GREY, 640, 1.5, 0.8)


def scene_hook(img, t):
    draw_bg(img, t, 0.45)
    center_text(img, t, "搜题软件给你一段答案。", FT["line"], WHITE, 440, 7.4)
    center_text(img, t, "然后呢？", FT["line"], CYAN, 570, 9.3, 0.9, 40)


def scene_core(img, t):
    draw_bg(img, t, 0.35)
    center_text(img, t, "最 大 的 不 同", FT["kick"], CYAN, 250, 13.4)
    center_text(img, t, "坐标不由大模型给。", FT["line"], WHITE, 400, 14.0)
    center_text(img, t, "本地求解器算，逐条回验。", FT["line"], WHITE, 510, 15.7)
    center_text(img, t, "过不了就不出图 —— 宁拒不误。", FT["line"], CYAN, 640, 17.6, 0.9, 36)


def scene_pipeline(img, t):
    draw_bg(img, t, 0.35)
    center_text(img, t, "它怎么把一道题变成图", FT["kick"], CYAN, 300, 22.4)
    labels = ["题面文字", "点与关系", "约束求解", "逐条回验", "3D 图形"]
    starts = [23.2, 24.2, 25.2, 26.2, 27.2]
    f = FT["step"]
    pad_x, pad_y = 26, 24
    widths = [f.getbbox(s)[2] - f.getbbox(s)[0] + pad_x * 2 for s in labels]
    arrow_w = 46
    total = sum(widths) + arrow_w * 4
    x = W / 2 - total / 2
    y = 520
    for i, (s, st, bw) in enumerate(zip(labels, starts, widths)):
        e = prog(t, st, 0.7)
        if e > 0:
            by = y + (1 - e) * 40
            layer = Image.new("RGBA", (int(bw), 100), (0, 0, 0, 0))
            dd = ImageDraw.Draw(layer)
            dd.rounded_rectangle([0, 0, bw - 1, 99], radius=14, fill=(14, 26, 34, int(230 * e)),
                                 outline=(79, 209, 197, int(200 * e)), width=2)
            tb = f.getbbox(s)
            tw, th = tb[2] - tb[0], tb[3] - tb[1]
            dd.text(((bw - tw) / 2 - tb[0], (100 - th) / 2 - tb[1]), s, font=f,
                    fill=(255, 255, 255, int(255 * e)))
            img.alpha_composite(layer, (int(x), int(by)))
        x += bw
        if i < 4:
            ae = prog(t, st + 0.55, 0.45)
            if ae > 0:
                ax = x + 8
                ay = y + 50
                ImageDraw.Draw(img).line([(ax, ay), (ax + (arrow_w - 18) * ae, ay)],
                                         fill=(79, 209, 197, int(200 * ae)), width=3)
                if ae > 0.8:
                    ImageDraw.Draw(img).polygon(
                        [(ax + arrow_w - 18, ay - 8), (ax + arrow_w - 2, ay), (ax + arrow_w - 18, ay + 8)],
                        fill=(79, 209, 197))
            x += arrow_w


def scene_feat(img, t, base, num, title, items):
    draw_bg(img, t, 0.3)
    e = prog(t, base, 0.8)
    text_at(img, (110, 96 + (1 - e) * 30), num, FT["num"], CYAN, 40 * e)
    center_text(img, t, title, FT["kick"], CYAN, 300, base + 0.2)
    y = 430
    for i, s in enumerate(items):
        e = prog(t, base + 0.7 + i * 0.55, 0.7)
        if e > 0:
            f = FT["feat"]
            tx = 420 + (1 - e) * -40
            d = ImageDraw.Draw(img)
            d.ellipse([tx - 28, y + 26, tx - 12, y + 42], fill=(79, 209, 197))
            text_at(img, (tx, y), s, f, WHITE, 255 * e)
        y += 110


def scene_table(img, t):
    draw_bg(img, t, 0.28)
    center_text(img, t, "和主流搜题软件比一比", FT["kick"], CYAN, 170, 47.2)
    rows = [
        ("输出形式", "文字答案 + 讲解", "文字答案 + 可交互 3D", False),
        ("立体图正确性", "一般不展示立体图", "本地求解 + 逐条回验", False),
        ("角度长度标注", "写在文字里", "标在图上，本地算", False),
        ("动点", "一般不支持", "可拖动，实时联动", False),
        ("解题方法", "通常一种", "向量 / 坐标 / 基底可切", False),
        ("题库", "海量，命中即出", "没有题库，现场推理", True),
        ("手写体", "多数支持", "只支持印刷体", True),
        ("出答案速度", "命中题库很快", "现场推理较慢", True),
        ("账号与数据", "账号 + 云端", "无账号，Key 只存本机", False),
    ]
    cols = [180, 700, 1180]
    y = 288
    # 表头
    eh = prog(t, 47.6, 0.6)
    if eh > 0:
        d = ImageDraw.Draw(img)
        for x, s in zip(cols, ["维度", "主流搜题软件", "Geo3D"]):
            text_at(img, (x, y), s, FT["th"], CYAN, 255 * eh)
        d.line([(150, y + 52), (1770, y + 52)], fill=(79, 209, 197, int(110 * eh)), width=2)
    y += 78
    for i, (a, b, c, warn) in enumerate(rows):
        e = prog(t, 48.2 + i * 0.6, 0.55)
        if e > 0:
            text_at(img, (cols[0], y + (1 - e) * 16), a, FT["td"], GREY, 235 * e)
            text_at(img, (cols[1], y + (1 - e) * 16), b, FT["td"], DIM, 235 * e)
            text_at(img, (cols[2], y + (1 - e) * 16), c, FT["td"],
                    GREY if warn else WHITE, 235 * e)
        y += 70


def scene_limits(img, t):
    draw_bg(img, t, 0.28)
    center_text(img, t, "但 它 也 有 缺 点", FT["kick"], ORANGE, 240, 56.2)
    rows = [
        ("没有题库", "每道题现场推理，比命中题库慢"),
        ("只认印刷体", "手写题拍进来识别不了"),
        ("复杂图形会建不出来", "宁拒不误的代价"),
        ("还没上架应用商店", "现在是侧载 APK"),
        ("标注多了会挤", "已按重要性分档"),
    ]
    y = 400
    for i, (k, v) in enumerate(rows):
        e = prog(t, 56.8 + i * 1.0, 0.7)
        if e > 0:
            f = FT["limit"]
            kw = f.getbbox(k)[2] - f.getbbox(k)[0]
            text_at(img, (400, y + (1 - e) * 22), k, f, ORANGE, 255 * e)
            text_at(img, (400 + kw + 30, y + (1 - e) * 22), v, f, WHITE, 235 * e)
        y += 96


def scene_end(img, t):
    draw_bg(img, t, 0.8)
    img2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    e = prog(t, 63.4, 0.9)
    if e > 0:
        f = FT["big"]
        w1 = f.getbbox("Geo")[2] - f.getbbox("Geo")[0]
        w2 = f.getbbox("3D")[2] - f.getbbox("3D")[0]
        x0 = W / 2 - (w1 + w2) / 2
        y0 = 420 + (1 - e) * 40
        text_at(img2, (x0, y0), "Geo", f, WHITE, 255 * e)
        text_at(img2, (x0 + w1, y0), "3D", f, CYAN, 255 * e)
        img.alpha_composite(img2)
    center_text(img, t, "自己拍的题，自己看得懂的图", FT["sub"], GREY, 660, 64.2, 0.8)
    center_text(img, t, "v1.0.0-my.23　高中立体几何 · 3D 解题与演示", FT["foot"], (93, 107, 130), 900, 65.2, 0.8)


def render(t):
    img = Image.new("RGBA", (W, H), (*BG, 255))
    if t < 7:
        scene_title(img, t)
    elif t < 13:
        scene_hook(img, t)
    elif t < 22:
        scene_core(img, t)
    elif t < 31:
        scene_pipeline(img, t)
    elif t < 35:
        scene_feat(img, t, 31.0, "01", "怎么把题弄进来",
                   ["拍照，或直接打字", "一张照片多题，点选要解的那道",
                    "识别结果可以改字、可以补条件", "只认印刷体，插图不当已知条件"])
    elif t < 39:
        scene_feat(img, t, 35.0, "02", "它怎么把图建出来",
                   ["模型只输出点与关系，不给坐标", "本地求解器算坐标",
                    "每条约束、每个共面逐条回验", "三档重试，都不过就如实说建不出来"])
    elif t < 43:
        scene_feat(img, t, 39.0, "03", "图形与解题",
                   ["转、缩放，能一路放大钻进模型内部", "每个面独立配色，点面切换显隐",
                    "分步解题，辅助线一条条画出来", "每一步点亮用到的点、棱、面"])
    elif t < 47:
        scene_feat(img, t, 43.0, "04", "标注、多解与动点",
                   ["三类角、长度、比例，全部本地算", "向量法 / 坐标系法 / 基底法可切换",
                    "按问分组，每问独有条件不串", "动点能拖，图形实时跟着变"])
    elif t < 56:
        scene_table(img, t)
    elif t < 63:
        scene_limits(img, t)
    else:
        scene_end(img, t)
    # 场景交界处整体淡出/淡入，避免硬切
    return img.convert("RGB")


def main():
    proc = subprocess.Popen(
        [FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
         "-c:v", "libx264", "-crf", "18", "-preset", "veryfast",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT],
        stdin=subprocess.PIPE,
    )
    for i in range(TOTAL):
        t = i / FPS
        frame = render(t)
        proc.stdin.write(frame.tobytes())
        if i % 300 == 0:
            print(f"{i}/{TOTAL}  t={t:.1f}s", flush=True)
    proc.stdin.close()
    proc.wait()
    print("done", OUT)


if __name__ == "__main__":
    main()
