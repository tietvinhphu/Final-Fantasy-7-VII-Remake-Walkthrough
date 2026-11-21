import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, List, X } from "lucide-react";
import { getChapter, getChapters } from "@/lib/content";
import { STEP_BOOT } from "@/lib/boot";
import { cn, withBase } from "@/lib/utils";
import { TopBar } from "@/components/topbar";
import { CreditStrip, Footer } from "@/components/credit";
import { Outline } from "@/components/outline";
import { StepArticle } from "@/components/step";
import { Gallery } from "@/components/gallery";
import { Nodes } from "@/components/nodes";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/toggles";

export const dynamicParams = false;

export function generateStaticParams() {
  return getChapters().map((c) => ({ n: String(c.num) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const ch = getChapter(Number(n));
  if (!ch) return {};
  return { title: `Chương ${ch.num}: ${ch.title}`, description: ch.summary };
}

export default async function ChapterPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const ch = getChapter(Number(n));
  if (!ch) notFound();
  const chapters = getChapters();
  const idx = chapters.findIndex((c) => c.num === ch.num);
  const prevCh = chapters[idx - 1];
  const nextCh = chapters[idx + 1];
  const main = ch.steps.filter((s) => !s.side);
  const side = ch.steps.filter((s) => s.side);

  return (
    <>
      <TopBar chapters={chapters} current={ch.num} />
      <CreditStrip source={ch.source} />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden="true">
        <div data-progress-line="" className="h-full origin-left scale-x-(--p) bg-hazard-fill [--p:0]" />
      </div>

      <div className="mx-auto grid max-w-[76rem] gap-x-12 px-4 sm:px-6 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div data-rail="" className="sticky top-[4.25rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto pb-8 pt-10">
            <Outline steps={ch.steps} idPrefix="rail" />
          </div>
        </aside>

        <div id="main" tabIndex={-1} className="min-w-0 pb-32 outline-none lg:pb-24">
          <header className="grid gap-8 pb-10 pt-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:items-end">
            <div>
              <p className="label text-hazard">
                Chương {String(ch.num).padStart(2, "0")}
                {ch.area ? ` · ${ch.area}` : ""}
              </p>
              <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{ch.title}</h1>
              <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">{ch.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>{ch.nMain} bước</Badge>
                <Badge>{ch.nChest} rương</Badge>
                {ch.nSide > 0 && <Badge tone="quest">{ch.nSide} nhiệm vụ phụ</Badge>}
                <Badge>{ch.nImg} hình</Badge>
              </div>
            </div>
            {ch.art && (
              <img
                src={withBase(ch.art)}
                width={1024}
                height={576}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="hidden aspect-video w-full rounded-md border border-line object-cover xl:block"
              />
            )}
          </header>

          {(ch.lead.length > 0 || ch.leadImages.length > 0 || ch.loot.length > 0) && (
            <section aria-label="Tổng quan chương" className="border-t border-line pb-8 pt-8">
              <p className="label mb-3 text-subtle">Tổng quan</p>
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                <div className="min-w-0 text-[1.0625rem]">
                  <Nodes nodes={ch.lead} />
                  {ch.loot.length > 0 && (
                    <details className="my-6 rounded-md border border-line bg-panel">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 font-bold">
                        <span>Tổng hợp vật phẩm trong chương</span>
                        <span className="label text-hazard">{ch.loot.length}</span>
                      </summary>
                      <ul className="m-0 grid list-none gap-x-6 gap-y-1.5 border-t border-line p-4 text-[0.92rem] text-muted sm:grid-cols-2">
                        {ch.loot.map((l, i) => (
                          <li key={i} className="flex items-baseline gap-2">
                            <span className={cn("label w-14 shrink-0", l.kind === "pickup" ? "text-mako" : "text-hazard")}>
                              {l.kind === "chest" ? "Rương" : l.kind === "pickup" ? "Nhặt" : "Thưởng"}
                            </span>
                            <span className="min-w-0 break-words">{l.title}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
                <Gallery images={ch.leadImages} group="intro" caption="Mở đầu chương" className="content-start" />
              </div>
            </section>
          )}

          <section id="stage" data-key={ch.key} className="scroll-mt-20 border-t border-line pt-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <p className="label text-muted">
                Đã xong <span data-count-main="" className="text-mako">0/{main.length}</span> bước
                {side.length > 0 && (
                  <>
                    {" · "}
                    <span data-count-side="" className="text-quest">0/{side.length}</span> nhiệm vụ phụ
                  </>
                )}
              </p>
              <ModeToggle />
            </div>
            <nav aria-label="Các bước trong chương" className="mb-8 hidden flex-wrap gap-x-0.5 sm:flex">
              {main.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  data-seg={s.id}
                  title={`${s.label}. ${s.name}`}
                  aria-label={`Bước ${s.label}: ${s.name}`}
                  className="group min-w-3 flex-1 basis-3 py-2.5"
                >
                  <span className="block h-1.5 rounded-[1px] bg-line transition-colors group-hover:bg-subtle group-data-[done]:bg-mako group-data-[current]:bg-hazard-fill" />
                </a>
              ))}
              {side.length > 0 && <span className="mx-1.5 w-px self-stretch bg-line" aria-hidden="true" />}
              {side.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  data-seg={s.id}
                  title={`${s.label}. ${s.name}`}
                  aria-label={`Nhiệm vụ phụ ${s.label}: ${s.name}`}
                  className="group min-w-3 flex-1 basis-3 py-2.5"
                >
                  <span className="block h-1.5 rounded-[1px] bg-quest/35 transition-colors group-hover:bg-quest/70 group-data-[done]:bg-quest group-data-[current]:bg-hazard-fill" />
                </a>
              ))}
            </nav>

            <div>
              {ch.steps.map((s, i) => (
                <StepArticle key={s.id} step={s} total={main.length} prev={ch.steps[i - 1]} next={ch.steps[i + 1]} />
              ))}
            </div>
            <script dangerouslySetInnerHTML={{ __html: STEP_BOOT }} />
          </section>

          <nav aria-label="Chuyển chương" className="mt-14 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
            {prevCh ? (
              <a href={withBase(`/chuong/${prevCh.num}/`)} className="group block rounded-md border border-line bg-panel p-4 no-underline hover:border-hazard">
                <span className="label text-subtle">← Chương trước</span>
                <span className="mt-1 block font-bold text-fg">{prevCh.title}</span>
              </a>
            ) : (
              <span />
            )}
            {nextCh && (
              <a href={withBase(`/chuong/${nextCh.num}/`)} className="group block rounded-md border border-line bg-panel p-4 text-right no-underline hover:border-hazard">
                <span className="label text-subtle">Chương sau →</span>
                <span className="mt-1 block font-bold text-fg">{nextCh.title}</span>
              </a>
            )}
          </nav>
        </div>
      </div>

      <Footer />

      {/* Thanh điều hướng dưới cùng (điện thoại, chế độ từng bước) */}
      <div className="bottombar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-[3rem_minmax(0,1fr)_3rem] gap-2 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <Button variant="outline" size="icon" data-nav="prev" aria-label="Bước trước">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <button
            type="button"
            data-open-outline=""
            className={cn(buttonVariants({ variant: "outline" }), "min-w-0 justify-between")}
            aria-haspopup="dialog"
          >
            <span className="label truncate" data-cur-label="">
              Mục lục
            </span>
            <List aria-hidden="true" />
          </button>
          <Button size="icon" data-nav="next" aria-label="Bước tiếp">
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <dialog id="outline-dialog" aria-label="Mục lục chương" className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg">
        <div className="mx-auto flex h-dvh max-w-xl flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="label text-hazard">Mục lục · Chương {String(ch.num).padStart(2, "0")}</p>
            <Button variant="ghost" size="icon" data-close-outline="" aria-label="Đóng mục lục">
              <X aria-hidden="true" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <Outline steps={ch.steps} idPrefix="dlg" />
          </div>
        </div>
      </dialog>

      <dialog id="lightbox" aria-label="Xem hình lớn" className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-fg">
        <div className="grid h-dvh place-items-center p-4">
          <figure className="m-0 grid max-w-[min(96vw,1400px)] justify-items-center gap-3">
            <img alt="" className="max-h-[80dvh] w-auto max-w-full rounded-md border border-line" />
            <figcaption className="label text-center text-muted empty:hidden" />
          </figure>
        </div>
        <Button variant="outline" size="icon" data-lb="prev" aria-label="Hình trước" className="absolute left-3 top-1/2 -translate-y-1/2">
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" data-lb="next" aria-label="Hình sau" className="absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" data-lb="close" aria-label="Đóng" className="absolute right-3 top-3">
          <X aria-hidden="true" />
        </Button>
      </dialog>

    </>
  );
}
