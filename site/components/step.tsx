import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Step } from "@/lib/content";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Gallery } from "@/components/gallery";
import { Nodes } from "@/components/nodes";

export function StepArticle({ step, total, prev, next }: { step: Step; total: number; prev?: Step; next?: Step }) {
  const eyebrow = step.side ? `Nhiệm vụ phụ ${step.label}` : `Bước ${step.label} / ${String(total).padStart(2, "0")}`;
  return (
    <article
      id={step.id}
      className="step scroll-mt-24 py-8 first:pt-0"
      data-step={step.id}
      data-label={eyebrow}
      data-side={step.side ? "" : undefined}
    >
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <p className={cn("label", step.side ? "text-quest" : step.boss ? "text-boss" : "text-subtle")}>
            {eyebrow}
            {step.boss ? " · Boss" : ""}
          </p>
          <h2 className="mt-1.5 text-balance text-2xl font-bold leading-tight tracking-tight sm:text-[2rem]">{step.name}</h2>
        </div>
        <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-md border border-line bg-panel px-3 text-sm font-bold text-muted hover:border-mako has-[:checked]:border-mako has-[:checked]:text-mako">
          <input type="checkbox" className="tick" data-step-box={step.id} data-side={step.side ? "" : undefined} />
          Xong
        </label>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Nodes nodes={step.nodes} />
        </div>
        <Gallery images={step.images} group={step.id} caption={step.name} className="content-start" />
      </div>

      <nav className="step-nav mt-10 flex items-center justify-between gap-3 border-t border-line pt-5" aria-label="Chuyển bước">
        <a
          href={prev ? `#${prev.id}` : undefined}
          data-go="prev"
          aria-disabled={prev ? undefined : "true"}
          className={cn(buttonVariants({ variant: "outline" }), "min-w-0")}
        >
          <ChevronLeft aria-hidden="true" />
          <span className="truncate">{prev ? "Bước trước" : "Đầu chương"}</span>
        </a>
        <a
          href={next ? `#${next.id}` : undefined}
          data-go="next"
          aria-disabled={next ? undefined : "true"}
          className={cn(buttonVariants({ variant: "default" }), "min-w-0")}
        >
          <span className="truncate">{next ? "Bước tiếp" : "Cuối chương"}</span>
          <ChevronRight aria-hidden="true" />
        </a>
      </nav>
    </article>
  );
}
