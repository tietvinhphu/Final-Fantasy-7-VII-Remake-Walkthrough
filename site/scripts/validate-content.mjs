// Kiểm tra nội dung trước khi dựng: bắt lỗi ở file nguồn thay vì để người đọc gặp.
// Chạy: node --experimental-strip-types scripts/validate-content.mjs   (hoặc `npm run check`)
// Thoát mã 1 nếu có LỖI; CẢNH BÁO chỉ in ra.
import fs from "node:fs";
import path from "node:path";
import { getChapters } from "../lib/content.ts";

const ROOT = path.resolve("..");
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const KINDS = "chest|pickup|boss|tip|warn|hard|quest|reward";
const chapters = getChapters();
if (chapters.length === 0) err("Không đọc được chương nào trong chapters/");

for (const f of fs.readdirSync(path.join(ROOT, "chapters")).filter((x) => x.endsWith(".md"))) {
  const lines = fs.readFileSync(path.join(ROOT, "chapters", f), "utf8").split("\n");
  let open = null;
  lines.forEach((ln, i) => {
    const m = ln.match(new RegExp(`^:::(\\w+)`));
    if (m && !new RegExp(`^(${KINDS})$`).test(m[1])) err(`${f}:${i + 1} loại khối lạ ":::${m[1]}"`);
    if (m && new RegExp(`^(${KINDS})$`).test(m[1])) {
      if (open) err(`${f}:${i + 1} mở khối mới khi khối ở dòng ${open} chưa đóng`);
      open = i + 1;
    } else if (ln.trim() === ":::") {
      if (!open) err(`${f}:${i + 1} ":::" đóng khi không có khối nào mở`);
      open = null;
    }
  });
  if (open) err(`${f}: khối mở ở dòng ${open} không được đóng`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "images", "manifest.json"), "utf8"));
const norm = (t) => t.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/");
const seenFiles = new Map();

for (const c of chapters) {
  const ids = new Set();
  if (!/^https:\/\/www\.powerpyx\.com\//.test(c.source)) err(`Chương ${c.num}: thiếu hoặc sai "source" (bắt buộc ghi nguồn)`);
  if (!c.summary) warn(`Chương ${c.num}: thiếu summary`);
  if (c.steps.length === 0) err(`Chương ${c.num}: không có bước nào`);
  for (const s of c.steps) {
    if (ids.has(s.id)) err(`Chương ${c.num}: id bước trùng "${s.id}"`);
    ids.add(s.id);
    if (s.nodes.length === 0) warn(`Chương ${c.num}, bước "${s.title}": rỗng`);
    for (const im of s.images) if (!fs.existsSync(path.join(ROOT, im.src))) err(`Chương ${c.num}: thiếu ảnh ${im.src}`);
  }
  // Ảnh trong manifest không gắn vào bước nào = hình bị bỏ sót khi hiển thị
  const stepNames = new Set(c.steps.map((s) => norm(s.title)));
  for (const sec of manifest[String(c.num).padStart(2, "0")] ?? []) {
    const n = norm(sec.section);
    if (n !== "intro" && !stepNames.has(n)) warn(`Chương ${c.num}: ${sec.files.length} ảnh của mục "${sec.section}" không gắn vào bước nào`);
    for (const file of sec.files) {
      if (!fs.existsSync(path.join(ROOT, file))) err(`manifest: thiếu file ${file}`);
      if (seenFiles.has(file)) err(`manifest: ${file} dùng hai lần (${seenFiles.get(file)} và chương ${c.num})`);
      seenFiles.set(file, `chương ${c.num}`);
    }
  }
  // Mỗi chương nên có nhãn Boss khi có tiêu đề Boss; nhiệm vụ phụ phải có khối quest
  for (const s of c.steps) {
    if (s.side && !s.nodes.some((n) => n.t === "block" && n.kind === "quest")) err(`Chương ${c.num}: nhiệm vụ phụ "${s.name}" thiếu khối :::quest`);
  }
}

for (const w of warns) console.warn("CẢNH BÁO  " + w);
for (const e of errors) console.error("LỖI      " + e);
console.log(`validate-content: ${chapters.length} chương, ${chapters.reduce((a, c) => a + c.steps.length, 0)} bước, ${errors.length} lỗi, ${warns.length} cảnh báo`);
process.exit(errors.length ? 1 : 0);
