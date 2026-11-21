#!/usr/bin/env python3
"""Dựng trang web tĩnh từ chapters/*.md ra gốc repo (GitHub Pages phát hành từ gốc).
Chỉ dùng thư viện chuẩn.

Chạy:     python3 build.py
Xem thử:  python3 -m http.server 8765

Định dạng chương (chapters/NN-slug.md):

    ---
    number: 3
    title: Home Sweet Slum
    area: Sector 5 Slums
    summary: Một câu tóm tắt chương.
    source: https://www.powerpyx.com/...
    ---
    Đoạn dẫn nhập (tùy chọn).

    ## Tên mục tiêu trong game        <- mỗi ## là một bước trên timeline
    Đoạn văn, **đậm**, `code`, [chữ](url), nút bấm {□} {R1}.
    - gạch đầu dòng

    :::chest 2 Potions               <- rương / vật phẩm nhặt được
    Vị trí rương.
    :::

    :::boss Scorpion Sentinel
    weak: Lightning, Fire            <- dòng weak: thành chip điểm yếu
    Chiến thuật...
    :::

    Loại khối khác:  pickup (cầu Materia...), tip, warn, hard (mẹo Hard Mode).

Hình ảnh lấy từ images/manifest.json theo tên mục tiêu (không ghi trong .md).
"""
import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "chapters"
OUT = ROOT
ASSETS = ROOT / "web-assets"
ORIGIN = "https://www.powerpyx.com/"

SITE_TITLE = "Final Fantasy VII Remake — Hướng dẫn tiếng Việt"
CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
       "object-src 'none'; base-uri 'self'; form-action 'none'")
BLOCKS = {
    "chest": ("Rương", "◆"),
    "pickup": ("Nhặt", "●"),
    "boss": ("Boss", "☠"),
    "tip": ("Mẹo", "✦"),
    "warn": ("Lưu ý", "!"),
    "hard": ("Hard Mode", "▲"),
}
UPCOMING = [
    ("Nhiệm vụ phụ", "26 nhiệm vụ, gộp vào đúng chương"),
    ("Sưu tầm và trang bị", "Materia, Armor, Accessory, Summon, Music Disc..."),
    ("Boss và hệ thống chiến đấu", "Tất cả boss, Stagger, Hard Mode, Fort Condor"),
    ("DLC Yuffie (INTERmission)", "2 chương, sưu tầm, boss Weiss"),
]


def norm(t):
    return re.sub(r"\s*/\s*", "/", re.sub(r"\s+", " ", t.strip().lower()))


def slugify(text, used):
    s = re.sub(r"[^\w\s-]", "", text.lower(), flags=re.UNICODE)
    s = re.sub(r"[\s_]+", "-", s).strip("-") or "muc"
    base, n = s, 2
    while s in used:
        s, n = f"{base}-{n}", n + 1
    used.add(s)
    return s


def inline(text):
    t = html.escape(text, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\{([^{}]{1,16})\}", r"<kbd>\1</kbd>", t)
    t = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
               r'<a href="\2" rel="noopener noreferrer">\1</a>', t)
    t = re.sub(r"&lt;(https?://[^&\s]+)&gt;", r'<a href="\1" rel="noopener noreferrer">\1</a>', t)
    return t


def front_matter(md):
    meta = {}
    if md.startswith("---\n"):
        end = md.find("\n---\n", 4)
        if end != -1:
            for ln in md[4:end].splitlines():
                if ":" in ln:
                    k, v = ln.split(":", 1)
                    meta[k.strip()] = v.strip()
            md = md[end + 5:]
    return meta, md


