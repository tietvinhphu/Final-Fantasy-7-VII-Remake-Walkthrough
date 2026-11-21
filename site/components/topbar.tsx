import { ChevronDown } from "lucide-react";
import type { Chapter } from "@/lib/content";
import { cn, withBase } from "@/lib/utils";
import { ThemeToggle } from "@/components/toggles";

export function TopBar({ chapters, current }: { chapters: Chapter[]; current?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/92 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[76rem] items-center gap-3 px-4 sm:px-6">
        <a href={withBase("/")} className="flex min-h-11 items-center gap-2.5 text-fg no-underline">
          <span className="label rounded-sm bg-hazard-fill px-1.5 py-1 text-on-hazard">FF7R</span>
          <span className="hidden text-[0.95rem] font-bold sm:inline">Hướng dẫn tiếng Việt</span>
        </a>
        <div className="ml-auto flex items-center gap-1.5">
          <details data-menu="" className="relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-md border border-line bg-panel px-3 text-sm font-bold hover:border-hazard">
              Chương
              <ChevronDown className="size-4" aria-hidden="true" />
            </summary>
            <ol className="absolute right-0 top-[calc(100%+0.5rem)] m-0 max-h-[70dvh] w-[min(22rem,calc(100vw-2rem))] list-none overflow-y-auto rounded-md border border-line bg-panel p-1.5 shadow-lg">
              {chapters.map((c) => (
                <li key={c.num}>
                  <a
                    href={withBase(`/chuong/${c.num}/`)}
                    aria-current={c.num === current ? "page" : undefined}
                    className={cn(
                      "grid min-h-11 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-1 rounded-sm px-2 py-1.5 text-[0.92rem] text-fg no-underline hover:bg-panel-2",
                      c.num === current && "bg-panel-2 font-bold",
                    )}
                  >
                    <span className="label text-hazard">{String(c.num).padStart(2, "0")}</span>
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
