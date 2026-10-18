# -*- coding: utf-8 -*-
"""生成 15 张 1920x1080 深色字幕卡片（纯 PIL，无外部素材）。"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
BG = (11, 16, 32)        # #0B1020
WHITE = (255, 255, 255)
TEAL = (79, 209, 197)    # #4FD1C5
MUTED = (154, 166, 184)  # #9AA6B8
GRID = (19, 26, 46)      # 极淡网格
LINE = (34, 46, 74)      # 分隔细线

FONT_BOLD = r"C:\Windows\Fonts\msyhbd.ttc"
FONT_REG = r"C:\Windows\Fonts\msyh.ttc"
OUT_DIR = Path(r"F:\deep seek-harness\geo3d\promo\cards")

_fonts = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size, index=0)
    return _fonts[key]


def put(d, s, cx, cy, size, color=WHITE, bold=False, left_x=None, max_w=None):
    """用 textbbox 量真实尺寸后居中（或按 left_x 左对齐），并校验不出画布。"""
    f = font(size, bold)
    x0, y0, x1, y1 = d.textbbox((0, 0), s, font=f)
    w, h = x1 - x0, y1 - y0
    if max_w is not None and w > max_w:
        raise ValueError(f"文字超宽 {w}>{max_w}: {s!r}")
    x = (left_x if left_x is not None else cx - w / 2) - x0
    y = cy - h / 2 - y0
    if x + x0 < 0 or x + x1 > W or y + y0 < 0 or y + y1 > H:
        raise ValueError(f"文字越界: {s!r} bbox=({x + x0:.0f},{y + y0:.0f},{x + x1:.0f},{y + y1:.0f})")
    d.text((x, y), s, font=f, fill=color)
    return w, h


def new_card():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)


def save(img, name):
    img.save(OUT_DIR / name)


# ---------- 01 标题 ----------
def card_title():
    img, d = new_card()
    for x in range(0, W + 1, 80):
        d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H + 1, 80):
        d.line([(0, y), (W, y)], fill=GRID, width=1)
    put(d, "Geo3D", W / 2, 430, 160, WHITE, bold=True)
    d.rounded_rectangle([W / 2 - 60, 545, W / 2 + 60, 549], radius=2, fill=TEAL)
    put(d, "高中立体几何 · 3D 解题与演示", W / 2, 640, 64, MUTED)
    save(img, "01-title.png")


# ---------- 02 钩子 ----------
def card_hook():
    img, d = new_card()
    put(d, "搜题软件给你一段答案。", W / 2, 465, 110, WHITE, bold=True)
    put(d, "然后呢？", W / 2, 615, 110, TEAL, bold=True)
    save(img, "02-hook.png")


# ---------- 03 核心 ----------
def card_core():
    img, d = new_card()
    d.rounded_rectangle([W / 2 - 40, 178, W / 2 + 40, 182], radius=2, fill=TEAL)
    put(d, "最大的不同", W / 2, 250, 56, TEAL)
    lines = ["坐标不由大模型给", "本地求解器算，逐条回验", "过不了就不出图"]
    for i, s in enumerate(lines):
        put(d, s, W / 2, 420 + i * 130, 84, WHITE)
    save(img, "03-core.png")


# ---------- 04 五步流程 ----------
def card_pipeline():
    img, d = new_card()
    labels = ["题面文字", "点与关系", "约束求解", "逐条回验", "3D 图形"]
    bw, bh, gap = 290, 132, 58
    total = len(labels) * bw + (len(labels) - 1) * gap
    x = (W - total) / 2
    cy = 540
    for i, s in enumerate(labels):
        box = [x, cy - bh / 2, x + bw, cy + bh / 2]
        d.rounded_rectangle(box, radius=20, outline=TEAL, width=3)
        put(d, s, x + bw / 2, cy, 44, WHITE, max_w=bw - 40)
        if i < len(labels) - 1:
            ax1, ax2 = x + bw + 12, x + bw + gap - 12
            d.line([(ax1, cy), (ax2, cy)], fill=TEAL, width=3)
            d.polygon([(ax2, cy), (ax2 - 16, cy - 10), (ax2 - 16, cy + 10)], fill=TEAL)
        x += bw + gap
    save(img, "04-pipeline.png")


# ---------- 05 对比表 ----------
TABLE = [
    ("输出形式", "文字答案 + 讲解", "文字答案 + 可交互 3D"),
    ("立体图正确性", "一般不展示立体图", "本地求解 + 逐条回验"),
    ("角度长度标注", "写在文字里", "标在图上，本地算"),
    ("动点", "一般不支持", "可拖动，实时联动"),
    ("解题方法", "通常一种", "向量 / 坐标 / 基底可切"),
    ("多小问", "一起给", "按问分组，条件不串"),
    ("题库", "海量，命中即出", "没有题库，现场推理"),
    ("手写体", "多数支持", "只支持印刷体"),
    ("讲题视频", "有", "没有"),
    ("出答案速度", "命中题库很快", "现场推理较慢"),
    ("账号与数据", "账号 + 云端", "无账号，Key 只存本机"),
]
MUTED_ROWS = {7, 8, 10}  # 第 7、8、10 行 Geo3D 落后


def card_compare():
    img, d = new_card()
    head = ("维度", "主流搜题软件", "Geo3D")
    tw = 1640
    x0 = (W - tw) / 2
    cols = [x0, x0 + tw * 0.25, x0 + tw * 0.625]
    col_w = [tw * 0.25, tw * 0.375, tw * 0.375]
    hh, rh = 66, 58
    top = (H - (hh + rh * 11)) / 2
    pad = 26

    for i, s in enumerate(head):
        put(d, s, cols[i] + pad, top + hh / 2, 38, TEAL, bold=True, left_x=cols[i] + pad,
            max_w=col_w[i] - 2 * pad)
    d.line([(x0, top + hh - 4), (x0 + tw, top + hh - 4)], fill=TEAL, width=2)

    for r, row in enumerate(TABLE, start=1):
        cy = top + hh + (r - 1) * rh + rh / 2
        for c, s in enumerate(row):
            color = MUTED if (c == 2 and r in MUTED_ROWS) else WHITE
            put(d, s, cols[c] + pad, cy, 38, color, left_x=cols[c] + pad,
                max_w=col_w[c] - 2 * pad)
        d.line([(x0, cy + rh / 2), (x0 + tw, cy + rh / 2)], fill=LINE, width=1)
    save(img, "05-compare.png")


# ---------- 06 缺点 ----------
def card_limits():
    img, d = new_card()
    put(d, "但它也有缺点", W / 2, 200, 96, WHITE, bold=True)
    put(d, "这些不是 bug，是取舍，或者还没做完", W / 2, 305, 44, MUTED)
    items = [
        "没有题库，每道题现场推理，比命中题库慢",
        "只认印刷体，手写题拍进来识别不了",
        "复杂图形会建不出来 —— 宁拒不误的代价",
        "还没上架应用商店，现在是侧载 APK",
        "标注多了会挤，已按重要性分档",
    ]
    for i, s in enumerate(items):
        cy = 430 + i * 92
        d.rounded_rectangle([168, cy - 6, 180, cy + 6], radius=3, fill=TEAL)
        put(d, s, 210, cy, 46, WHITE, left_x=210, max_w=W - 210 - 140)
    save(img, "06-limits.png")


# ---------- 07 结尾 ----------
def card_end():
    img, d = new_card()
    put(d, "Geo3D", W / 2, 400, 130, WHITE, bold=True)
    put(d, "自己拍的题，自己看得懂的图", W / 2, 545, 60, WHITE)
    d.rounded_rectangle([W / 2 - 50, 640, W / 2 + 50, 643], radius=2, fill=TEAL)
    put(d, "v1.0.0-my.23", W / 2, 980, 34, MUTED)
    save(img, "07-end.png")


# ---------- 08-15 章节卡 ----------
CHAPTERS = [
    ("怎么把题弄进来", "拍照 或 直接打字"),
    ("它怎么把图建出来", "本地求解，逐条回验"),
    ("图形怎么看", "能转、能放大、能钻进去"),
    ("怎么讲这道题", "分步，辅助线一条条画出来"),
    ("标注", "角度、长度、比例，全部本地算"),
    ("多问 · 三种解法", "按问分开，条件不串"),
    ("动点 · 立体库", "拖得动，图形跟着变"),
    ("存档 · 导出 · 离线", "存得住，带得走，断网也能看"),
]


def card_chapter(idx, title, sub):
    img, d = new_card()
    put(d, f"0{idx}", 0, 140, 48, TEAL, left_x=140)
    d.rounded_rectangle([140, 196, 200, 200], radius=2, fill=TEAL)
    put(d, title, W / 2, 510, 120, WHITE, bold=True, max_w=W - 240)
    put(d, sub, W / 2, 660, 52, MUTED, max_w=W - 240)
    save(img, f"{7 + idx:02d}-ch{idx}.png")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    card_title()
    card_hook()
    card_core()
    card_pipeline()
    card_compare()
    card_limits()
    card_end()
    for i, (title, sub) in enumerate(CHAPTERS, start=1):
        card_chapter(i, title, sub)
    # 回读校验
    files = sorted(OUT_DIR.glob("*.png"))
    if len(files) != 15:
        raise SystemExit(f"图片数量不对: {len(files)}")
    for p in files:
        with Image.open(p) as im:
            im.load()
            assert im.size == (W, H), f"{p.name} 尺寸 {im.size}"
            assert im.mode == "RGB", f"{p.name} 模式 {im.mode}"
        print(f"{p.name}\t{im.size[0]}x{im.size[1]}")
    print(f"OK 15 张 -> {OUT_DIR}")


if __name__ == "__main__":
    main()