def render_blocks(lines, stats):
    """Chuyển danh sách dòng Markdown (đã bỏ heading ##) thành HTML."""
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1
            continue
        m = re.match(r":::(\w+)\s*(.*)", ln)
        if m and m.group(1) in BLOCKS:
            kind, title = m.group(1), m.group(2).strip()
            i += 1
            body = []
            while i < len(lines) and lines[i].strip() != ":::":
                body.append(lines[i])
                i += 1
            i += 1
            chips = ""
            if kind == "boss" and body and body[0].startswith("weak:"):
                weak = [w.strip() for w in body.pop(0)[5:].split(",") if w.strip()]
                chips = '<p class="weak"><span>Yếu</span>' + "".join(f"<b>{html.escape(w)}</b>" for w in weak) + "</p>"
            label, icon = BLOCKS[kind]
            if kind in ("chest", "pickup"):
                stats.append((kind, title))
            out.append(
                f'<aside class="blk blk-{kind}"><div class="blk-head"><span class="blk-ico" aria-hidden="true">{icon}</span>'
                f'<span class="blk-label">{label}</span>{"<strong>" + html.escape(title) + "</strong>" if title else ""}</div>'
                f'<div class="blk-body">{chips}{render_blocks(body, stats)}</div></aside>')
            continue
        if ln.startswith(">"):
            block = []
            while i < len(lines) and lines[i].startswith(">"):
                block.append(lines[i].lstrip(">").strip())
                i += 1
            out.append("<blockquote><p>" + "<br>".join(inline(b) for b in block) + "</p></blockquote>")
            continue
        if re.match(r"[-*] ", ln):
            items = []
            while i < len(lines) and re.match(r"[-*] ", lines[i]):
                items.append(lines[i][2:].strip())
                i += 1
            out.append("<ul>" + "".join(f"<li>{inline(it)}</li>" for it in items) + "</ul>")
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r"(:::|>|[-*] )", lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append("<p>" + " ".join(inline(p) for p in para) + "</p>")
    return "".join(out)


def gallery(files, label):
    if not files:
        return ""
    figs = "".join(
        f'<a class="shot" href="{f}" data-cap="{html.escape(label)}"><img loading="lazy" decoding="async" '
        f'src="{f}" alt="Hình minh họa: {html.escape(label)}"></a>' for f in files)
    return f'<div class="shots" role="group" aria-label="Hình minh họa">{figs}</div>'


def parse_chapter(path, manifest):
    meta, md = front_matter(path.read_text(encoding="utf-8"))
    num = int(meta.get("number") or path.name.split("-", 1)[0])
    key = f"ff7r-vi-ch{num:02d}"
    imgs = {norm(s["section"]): s["files"] for s in manifest.get(f"{num:02d}", [])}
    parts = re.split(r"^## ", md, flags=re.M)
    stats, used = [], set()
    lead = render_blocks(parts[0].splitlines(), stats)
    lead_gal = gallery(imgs.get("intro", []), "Mở đầu chương")
    steps = []
    for idx, sec in enumerate(parts[1:], 1):
        title, _, body = sec.partition("\n")
        title = title.strip()
        sid = slugify(title, used)
        sstats = []
        content = render_blocks(body.splitlines(), sstats)
        stats.extend(sstats)
        steps.append(dict(id=sid, title=title, html=content, gal=gallery(imgs.get(norm(title), []), title),
                          boss=title.lower().startswith("boss"), n=idx))
    art = next((f for s in manifest.get(f"{num:02d}", []) for f in s["files"]), "")
    boss_art = next((s["files"][0] for s in manifest.get(f"{num:02d}", []) if s["section"].lower().startswith("boss") and s["files"]), art)
    return dict(num=num, key=key, file=f"chapter-{num:02d}.html", art=art, boss_art=boss_art, title=meta.get("title", path.stem),
                area=meta.get("area", ""), summary=meta.get("summary", ""),
                source=meta.get("source", ORIGIN), lead=lead, lead_gal=lead_gal,
                steps=steps, loot=stats, n_img=sum(len(v) for v in imgs.values()),
                n_chest=sum(1 for k, _ in stats if k == "chest"))


def head(title):
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="color-scheme" content="dark light">
<title>{html.escape(title)}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%2712%27 fill=%27%2300d9a0%27/%3E%3C/svg%3E">
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>
</head>
"""


def topbar(chapters, current=None):
    items = "".join(
        f'<li><a href="{c["file"]}"{" aria-current=page" if c["num"] == current else ""}>'
        f'<span class="mi-n">{c["num"]:02d}</span><span>{html.escape(c["title"])}</span></a></li>' for c in chapters)
    return f"""<header class="bar">
