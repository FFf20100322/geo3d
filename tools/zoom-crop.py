"""把手机截图里的某一小块放大出来，用来核对小字到底写的是什么。

截图本身是原分辨率的（1440×3168），但视觉读图时会被整体缩小，小字容易被看错。
所以需要的时候用这个脚本切一块放大，再单独看那一小块。

用法：python tools/zoom-crop.py 输入.png 输出.png x y w h [放大倍数]
坐标一律按原始图片的像素给。
"""
import sys

from PIL import Image


def main() -> None:
    if len(sys.argv) < 7:
        print(__doc__)
        raise SystemExit(1)
    src, dst = sys.argv[1], sys.argv[2]
    x, y, w, h = (int(v) for v in sys.argv[3:7])
    scale = int(sys.argv[7]) if len(sys.argv) > 7 else 3

    img = Image.open(src)
    box = img.crop((x, y, x + w, y + h))
    box = box.resize((box.width * scale, box.height * scale), Image.LANCZOS)
    box.save(dst)
    print(f"{dst}  {box.width}x{box.height}（原图 {w}x{h}，放大 {scale} 倍）")


if __name__ == "__main__":
    main()
