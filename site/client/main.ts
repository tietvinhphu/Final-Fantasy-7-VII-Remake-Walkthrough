/**
 * Hành vi phía trình duyệt, viết bằng TypeScript thuần (không React): trang được dựng sẵn thành HTML tĩnh
 * ở bước build, file này chỉ gắn thêm tương tác qua các thuộc tính data-* trên HTML đó.
 * Khi tắt JavaScript, mọi bước vẫn hiện đầy đủ và đọc được.
 */

const THEME = "ff7r-vi-theme";
const MODE = "ff7r-vi-mode";
const PROGRESS = "ff7r-vi-progress:";
const LAST = "ff7r-vi-last:";
const RECENT = "ff7r-vi-recent";
const root = document.documentElement;

const get = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const put = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* không lưu được: bỏ qua */
  }
};
const qs = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector<T>(s);
const qsa = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => Array.from(c.querySelectorAll<T>(s));
const idsOf = (raw: string | null): string[] => {
  try {
    const v = JSON.parse(raw ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

/* ---------- menu <details>, giao diện sáng/tối ---------- */
function initChrome() {
  document.addEventListener("click", (e) => {
    const t = e.target as Element;
    qsa<HTMLDetailsElement>("details[data-menu]").forEach((m) => !m.contains(t) && m.removeAttribute("open"));
    if (t.closest("[data-theme-toggle]")) {
      const cur = root.getAttribute("data-theme") ?? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      const next = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      put(THEME, next);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    qsa<HTMLDetailsElement>("details[data-menu]").forEach((m) => {
      if (m.open) {
        m.removeAttribute("open");
        m.querySelector("summary")?.focus();
      }
    });
  });
}

/* ---------- trang chủ ---------- */
const knownIds = (row: Element) => new Set((row.getAttribute("data-ids") ?? "").split(" ").filter(Boolean));

/** Điền tiến độ từng chương và nút "Tiếp tục". Chỉ đếm id còn tồn tại (id lỗi thời bị bỏ qua, không làm lệch số). */
function renderHome() {
  let lastTarget: { href: string; text: string } | null = null;
  let recent: { key?: unknown; id?: unknown } = {};
  try {
    recent = JSON.parse(get(RECENT) ?? "{}") ?? {};
  } catch {
    recent = {};
  }
  qsa("[data-home-ch]").forEach((row) => {
    const key = row.getAttribute("data-home-ch") ?? "";
    const total = parseInt(row.getAttribute("data-total") ?? "0", 10);
    const known = knownIds(row);
    const ids = idsOf(get(PROGRESS + key)).filter((id) => known.has(id));
    const n = Math.min(total, ids.filter((id) => !id.startsWith("side-quest-")).length);
    const text = qs("[data-prog-text]", row);
    if (text) text.textContent = `${n}/${total}`;
    qs("[data-prog-bar]", row)?.style.setProperty("--p", String(total ? n / total : 0));
    if (recent.key === key && typeof recent.id === "string" && known.has(recent.id)) {
      lastTarget = { href: `${row.getAttribute("data-href")}#${recent.id}`, text: row.getAttribute("data-title") ?? "" };
    }
  });
  // Một nút chính mỗi màn hình: có tiến độ thì "Tiếp tục" là nút chính, chưa có thì "Bắt đầu".
  const cont = qs<HTMLAnchorElement>("[data-continue]");
  const start = qs<HTMLAnchorElement>("[data-start]");
  if (!cont || !start) return;
  const setPrimary = (on: boolean) => {
    if ((cont.dataset.swapped === "1") === on) return;
    const cls = start.className;
    start.className = cont.className;
    cont.className = cls;
    cont.dataset.swapped = on ? "1" : "";
    if (on) start.before(cont);
    else start.after(cont);
  };
  if (lastTarget) {
    const lt = lastTarget as { href: string; text: string };
    cont.href = lt.href;
    cont.hidden = false;
    const t = qs("[data-continue-text]", cont);
    if (t) t.textContent = lt.text;
    setPrimary(true);
  } else {
    cont.hidden = true;
    setPrimary(false);
  }
}

/** Sao lưu / khôi phục / xóa tiến độ. Định dạng có phiên bản để đổi cấu trúc sau này vẫn nhập được bản cũ. */
function initBackup() {
  const status = qs("[data-backup-status]");
  const say = (m: string) => {
    if (status) status.textContent = m;
  };
  const rows = () => qsa("[data-home-ch]");

  document.addEventListener("click", (e) => {
    const t = e.target as Element;
    if (t.closest("[data-export]")) {
      const progress: Record<string, string[]> = {};
      const last: Record<string, string> = {};
      let n = 0;
      rows().forEach((row) => {
        const key = row.getAttribute("data-home-ch") ?? "";
        const ids = idsOf(get(PROGRESS + key)).filter((id) => knownIds(row).has(id));
        if (ids.length) {
          progress[key] = ids;
          n += ids.length;
        }
        const l = get(LAST + key);
        if (l) last[key] = l;
      });
      const data = { app: "ff7r-vi", version: 1, exportedAt: new Date().toISOString(), progress, last };
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      a.download = `ff7r-vi-tien-do-${data.exportedAt.slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      say(`Đã xuất ${n} bước đã xong. Giữ tệp này để khôi phục ở máy khác.`);
    } else if (t.closest("[data-reset]")) {
      if (!confirm("Xóa toàn bộ tiến độ đã lưu trong trình duyệt này? Không thể hoàn tác. Nếu muốn giữ lại, hãy xuất tiến độ trước.")) return;
      rows().forEach((row) => {
        const key = row.getAttribute("data-home-ch") ?? "";
        try {
          localStorage.removeItem(PROGRESS + key);
          localStorage.removeItem(LAST + key);
        } catch {
          /* bỏ qua */
        }
      });
      try {
        localStorage.removeItem(RECENT);
      } catch {
        /* bỏ qua */
      }
      renderHome();
      say("Đã xóa tiến độ.");
    }
  });

  qs<HTMLInputElement>("[data-import]")?.addEventListener("change", async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > 1_000_000) return say("Tệp quá lớn, không phải bản sao lưu của site này.");
    let data: { app?: unknown; version?: unknown; progress?: unknown; last?: unknown };
    try {
      data = JSON.parse(await file.text());
    } catch {
      return say("Không đọc được tệp: đây không phải JSON hợp lệ.");
    }
    if (!data || data.app !== "ff7r-vi") return say("Tệp này không phải bản sao lưu tiến độ của site.");
    if (data.version !== 1) return say(`Phiên bản sao lưu ${String(data.version)} chưa được hỗ trợ.`);
    const known = new Map(rows().map((r) => [r.getAttribute("data-home-ch") ?? "", knownIds(r)]));
    let added = 0;
    let ignored = 0;
    const progress = data.progress && typeof data.progress === "object" ? (data.progress as Record<string, unknown>) : {};
    for (const [key, list] of Object.entries(progress)) {
      const kn = known.get(key);
      if (!Array.isArray(list)) continue;
      if (!kn) {
        ignored += list.length;
        continue;
      }
      const cur = new Set(idsOf(get(PROGRESS + key)));
      for (const id of list) {
        if (typeof id === "string" && kn.has(id)) {
          if (!cur.has(id)) {
            cur.add(id);
            added++;
          }
        } else ignored++;
      }
      put(PROGRESS + key, JSON.stringify([...cur]));
    }
    const last = data.last && typeof data.last === "object" ? (data.last as Record<string, unknown>) : {};
    for (const [key, id] of Object.entries(last)) {
      if (typeof id === "string" && known.get(key)?.has(id) && !get(LAST + key)) put(LAST + key, id);
    }
    renderHome();
    say(`Đã nhập ${added} bước mới (gộp với tiến độ hiện có). Bỏ qua ${ignored} mục không còn tồn tại.`);
  });
}

function initHome() {
  renderHome();
  initBackup();
}

/* ---------- trang chương ---------- */
function initChapter(stage: HTMLElement) {
  const chapterKey = stage.getAttribute("data-key") ?? "";
  const steps = qsa("article.step");
  const ids = steps.map((s) => s.id);
  const mainIds = steps.filter((s) => !s.hasAttribute("data-side")).map((s) => s.id);
  const sideIds = steps.filter((s) => s.hasAttribute("data-side")).map((s) => s.id);
  const done = new Set<string>(idsOf(get(PROGRESS + chapterKey)));
  let current = qs("article.step[data-current]")?.id ?? ids[0];

  const isList = () => root.getAttribute("data-mode") === "list";
  const byAttr = (attr: string, id: string) => qsa(`[${attr}="${id}"]`);

  const paintDone = () => {
    qsa<HTMLInputElement>("input[data-step-box]").forEach((b) => {
      b.checked = done.has(b.getAttribute("data-step-box") ?? "");
    });
    for (const id of ids) {
      const d = done.has(id);
      const article = document.getElementById(id);
      for (const el of [...byAttr("data-ol", id), ...byAttr("data-seg", id), ...(article ? [article] : [])]) el.toggleAttribute("data-done", d);
    }
    const nMain = mainIds.filter((i) => done.has(i)).length;
    const nSide = sideIds.filter((i) => done.has(i)).length;
    qsa("[data-count-main]").forEach((e) => (e.textContent = `${nMain}/${mainIds.length}`));
    qsa("[data-count-side]").forEach((e) => (e.textContent = `${nSide}/${sideIds.length}`));
    qsa("[data-progress-line]").forEach((e) => e.style.setProperty("--p", String(mainIds.length ? nMain / mainIds.length : 0)));
  };

  const paintCurrent = () => {
    steps.forEach((s) => s.toggleAttribute("data-current", s.id === current));
    qsa("[data-ol],[data-seg]").forEach((a) => {
      const id = a.getAttribute("data-ol") ?? a.getAttribute("data-seg");
      a.toggleAttribute("data-current", id === current);
    });
    const i = ids.indexOf(current);
    const label = document.getElementById(current)?.getAttribute("data-label") ?? "";
    qsa("[data-cur-label]").forEach((e) => (e.textContent = label));
    qsa("[data-nav]").forEach((b) => {
      const target = ids[i + (b.getAttribute("data-nav") === "next" ? 1 : -1)];
      b.setAttribute("data-target", target ?? "");
      if (target) b.removeAttribute("aria-disabled");
      else b.setAttribute("aria-disabled", "true");
    });
    // Giữ mục đang chọn trong vùng nhìn thấy của cột mục lục.
    const rail = qs("[data-rail]");
    const a = qs("[data-outline='rail'] [data-ol][data-current]");
    if (rail && a) {
      const b = rail.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      if (r.top < b.top || r.bottom > b.bottom) rail.scrollTop += r.top - b.top - (b.height - r.height) / 2;
    }
  };

  const stageTop = () => stage.scrollIntoView({ block: "start", behavior: "instant" });

  const go = (id: string, scroll: boolean) => {
    if (!ids.includes(id)) return;
    current = id;
    paintCurrent();
    put(LAST + chapterKey, id);
    put(RECENT, JSON.stringify({ key: chapterKey, id }));
    if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
    if (scroll) {
      if (isList()) document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
      else stageTop();
    }
  };

  /* khởi tạo */
  paintDone();
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (ids.includes(fromHash)) current = fromHash;
  paintCurrent();
  put(LAST + chapterKey, current);
  put(RECENT, JSON.stringify({ key: chapterKey, id: current }));
  if (ids.includes(fromHash) && !isList()) requestAnimationFrame(stageTop);

  const outline = qs<HTMLDialogElement>("#outline-dialog");
  const lb = qs<HTMLDialogElement>("#lightbox");

  /* lightbox */
  const img = lb ? qs<HTMLImageElement>("img", lb) : null;
  const cap = lb ? qs("figcaption", lb) : null;
  let list: HTMLAnchorElement[] = [];
  let idx = 0;
  const show = (i: number) => {
    if (!img || !cap || !list.length) return;
    idx = (i + list.length) % list.length;
    const a = list[idx];
    const label = `${a.dataset.cap ?? ""} · ${idx + 1}/${list.length}`;
    cap.textContent = "Đang tải…";
    img.onload = () => (cap.textContent = label);
    img.onerror = () => (cap.textContent = "Không tải được hình này.");
    img.alt = `${a.dataset.cap ?? "Hình minh họa"}, hình ${idx + 1} trên ${list.length}`;
    img.src = a.href;
  };

  /* một trình nghe click cho mọi điều khiển */
  document.addEventListener("click", (e) => {
    const t = e.target as Element;

    const pic = t.closest<HTMLAnchorElement>("a[data-lightbox]");
    if (pic && lb) {
      e.preventDefault();
      list = qsa<HTMLAnchorElement>("a[data-lightbox]").filter((x) => x.dataset.gallery === pic.dataset.gallery);
      show(list.indexOf(pic));
      lb.showModal();
      return;
    }
    const lbBtn = t.closest<HTMLElement>("[data-lb]");
    if (lbBtn && lb?.contains(lbBtn)) {
      const act = lbBtn.getAttribute("data-lb");
      if (act === "prev") show(idx - 1);
      else if (act === "next") show(idx + 1);
      else lb.close();
      return;
    }
    if (lb && e.target === lb) return lb.close();

    if (t.closest("[data-open-outline]")) return outline?.showModal();
    if (t.closest("[data-close-outline]")) return outline?.close();
    if (outline && e.target === outline) return outline.close();

    const modeBtn = t.closest<HTMLElement>("[data-mode-btn]");
    if (modeBtn) {
      const m = modeBtn.getAttribute("data-mode-btn") === "list" ? "list" : "focus";
      if (root.getAttribute("data-mode") !== m) {
        root.setAttribute("data-mode", m);
        put(MODE, m);
        qsa("[data-mode-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-mode-btn") === m)));
        if (m === "list") document.getElementById(current)?.scrollIntoView({ block: "start", behavior: "instant" });
        else stageTop();
      }
      return;
    }

    const el = t.closest<HTMLElement>("a[href^='#'],button[data-nav]");
    if (!el) return;
    const id = el.matches("button[data-nav]") ? (el.getAttribute("data-target") ?? "") : decodeURIComponent((el.getAttribute("href") ?? "").slice(1));
    if (!ids.includes(id) || el.getAttribute("aria-disabled") === "true") return;
    e.preventDefault();
    if (outline?.open) outline.close();
    go(id, true);
  });

  /* tick "Xong" */
  document.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (!t.matches?.("input[data-step-box]")) return;
    const id = t.getAttribute("data-step-box") ?? "";
    if (t.checked) done.add(id);
    else done.delete(id);
    put(PROGRESS + chapterKey, JSON.stringify([...done]));
    paintDone();
  });

  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (ids.includes(id)) go(id, true);
  });

  /* bàn phím: ← → đổi bước, X tick xong */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || lb?.open || outline?.open) return;
    const t = e.target as HTMLElement;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const i = ids.indexOf(current);
    if (e.key === "ArrowRight" && ids[i + 1]) {
      e.preventDefault();
      go(ids[i + 1], true);
    } else if (e.key === "ArrowLeft" && ids[i - 1]) {
      e.preventDefault();
      go(ids[i - 1], true);
    } else if (e.key === "x" || e.key === "X") {
      document.getElementById(current)?.querySelector<HTMLInputElement>("input[data-step-box]")?.click();
    }
  });
  if (lb) {
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let x0: number | null = null;
    lb.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* chế độ cả chương: bước hiện tại theo vị trí cuộn */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!isList()) return;
        const hit = entries.filter((en) => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit && hit.target.id !== current) {
          current = hit.target.id;
          paintCurrent();
          put(LAST + chapterKey, current);
          put(RECENT, JSON.stringify({ key: chapterKey, id: current }));
          history.replaceState(null, "", `#${current}`);
        }
      },
      { rootMargin: "-25% 0px -70% 0px" },
    );
    steps.forEach((s) => io.observe(s));
  }

  qsa("[data-mode-btn]").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-mode-btn") === (isList() ? "list" : "focus"))));
}

initChrome();
if (qs("[data-home-ch]")) initHome();
const stage = qs("#stage");
if (stage) initChapter(stage);
