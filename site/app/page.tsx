import { ArrowRight, Keyboard, ListChecks, MousePointerClick } from "lucide-react";
import { HOME_HERO_CHAPTER, SOURCE_ORIGIN, getChapters } from "@/lib/content";
import { cn, withBase } from "@/lib/utils";
import { TopBar } from "@/components/topbar";
import { CreditStrip, Footer } from "@/components/credit";
import { buttonVariants } from "@/components/ui/button";

const UPCOMING = [
  ["Sưu tầm và trang bị", "Materia, Armor, Accessory, Summon, Music Disc..."],
  ["Boss và hệ thống chiến đấu", "Tất cả boss, Stagger, Hard Mode, Fort Condor"],
  ["DLC Yuffie (INTERmission)", "2 chương, sưu tầm, boss Weiss"],
];

export default function Home() {
  const chapters = getChapters();
  const art = (chapters.find((c) => c.num === HOME_HERO_CHAPTER) ?? chapters[0]).art;
  const stats = [
    [chapters.length, "chương"],
    [chapters.reduce((a, c) => a + c.nMain, 0), "bước"],
    [chapters.reduce((a, c) => a + c.nSide, 0), "nhiệm vụ phụ"],
    [chapters.reduce((a, c) => a + c.nImg, 0), "hình"],
  ] as const;

  return (
    <>
      <TopBar chapters={chapters} />
      <CreditStrip source={SOURCE_ORIGIN} />
      <main id="main" tabIndex={-1} className="outline-none">
        <section className="relative overflow-hidden border-b border-line">
          <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[76rem] gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className="label text-hazard">Hướng dẫn tiếng Việt · không chính thức</p>
              <h1 className="mt-4 text-balance text-[2.75rem] font-bold leading-[1.02] tracking-tight sm:text-7xl">
                Final Fantasy VII <span className="whitespace-nowrap">Remake</span>
              </h1>
              <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted">
                Lộ trình từng chương, rương, boss, nhiệm vụ phụ và mẹo, chia thành từng bước để vừa chơi vừa tra. Tiến độ lưu ngay trong trình
                duyệt của bạn.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={withBase(`/chuong/${chapters[0].num}/`)} data-start="" className={buttonVariants({ size: "default" })}>
                  Bắt đầu từ Chương 1
                  <ArrowRight aria-hidden="true" />
                </a>
                <a href="#" hidden data-continue="" className={buttonVariants({ variant: "outline" })}>
                  Tiếp tục: <span data-continue-text="" className="font-normal" />
                </a>
              </div>
            </div>
            {art && (
              <img
                src={withBase(art)}
                width={1024}
                height={576}
                alt="Cloud và Barret trên mô tô giữa đường hầm trong Chương 4"
                fetchPriority="high"
                decoding="async"
                className="aspect-video w-full rounded-md border border-line object-cover"
              />
            )}
          </div>
          <dl className="relative mx-auto grid max-w-[76rem] grid-cols-2 border-t border-line sm:grid-cols-4">
            {stats.map(([n, label], i) => (
              <div key={label} className={cn("px-4 py-5 sm:px-6", i > 0 && "sm:border-l sm:border-line", i % 2 === 1 && "border-l border-line sm:border-l")}>
                <dt className="label order-2 text-subtle">{label}</dt>
                <dd className="m-0 text-4xl font-bold tabular-nums tracking-tight">{n}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-[76rem] px-4 py-14 sm:px-6">
          <h2 className="label text-subtle">Cách dùng</h2>
          <ol className="m-0 mt-5 grid list-none gap-6 p-0 sm:grid-cols-3">
            {[
              [MousePointerClick, "Chọn chương", "Mỗi chương gồm các bước theo đúng thứ tự mục tiêu trong game. Chế độ \"Từng bước\" chỉ hiện một bước mỗi lần."],
              [Keyboard, "Đi từng bước", "Dùng phím ← → hoặc nút bên dưới. Điện thoại có thanh chuyển bước ngay tầm ngón cái. Bật \"Cả chương\" nếu muốn cuộn liền."],
              [ListChecks, "Tick xong", "Bấm Xong ở mỗi bước (hoặc phím X). Nhiệm vụ phụ đếm riêng, không ảnh hưởng tiến độ cốt truyện."],
            ].map(([Icon, title, text], i) => {
              const I = Icon as typeof ArrowRight;
              return (
                <li key={i} className="border-t-2 border-fg pt-4">
                  <p className="label flex items-center gap-2 text-hazard">
                    <I className="size-4" aria-hidden="true" />
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-bold">{title as string}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{text as string}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mx-auto max-w-[76rem] px-4 pb-16 sm:px-6" aria-labelledby="ds-chuong">
          <h2 id="ds-chuong" className="label border-b border-line pb-3 text-subtle">
            Cốt truyện
          </h2>
          <ol className="m-0 list-none p-0">
            {chapters.map((c) => (
              <li
                key={c.num}
                data-home-ch={c.key}
                data-total={c.nMain}
                data-ids={c.steps.map((x) => x.id).join(" ")}
                data-href={withBase(`/chuong/${c.num}/`)}
                data-title={`Chương ${c.num}: ${c.title}`}
                className="border-b border-line"
              >
                <a
                  href={withBase(`/chuong/${c.num}/`)}
                  className="group grid min-h-[4.5rem] grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 py-3 text-fg no-underline transition-colors hover:bg-panel sm:px-3"
                >
                  <span className="label text-hazard">{String(c.num).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <strong className="block text-lg font-bold leading-snug group-hover:text-hazard">{c.title}</strong>
                    <span className="mt-0.5 block text-[0.85rem] text-muted">
                      {c.area}
                      {c.area ? " · " : ""}
                      {c.nMain} bước
                      {c.nSide ? ` · ${c.nSide} nhiệm vụ phụ` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="hidden h-1.5 w-20 overflow-hidden rounded-[1px] bg-line sm:block" aria-hidden="true">
                      <span data-prog-bar="" className="block h-full origin-left scale-x-(--p) bg-mako [--p:0]" />
                    </span>
                    <span data-prog-text="" className="label w-12 text-right text-muted">
                      0/{c.nMain}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <h2 className="label mt-12 border-b border-line pb-3 text-subtle">Sắp có</h2>
          <ul className="m-0 list-none p-0">
            {UPCOMING.map(([t, d]) => (
              <li key={t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-dashed border-line py-3 text-muted sm:px-3">
                <span>
                  <strong className="block text-fg">{t}</strong>
                  <span className="text-[0.85rem]">{d}</span>
                </span>
                <span className="label rounded-sm border border-line px-2 py-1 text-subtle">Đang chuẩn bị</span>
              </li>
            ))}
          </ul>

          <details id="sao-luu" className="mt-12 rounded-md border border-line bg-panel">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 font-bold">
              Sao lưu tiến độ
              <span className="label text-subtle">Xuất · Nhập · Xóa</span>
            </summary>
            <div className="grid gap-4 border-t border-line p-4">
              <p className="max-w-[62ch] text-[0.95rem] leading-relaxed text-muted">
                Tiến độ chỉ nằm trong trình duyệt này và không được gửi đi đâu. Xóa dữ liệu trình duyệt hoặc đổi máy là mất. Hãy xuất ra tệp để giữ, rồi nhập lại ở máy khác (tiến độ
                được gộp với những gì máy đó đã có).
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" data-export="" className={buttonVariants({ variant: "outline" })}>
                  Xuất tiến độ
                </button>
                <label className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hazard")}>
                  Nhập tiến độ
                  <input type="file" accept="application/json,.json" data-import="" className="sr-only" />
                </label>
                <button type="button" data-reset="" className={cn(buttonVariants({ variant: "ghost" }), "text-boss hover:bg-boss-bg")}>
                  Xóa tiến độ
                </button>
              </div>
              <p role="status" aria-live="polite" data-backup-status="" className="min-h-6 text-[0.95rem] text-mako" />
            </div>
          </details>
        </section>
      </main>
      <Footer />
    </>
  );
}
