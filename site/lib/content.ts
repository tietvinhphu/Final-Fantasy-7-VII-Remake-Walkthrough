import fs from "node:fs";
import path from "node:path";

/**
 * Đọc chapters/*.md (Markdown mở rộng) và images/manifest.json ở gốc repo.
 * Chỉ chạy lúc build (React Server Components), không vào bundle trình duyệt.
 * Định dạng mô tả ở đầu build.py; id bước giữ đúng cách tạo slug cũ để tiến độ đã lưu không mất.
 */

const ROOT = path.resolve(process.cwd(), "..");
export const SOURCE_ORIGIN = "https://www.powerpyx.com/";

export const BLOCK_KINDS = ["chest", "pickup", "boss", "tip", "warn", "hard", "quest", "reward"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export type ListItem = { text: string; subs: string[] };
export type Node =
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: ListItem[] }
  | { t: "quote"; lines: string[] }
  | { t: "block"; kind: BlockKind; title: string; weak: string[]; children: Node[] };

export type Img = { src: string; thumb: string; hasThumb: boolean };

export type Step = {
  id: string;
  title: string;
  name: string;
  label: string; // "01" hoặc "S1"
  node: string;
  side: boolean;
  boss: boolean;
  nodes: Node[];
  images: Img[];
};

export type LootItem = { kind: "chest" | "pickup" | "reward"; title: string };

export type Chapter = {
  num: number;
  key: string; // khóa localStorage, giữ như bản cũ: ff7r-vi-chNN
  title: string;
  area: string;
  summary: string;
  source: string;
  art: string;
  lead: Node[];
  leadImages: Img[];
  steps: Step[];
  loot: LootItem[];
  nMain: number;
  nSide: number;
  nChest: number;
  nImg: number;
};

type Manifest = Record<string, { section: string; files: string[] }[]>;

const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/");

function slugify(text: string, used: Set<string>) {
  let s = text.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, "");
  s = s.replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "") || "muc";
  const base = s;
  let n = 2;
  while (used.has(s)) s = `${base}-${n++}`;
  used.add(s);
  return s;
}

function frontMatter(md: string): [Record<string, string>, string] {
  const meta: Record<string, string> = {};
  if (md.startsWith("---\n")) {
    const end = md.indexOf("\n---\n", 4);
    if (end !== -1) {
      for (const ln of md.slice(4, end).split("\n")) {
        const i = ln.indexOf(":");
        if (i > 0) meta[ln.slice(0, i).trim()] = ln.slice(i + 1).trim();
      }
      md = md.slice(end + 5);
    }
  }
  return [meta, md];
}

function parseBlocks(lines: string[]): Node[] {
  const out: Node[] = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim()) {
      i++;
      continue;
    }
    const m = ln.match(/^:::(\w+)\s*(.*)/);
    if (m && (BLOCK_KINDS as readonly string[]).includes(m[1])) {
      const kind = m[1] as BlockKind;
      const title = m[2].trim();
      i++;
      const body: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") body.push(lines[i++]);
      i++;
      let weak: string[] = [];
      if (kind === "boss" && body.length && body[0].startsWith("weak:")) {
        weak = body
          .shift()!
          .slice(5)
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean);
      }
      out.push({ t: "block", kind, title, weak, children: parseBlocks(body) });
      continue;
    }
    if (ln.startsWith(">")) {
      const block: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) block.push(lines[i++].replace(/^>+/, "").trim());
      out.push({ t: "quote", lines: block });
      continue;
    }
    if (/^[-*] /.test(ln)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) items.push(lines[i++].slice(2).trim());
      out.push({ t: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(ln)) {
      const items: ListItem[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i++].replace(/^\d+\. /, "").trim();
        const subs: string[] = [];
        while (i < lines.length && /^\s+[-*] /.test(lines[i])) subs.push(lines[i++].trim().slice(2).trim());
        items.push({ text, subs });
      }
      out.push({ t: "ol", items });
      continue;
    }
    if (ln.trim() === ":::") {
      i++; // dấu đóng khối thừa: bỏ qua (validate-content sẽ báo lỗi)
      continue;
    }
    const para: string[] = [lines[i++].trim()]; // luôn tiêu thụ ít nhất một dòng, tránh vòng lặp vô hạn
    while (i < lines.length && lines[i].trim() && !/^(:::|>|[-*] |\d+\. )/.test(lines[i])) para.push(lines[i++].trim());
    out.push({ t: "p", text: para.join(" ") });
  }
  return out;
}

