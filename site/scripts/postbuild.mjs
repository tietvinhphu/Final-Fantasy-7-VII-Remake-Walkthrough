// Chạy sau `next build`: biến bản xuất của Next thành HTML tĩnh nhẹ.
//  1. Đóng gói client/main.ts (TypeScript thuần) thành out/assets/app.<hash>.js
//  2. Gỡ runtime React/Next và dữ liệu hydrate khỏi HTML (người đọc không cần chúng)
//  3. Xóa phần JS/RSC thừa trong out/_next và các file .txt
//  4. Ghi CSP (thẻ meta) với hash SHA-256 của từng script nội tuyến còn lại, không dùng 'unsafe-inline'
import { build } from "esbuild";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const BASE = process.env.NEXT_PUBLIC_BASE ?? "/Final-Fantasy-7-VII-Remake-Walkthrough";

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

// 1. Đóng gói client
const bundle = await build({
  entryPoints: ["client/main.ts"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  write: false,
  legalComments: "none",
});
const js = bundle.outputFiles[0].text;
const jsHash = crypto.createHash("sha256").update(js).digest("hex").slice(0, 10);
const jsName = `app.${jsHash}.js`;
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
fs.writeFileSync(path.join(OUT, "assets", jsName), js);

// 3. Dọn out/_next: chỉ giữ css và media (font)
const staticDir = path.join(OUT, "_next", "static");
for (const e of fs.readdirSync(staticDir)) {
  if (e !== "css" && e !== "media") fs.rmSync(path.join(staticDir, e), { recursive: true, force: true });
}
for (const f of walk(OUT)) if (f.endsWith(".txt")) fs.rmSync(f);
fs.rmSync(path.join(OUT, "_next", "server"), { recursive: true, force: true });
if (fs.existsSync(path.join(OUT, "404.html"))) fs.rmSync(path.join(OUT, "404"), { recursive: true, force: true }); // GitHub Pages chỉ dùng 404.html

// 2 + 4. Biến đổi HTML
let removed = 0;
for (const file of walk(OUT).filter((f) => f.endsWith(".html"))) {
  let html = fs.readFileSync(file, "utf8");
  const before = html.length;
  const hashes = new Set();

  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g, (all, attrs, body) => {
    if (/\bsrc=/.test(attrs)) return /\/_next\//.test(attrs) ? "" : all; // script ngoài của Next: bỏ
    if (/__next_f|self\.__next|\$RC|\$RS|\$RV/.test(body)) return ""; // dữ liệu hydrate / streaming của React: bỏ
    hashes.add("'sha256-" + crypto.createHash("sha256").update(body).digest("base64") + "'");
    return all; // script nội tuyến của site (boot): giữ lại và cho vào CSP
  });
  html = html.replace(/<link\b[^>]*rel="(?:preload|modulepreload)"[^>]*(?:as="script"|\/_next\/static\/chunks)[^>]*\/?>/g, "");
  html = html.replace(/<template\b[^>]*data-dgst[^>]*>[\s\S]*?<\/template>/g, "");

  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(" ")}`.trim(),
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; ");
  html = html.replace(/<meta charSet="utf-8"\/>|<meta charset="utf-8"\/?>/i, (m) => `${m}<meta http-equiv="Content-Security-Policy" content="${csp}"/>`);
  html = html.replace("</head>", `<script defer src="${BASE}/assets/${jsName}"></script></head>`);
  fs.writeFileSync(file, html);
  removed += before - html.length;
}

console.log(`postbuild: app.${jsHash}.js ${(js.length / 1024).toFixed(1)} KB, gỡ ${(removed / 1024).toFixed(0)} KB dữ liệu runtime khỏi HTML`);
