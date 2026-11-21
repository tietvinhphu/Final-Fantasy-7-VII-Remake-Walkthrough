#!/usr/bin/env python3
"""Dựng trang web tĩnh từ chapters/*.md vào docs/. Chỉ dùng thư viện chuẩn.

Chạy:  python3 build.py
Xem thử:  cd docs && python3 -m http.server 8765
"""
import html
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "chapters"
OUT = ROOT / "docs"
ASSETS = ROOT / "web-assets"

SITE_TITLE = "Final Fantasy VII Remake — Hướng dẫn tiếng Việt"
TITLE_SUFFIX = " (Hướng dẫn, bản dịch tiếng Việt)"
CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
       "object-src 'none'; base-uri 'self'; form-action 'none'")


def slugify(text, used):
    s = re.sub(r"[^\w\s-]", "", text.lower(), flags=re.UNICODE)
    s = re.sub(r"[\s_]+", "-", s).strip("-") or "muc"
    base, n = s, 2
    while s in used:
        s, n = f"{base}-{n}", n + 1
    used.add(s)
    return s


def inline(text):
    """Escape rồi áp dụng **đậm**, `code`, [chữ](url), <url>."""
    t = html.escape(text, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
               r'<a href="\2" rel="noopener noreferrer">\1</a>', t)
    t = re.sub(r"&lt;(https?://[^&\s]+)&gt;",
               r'<a href="\1" rel="noopener noreferrer">\1</a>', t)
    return t


def render(md, chapter_key):
    """Trả về (html thân bài, danh sách mục [(id, text)], số mục tiêu)."""
    lines = md.splitlines()
    out, toc, used = [], [], set()
    i, n_obj, title = 0, 0, ""
    after_objective_label = False
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1
            continue
        m = re.match(r"(#{1,6})\s+(.*)", ln)
        if m:
            level, text = len(m.group(1)), m.group(2).strip()
            if level == 1:
                title = text
                out.append(f"<h1>{inline(text.removesuffix(TITLE_SUFFIX))}</h1>")
            else:
                hid = slugify(text, used)
                if level == 2:
                    toc.append((hid, text))
                out.append(f'<h{level} id="{hid}">{inline(text)}</h{level}>')
            after_objective_label = False
            i += 1
            continue
        if ln.startswith(">"):
            block = []
            while i < len(lines) and lines[i].startswith(">"):
                block.append(lines[i].lstrip(">").strip())
                i += 1
            out.append("<blockquote><p>" + "<br>".join(inline(b) for b in block) + "</p></blockquote>")
            continue
        if ln.startswith("- "):
            items = []
            while i < len(lines) and lines[i].startswith("- "):
                items.append(lines[i][2:].strip())
                i += 1
            if after_objective_label:
                lis = []
                for it in items:
                    n_obj += 1
                    lis.append(f'<li><label class="obj"><input type="checkbox" data-obj="{n_obj}"> '
                               f'<span>{inline(it)}</span></label></li>')
                out.append('<ul class="objectives">' + "".join(lis) + "</ul>")
            else:
                out.append("<ul>" + "".join(f"<li>{inline(it)}</li>" for it in items) + "</ul>")
            after_objective_label = False
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r"(#{1,6}\s|>|- )", lines[i]):
            para.append(lines[i].strip())
            i += 1
        after_objective_label = para[0].startswith("**Mục tiêu")
        out.append("<p>" + "<br>".join(inline(p) for p in para) + "</p>")
    return "\n".join(out), toc, n_obj, title


def page(title, body, rel, side="", nav="", key="", total=0):
    attrs = f' data-chapter="{key}" data-total="{total}"' if key else ""
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>{html.escape(title)}</title>
<link rel="stylesheet" href="{rel}style.css">
<script src="{rel}app.js"></script>
</head>
<body{attrs}>
<header class="bar">
<a class="brand" href="{rel}index.html">FF7 Remake · Hướng dẫn tiếng Việt</a>
<button type="button" id="theme-toggle" class="btn" aria-label="Đổi giao diện sáng/tối">Giao diện</button>
</header>
<div class="layout">
{side}<main>
{body}
{nav}</main>
</div>
</body>
</html>
"""


def main():
    chapters = []
    for f in sorted(SRC.glob("*.md")):
        num = int(f.name.split("-", 1)[0])
        key = f"ff7r-vi-ch{num:02d}"
        body, toc, n_obj, title = render(f.read_text(encoding="utf-8"), key)
        chapters.append(dict(num=num, key=key, file=f"chapter-{num:02d}.html", body=body,
                             toc=toc, n_obj=n_obj, title=title.removesuffix(TITLE_SUFFIX)))
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for a in ASSETS.iterdir():
        shutil.copy(a, OUT / a.name)

    for idx, c in enumerate(chapters):
        side = '<nav class="toc" aria-label="Mục lục chương"><p class="toc-title">Trong chương này</p><ol>' + \
            "".join(f'<li><a href="#{hid}">{html.escape(t)}</a></li>' for hid, t in c["toc"]) + "</ol></nav>\n"
        prev_l = chapters[idx - 1] if idx else None
        next_l = chapters[idx + 1] if idx + 1 < len(chapters) else None
        nav = '<nav class="pager" aria-label="Chuyển chương">'
        nav += (f'<a href="{prev_l["file"]}">← {html.escape(prev_l["title"])}</a>' if prev_l else "<span></span>")
        nav += (f'<a href="{next_l["file"]}">{html.escape(next_l["title"])} →</a>' if next_l else "<span></span>")
        nav += "</nav>\n"
        (OUT / c["file"]).write_text(
            page(c["title"], c["body"], "", side, nav, c["key"], c["n_obj"]), encoding="utf-8")

    rows = "".join(
        f'<li><a href="{c["file"]}" data-chapter="{c["key"]}" data-total="{c["n_obj"]}">'
        f'<span class="ch-title">{html.escape(c["title"])}</span>'
        f'<span class="ch-progress" aria-label="Tiến độ mục tiêu"></span></a></li>' for c in chapters)
    index_body = ("<h1>Final Fantasy VII Remake</h1>"
                  "<p>Bản dịch tiếng Việt cá nhân các bài hướng dẫn của PowerPyx, dùng để tra cứu khi chơi. "
                  "Tiến độ mục tiêu lưu trong trình duyệt của bạn.</p>"
                  f'<ol class="chapters">{rows}</ol>'
                  '<p class="note">Nội dung gốc thuộc về PowerPyx. Đây là bản dịch cá nhân, không phải bản chính thức.</p>')
    (OUT / "index.html").write_text(page(SITE_TITLE, index_body, ""), encoding="utf-8")
    print(f"Đã dựng {len(chapters)} chương vào {OUT}")


if __name__ == "__main__":
    main()
