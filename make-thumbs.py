#!/usr/bin/env python3
"""Tạo ảnh thu nhỏ images/chNN/t/MM.jpg (rộng 560px) cho lưới hình trong chương.
Cần Pillow (chỉ dùng khi thêm ảnh mới; build.py vẫn chỉ dùng thư viện chuẩn).
Chạy: python3 make-thumbs.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
W, Q = 560, 70

made = 0
for src in sorted(ROOT.glob("images/ch*/[0-9][0-9].jpg")):
    dst = src.parent / "t" / src.name
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        continue
    dst.parent.mkdir(exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        h = round(im.height * W / im.width)
        im.resize((W, h), Image.LANCZOS).save(dst, "JPEG", quality=Q, optimize=True, progressive=True)
    made += 1
print(f"Đã tạo {made} ảnh thu nhỏ")
