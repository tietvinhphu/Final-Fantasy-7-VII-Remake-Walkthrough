// Chép bản dựng (site/out) ra gốc repo để GitHub Pages phát hành từ nhánh main, thư mục gốc.
// Không đụng tới images/, chapters/, site/ và các file nguồn khác.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const ROOT = path.resolve("..");

if (!fs.existsSync(path.join(OUT, "index.html"))) {
  console.error("Chưa có site/out. Chạy `npm run build` trước.");
  process.exit(1);
}

// Xóa phần đã sinh ở lần trước (cả bản dựng Python cũ)
const GENERATED = ["index.html", "404.html", "404", "style.css", "app.js", "robots.txt", "_next", "assets", "chuong"];
for (const name of GENERATED) fs.rmSync(path.join(ROOT, name), { recursive: true, force: true });
for (const f of fs.readdirSync(ROOT)) if (/^chapter-\d+\.html$/.test(f)) fs.rmSync(path.join(ROOT, f));

fs.cpSync(OUT, ROOT, { recursive: true });
fs.writeFileSync(path.join(ROOT, ".nojekyll"), "");
fs.writeFileSync(path.join(ROOT, "robots.txt"), "User-agent: *\nDisallow: /\n");

// Đường dẫn cũ chapter-NN.html chuyển hướng sang /chuong/N/ để liên kết đã chia sẻ không chết
const chapters = fs.readdirSync(path.join(OUT, "chuong"));
for (const n of chapters) {
  const target = `chuong/${n}/`;
  const stub = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${target}"><title>Chuyển hướng…</title><script>location.replace("${target}"+location.hash)</script><noscript><meta http-equiv="refresh" content="0; url=${target}"></noscript></head><body><a href="${target}">Chuyển tới Chương ${n}</a></body></html>\n`;
  fs.writeFileSync(path.join(ROOT, `chapter-${String(n).padStart(2, "0")}.html`), stub);
}
console.log(`publish: đã chép ra gốc repo, ${chapters.length} trang chương + ${chapters.length} trang chuyển hướng cũ`);
