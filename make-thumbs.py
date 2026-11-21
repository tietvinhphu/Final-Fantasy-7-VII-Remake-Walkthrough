#!/usr/bin/env python3
"""Tạo ảnh thu nhỏ images/chNN/t/MM.webp (rộng 560px, WebP) cho lưới hình trong chương.
Cần Pillow (chỉ dùng khi thêm ảnh mới). Chạy: python3 make-thumbs.py
Cũng dọn các thumbnail .jpg của phiên bản trước.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
W, Q = 560, 68

made = removed = 0
for old in ROOT.glob("images/ch*/t/*.jpg"):
    old.unlink()
    removed += 1
for src in sorted(ROOT.glob("images/ch*/[0-9][0-9].jpg")):
    dst = src.parent / "t" / (src.stem + ".webp")
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        continue
    dst.parent.mkdir(exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        h = round(im.height * W / im.width)
        im.resize((W, h), Image.LANCZOS).save(dst, "WEBP", quality=Q, method=6)
    made += 1
print(f"Đã tạo {made} ảnh WebP, xóa {removed} thumbnail JPEG cũ")
