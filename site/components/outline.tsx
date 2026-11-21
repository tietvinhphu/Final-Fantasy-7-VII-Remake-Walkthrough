import { Check } from "lucide-react";
import type { Step } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Mục lục chương. Dùng cho cột trái (máy tính) và hộp thoại (điện thoại). */
export function Outline({ steps, idPrefix }: { steps: Step[]; idPrefix: string }) {
  const main = steps.filter((s) => !s.side);
  const side = steps.filter((s) => s.side);
  const item = (s: Step) => (
    <li key={s.id}>
      <a
        href={`#${s.id}`}
        data-ol={s.id}
        data-go-id={s.id}
        className={cn(
          "group grid min-h-11 grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-x-1 border-l-2 border-line py-1.5 pl-3 pr-1 text-[0.9rem] leading-snug text-muted no-underline transition-colors hover:text-fg",
          "data-[current]:border-hazard data-[current]:bg-panel data-[current]:text-fg",
        )}
      >
        <span className={cn("label", s.side ? "text-quest" : "text-subtle", "group-data-[current]:text-hazard")}>{s.label}</span>
        <span>{s.name}</span>
        <Check className="size-4 text-mako opacity-0 group-data-[done]:opacity-100" aria-hidden="true" />
      </a>
    </li>
  );
  return (
    <nav aria-label="Mục lục chương" data-outline={idPrefix}>
      <ol className="m-0 list-none p-0">{main.map(item)}</ol>
      {side.length > 0 && (
        <>
          <p className="label mb-1 mt-6 flex items-center gap-2 text-quest">
            <span className="h-px w-4 bg-quest" aria-hidden="true" />
            Nhiệm vụ phụ
          </p>
          <ol className="m-0 list-none p-0">{side.map(item)}</ol>
        </>
      )}
    </nav>
  );
}
