"""
生成 Geo3D 的安卓应用图标。

设计取向：**不写文字，画一个立体的线框**。理由 ——
  · 文字在不同尺寸下会糊，而且中文字体在这台机器上不一定有；
  · 这个应用本身就是「立体几何 + 3D」，一个透视线框最能说明它是干什么的；
  · 主屏上一眼看得出和几何有关，比一个字母强。

配色跟应用界面一致：深底 #0f1319、青蓝色线（应用里的立体线框就是这个色）、
橙色高亮一个顶点（应用里的动点标记也是橙色）。

用 PIL 直接画，不引入任何新依赖。输出覆盖 Capacitor 生成的各个 mipmap 尺寸，
再生成自适应图标的前景层（内容缩到 66%，留给系统裁切）。
"""
from PIL import Image, ImageDraw
import os

OUT = r'F:\deep seek-harness\geo3d\android\app\src\main\res'
BG = (15, 19, 25, 255)  # #0f1319 跟应用底色一致
LINE = (122, 162, 255, 255)  # 应用里的立体线框色
LINE2 = (90, 120, 190, 255)
ACCENT = (255, 159, 67, 255)  # 橙色：应用里动点的颜色

# 各密度对应的图标边长
SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}


def draw_icon(size, with_bg=True, scale=1.0):
    """画一张 size×size 的图标。scale 用来把内容缩小（自适应图标的前景层要留边）。"""
    img = Image.new('RGBA', (size, size), BG if with_bg else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = size * scale
    ox = (size - s) / 2
    oy = (size - s) / 2

    def P(x, y):
        return (ox + x * s, oy + y * s)

    w = max(2, int(size * 0.035))  # 线宽跟着尺寸走

    # 一个立体（前底 + 后顶），透视一点的写法：正面方形 + 右上方平行拷贝 + 连线
    front = [P(0.18, 0.42), P(0.62, 0.42), P(0.62, 0.84), P(0.18, 0.84)]
    back = [P(0.38, 0.18), P(0.82, 0.18), P(0.82, 0.60), P(0.38, 0.60)]

    # 后面的立方先画，被挡住的线用暗一点的色
    d.line(back + [back[0]], fill=LINE2, width=w, joint='curve')
    # 连接前后
    for i in range(4):
        d.line([front[i], back[i]], fill=LINE2, width=w)
    # 前面那个面最亮
    d.line(front + [front[0]], fill=LINE, width=w, joint='curve')
    # 橙色点：一个动点
    r = size * 0.055
    px, py = P(0.62, 0.42)
    d.ellipse([px - r, py - r, px + r, py + r], fill=ACCENT)
    return img


made = 0
for folder, size in SIZES.items():
    target = os.path.join(OUT, folder)
    if not os.path.isdir(target):
        continue
    icon = draw_icon(size)
    icon.save(os.path.join(target, 'ic_launcher.png'))
    # 圆形图标：同一个画面，系统自己会裁
    icon.save(os.path.join(target, 'ic_launcher_round.png'))
    # 自适应图标的前景层：内容缩到 66%，四周透明，系统裁切时才不会被切掉
    fg = draw_icon(size, with_bg=False, scale=0.66)
    fg.save(os.path.join(target, 'ic_launcher_foreground.png'))
    made += 1
    print(f'  {folder}: {size}x{size}')

print(f'完成，覆盖了 {made} 个密度目录')