function collectLoot(nodes: Node[], acc: LootItem[]) {
  for (const n of nodes) {
    if (n.t !== "block") continue;
    if ((n.kind === "chest" || n.kind === "pickup" || n.kind === "reward") && n.title) acc.push({ kind: n.kind, title: n.title });
    collectLoot(n.children, acc);
  }
}

function toImg(file: string): Img {
  const p = path.posix.parse(file);
  const thumb = path.posix.join(p.dir, "t", p.base);
  const hasThumb = fs.existsSync(path.join(ROOT, thumb));
  return { src: file, thumb: hasThumb ? thumb : file, hasThumb };
}

function parseChapter(file: string, manifest: Manifest): Chapter {
  const [meta, md] = frontMatter(fs.readFileSync(file, "utf8"));
  const num = parseInt(meta.number || path.basename(file).split("-")[0], 10);
  const sections = manifest[String(num).padStart(2, "0")] ?? [];
  const imgs = new Map(sections.map((s) => [norm(s.section), s.files]));
  const parts = md.split(/^## /m);
  const loot: LootItem[] = [];
  const used = new Set<string>();
  const lead = parseBlocks(parts[0].split("\n"));
  collectLoot(lead, loot);
  let nMain = 0;
  let nSide = 0;
  const steps: Step[] = [];
  for (const sec of parts.slice(1)) {
    const nl = sec.indexOf("\n");
    const title = (nl === -1 ? sec : sec.slice(0, nl)).trim();
    const body = nl === -1 ? "" : sec.slice(nl + 1);
    const nodes = parseBlocks(body.split("\n"));
    collectLoot(nodes, loot);
    const side = title.toLowerCase().startsWith("side quest");
    let label: string, node: string, name: string;
    if (side) {
      nSide++;
      label = node = `S${nSide}`;
      name = title.split(":").slice(1).join(":").trim();
    } else {
      nMain++;
      label = String(nMain).padStart(2, "0");
      node = String(nMain);
      name = title;
    }
    steps.push({
      id: slugify(title, used),
      title,
      name,
      label,
      node,
      side,
      boss: title.toLowerCase().startsWith("boss"),
      nodes,
      images: (imgs.get(norm(title)) ?? []).map(toImg),
    });
  }
  const firstFile = sections.flatMap((s) => s.files)[0] ?? "";
  const art = meta.hero ? `images/ch${String(num).padStart(2, "0")}/${String(parseInt(meta.hero, 10)).padStart(2, "0")}.jpg` : firstFile;
  return {
    num,
    key: `ff7r-vi-ch${String(num).padStart(2, "0")}`,
    title: meta.title || path.basename(file, ".md"),
    area: meta.area || "",
    summary: meta.summary || "",
    source: meta.source || SOURCE_ORIGIN,
    art,
    lead,
    leadImages: (imgs.get("intro") ?? []).map(toImg),
    steps,
    loot,
    nMain,
    nSide,
    nChest: loot.filter((l) => l.kind === "chest").length,
    nImg: sections.reduce((a, s) => a + s.files.length, 0),
  };
}

let cache: Chapter[] | null = null;

export function getChapters(): Chapter[] {
  if (cache) return cache;
  const manifestPath = path.join(ROOT, "images", "manifest.json");
  const manifest: Manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
  const dir = path.join(ROOT, "chapters");
  cache = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseChapter(path.join(dir, f), manifest))
    .sort((a, b) => a.num - b.num);
  return cache;
}

export function getChapter(num: number): Chapter | undefined {
  return getChapters().find((c) => c.num === num);
}

export const HOME_HERO_CHAPTER = 4;