<a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span><span>FF7 Remake<small> · Hướng dẫn tiếng Việt</small></span></a>
<div class="bar-tools">
<details class="menu"><summary class="btn">Chương</summary><ol class="menu-list">{items}</ol></details>
<button type="button" id="theme-toggle" class="btn" aria-label="Đổi giao diện sáng hoặc tối">Giao diện</button>
</div>
</header>
<div class="scrollbar" aria-hidden="true"><i></i></div>
"""


def credit(source):
    return (f'<aside class="credit" role="note">Bản dịch tiếng Việt <strong>không chính thức</strong>, viết lại từ hướng dẫn của '
            f'<strong>PowerPyx</strong> (tác giả Gage). Nội dung gốc và hình ảnh thuộc bản quyền PowerPyx. '
            f'Bài gốc: <a href="{source}" rel="noopener noreferrer">{html.escape(source.replace("https://", ""))}</a></aside>\n')


FOOT = (f'<footer class="foot">Nguồn: <a href="{ORIGIN}" rel="noopener noreferrer">PowerPyx.com</a> · '
        'Bản dịch cá nhân, chỉ để tra cứu khi chơi. Nếu chủ sở hữu yêu cầu gỡ, trang sẽ được gỡ.</footer>\n')

LIGHTBOX = """<dialog id="lightbox" aria-label="Xem hình lớn">
<figure><img alt=""><figcaption></figcaption></figure>
<button type="button" class="lb-btn lb-prev" aria-label="Hình trước">‹</button>
<button type="button" class="lb-btn lb-nx" aria-label="Hình sau">›</button>
<button type="button" class="lb-btn lb-close" aria-label="Đóng">✕</button>
</dialog>
"""


def hero_art(src):
    return f'<img class="hero-art" src="{src}" alt="" decoding="async">' if src else ""


def chapter_page(c, chapters):
    idx = chapters.index(c)
    prev_c = chapters[idx - 1] if idx else None
    next_c = chapters[idx + 1] if idx + 1 < len(chapters) else None
    total = len(c["steps"])
    toc = "".join(f'<li><a href="#{s["id"]}"><span>{s["n"]:02d}</span>{html.escape(s["title"])}</a></li>' for s in c["steps"])
    steps = []
    for s in c["steps"]:
        cls = "step boss" if s["boss"] else "step"
        steps.append(
            f'<li class="{cls} reveal" id="{s["id"]}" data-step="{s["id"]}">'
            f'<span class="node" aria-hidden="true">{s["n"]}</span>'
            f'<div class="card"><div class="card-head"><h2>{html.escape(s["title"])}</h2>'
            f'<label class="done"><input type="checkbox" data-step-box="{s["id"]}"><span>Xong</span></label></div>'
            f'<div class="card-body">{s["html"]}{s["gal"]}</div></div></li>')
    loot = ""
    if c["loot"]:
        rows = "".join(
            f'<li class="loot-{k}"><span class="blk-ico" aria-hidden="true">{BLOCKS[k][1]}</span>{html.escape(t)}</li>'
            for k, t in c["loot"])
        loot = (f'<details class="loot"><summary>Tổng hợp vật phẩm trong chương <span>{len(c["loot"])}</span></summary>'
                f'<ul>{rows}</ul></details>')
    chips = (f'<span class="chip">{total} bước</span><span class="chip">{c["n_chest"]} rương</span>'
             f'<span class="chip">{c["n_img"]} hình</span>')
    pager = '<nav class="pager" aria-label="Chuyển chương">'
    pager += (f'<a href="{prev_c["file"]}"><small>Chương trước</small>← {html.escape(prev_c["title"])}</a>' if prev_c else "")
    pager += (f'<a class="fwd" href="{next_c["file"]}"><small>Chương sau</small>{html.escape(next_c["title"])} →</a>' if next_c else "")
    pager += "</nav>"
    area = " · " + html.escape(c["area"]) if c["area"] else ""
    return (head(f'Chương {c["num"]}: {c["title"]} · FF7 Remake') +
            f'<body data-chapter="{c["key"]}" data-total="{total}">\n' + topbar(chapters, c["num"]) +
            f'<section class="hero">{hero_art(c["art"])}<div class="hero-in">'
            f'<p class="eyebrow">Chương {c["num"]:02d}{area}</p>'
            f'<h1>{html.escape(c["title"])}</h1>'
            f'<p class="sub">{html.escape(c["summary"])}</p>'
            f'<div class="chips">{chips}</div>'
            f'<div class="meter" role="progressbar" aria-label="Tiến độ chương" aria-valuemin="0" aria-valuemax="{total}" aria-valuenow="0">'
            f'<i></i></div><p class="meter-label"><span id="meter-text">0/{total}</span> bước đã xong</p>'
            f'</div></section>\n' + credit(c["source"]) +
            f'<div class="layout"><nav class="toc" aria-label="Mục lục chương"><p class="toc-title">Trong chương này</p><ol>{toc}</ol></nav>\n'
            f'<main>\n<div class="lead">{c["lead"]}{c["lead_gal"]}</div>\n{loot}\n'
            f'<ol class="timeline">{"".join(steps)}</ol>\n{pager}\n</main>\n</div>\n' + FOOT + LIGHTBOX + "</body>\n</html>\n")


def index_page(chapters):
    cards = "".join(
        f'<li class="reveal"><a class="ccard" href="{c["file"]}" data-chapter="{c["key"]}" data-total="{len(c["steps"])}">'
        f'<span class="cnum">{c["num"]:02d}</span><span class="cbody"><strong>{html.escape(c["title"])}</strong>'
        f'<small>{html.escape(c["area"])}</small></span>'
        f'<span class="ring" aria-label="Tiến độ"><b></b></span></a></li>' for i, c in enumerate(chapters))
    soon = "".join(f'<li class="reveal"><div class="ccard soon"><span class="cbody"><strong>{html.escape(t)}</strong><small>{html.escape(d)}</small></span>'
                   f'<span class="tag">Sắp có</span></div></li>' for t, d in UPCOMING)
    n_steps = sum(len(c["steps"]) for c in chapters)
    return (head(SITE_TITLE) + '<body class="home">\n' + topbar(chapters) +
            f'<section class="hero hero-home">{hero_art(chapters[0]["boss_art"])}<div class="hero-in"><p class="eyebrow">Hướng dẫn tiếng Việt · không chính thức</p>'
            f'<h1>Final Fantasy VII <span>Remake</span></h1>'
            f'<p class="sub">Lộ trình từng chương, rương, boss và mẹo, gom thành một trang để tra nhanh khi đang chơi. '
            f'Tiến độ lưu ngay trong trình duyệt của bạn.</p>'
            f'<div class="chips"><span class="chip">{len(chapters)} chương</span><span class="chip">{n_steps} bước</span>'
            f'<span class="chip">{sum(c["n_img"] for c in chapters)} hình</span></div>'
            f'<a class="cta" href="{chapters[0]["file"]}">Bắt đầu từ Chương 1</a></div></section>\n' + credit(ORIGIN) +
            f'<main class="home-main"><h2 class="h-sec">Cốt truyện</h2><ol class="grid">{cards}</ol>'
            f'<h2 class="h-sec">Đang chuẩn bị</h2><ol class="grid">{soon}</ol></main>\n' + FOOT + "</body>\n</html>\n")


def main():
    manifest_path = ROOT / "images" / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    chapters = sorted((parse_chapter(f, manifest) for f in SRC.glob("*.md")), key=lambda c: c["num"])
    for old in OUT.glob("chapter-*.html"):
        old.unlink()
    for a in ASSETS.iterdir():
        shutil.copy(a, OUT / a.name)
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    for c in chapters:
        (OUT / c["file"]).write_text(chapter_page(c, chapters), encoding="utf-8")
    (OUT / "index.html").write_text(index_page(chapters), encoding="utf-8")
    print(f"Đã dựng {len(chapters)} chương, {sum(len(c['steps']) for c in chapters)} bước, {sum(c['n_img'] for c in chapters)} hình")


if __name__ == "__main__":
    main()
