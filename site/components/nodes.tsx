import { Archive, CircleDot, Flag, Flame, Lightbulb, Skull, Star, TriangleAlert, type LucideIcon } from "lucide-react";
import type { BlockKind, ListItem, Node } from "@/lib/content";
import { Inline } from "@/lib/inline";
import { cn } from "@/lib/utils";

type Tone = { label: string; Icon: LucideIcon; box: string; ink: string };

const TONES: Record<BlockKind, Tone> = {
  chest: { label: "Rương", Icon: Archive, box: "border-l-hazard", ink: "text-hazard" },
  pickup: { label: "Nhặt", Icon: CircleDot, box: "border-l-mako", ink: "text-mako" },
  boss: { label: "Boss", Icon: Skull, box: "border-l-boss bg-boss-bg", ink: "text-boss" },
  tip: { label: "Mẹo", Icon: Lightbulb, box: "border-l-muted", ink: "text-muted" },
  warn: { label: "Lưu ý", Icon: TriangleAlert, box: "border-l-boss", ink: "text-boss" },
  hard: { label: "Hard Mode", Icon: Flame, box: "border-l-hazard bg-hazard-bg", ink: "text-hazard" },
  quest: { label: "Nhiệm vụ phụ", Icon: Flag, box: "border-l-quest bg-quest-bg", ink: "text-quest" },
  reward: { label: "Thưởng", Icon: Star, box: "border-l-hazard", ink: "text-hazard" },
};

const KEYED = /^([A-Za-zÀ-ỹ ]{2,24}): (.+)$/u;

function ulClass() {
  return "my-4 grid list-none gap-2 p-0";
}

/** Danh sách có thứ tự: số mono, gạch nối thẳng hàng. */
function Ol({ items }: { items: ListItem[] }) {
  return (
    <ol className="my-4 grid list-none gap-3 p-0 [counter-reset:n]">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 [counter-increment:n]">
          <span className="label mt-[0.45rem] text-subtle before:content-[counter(n,decimal-leading-zero)]" aria-hidden="true" />
          <div>
            <Inline text={it.text} />
            {it.subs.length > 0 && (
              <ul className="mt-2 grid list-none gap-1.5 border-l border-line p-0 pl-4 text-[0.97rem] text-muted">
                {it.subs.map((s, j) => (
                  <li key={j}>
                    <Inline text={s} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Ul({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn(ulClass(), className)}>
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2">
          <span className="mt-[0.7rem] block size-1.5 bg-subtle" aria-hidden="true" />
          <span>
            <Inline text={it} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function QuestFacts({ title, node }: { title: string; node?: Node }) {
  const [giver, ...loc] = title.split(" · ");
  const rows: { k: string; v: string }[] = [];
  if (giver) rows.push({ k: "Người giao", v: giver });
  if (loc.length) rows.push({ k: "Địa điểm", v: loc.join(" · ") });
  const rest: string[] = [];
  if (node && node.t === "ul") {
    for (const it of node.items) {
      const m = it.match(KEYED);
      if (m) rows.push({ k: m[1], v: m[2] });
      else rest.push(it);
    }
  }
  return (
    <>
      <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[0.95rem] sm:grid-cols-[8.5rem_minmax(0,1fr)]">
        {rows.map((r, i) => (
          <div key={i} className="contents">
            <dt className="label pt-[0.35rem] text-subtle">{r.k}</dt>
            <dd className="m-0">
              <Inline text={r.v} />
            </dd>
          </div>
        ))}
      </dl>
      {rest.length > 0 && <Ul items={rest} />}
    </>
  );
}

export function Block({ kind, title, weak, children }: { kind: BlockKind; title: string; weak: string[]; children: Node[] }) {
  const tone = TONES[kind];
  const { Icon } = tone;
  const isQuest = kind === "quest";
  return (
    <aside className={cn("my-5 overflow-hidden rounded-r-md border border-l-[3px] border-line bg-panel", tone.box)} data-kind={kind}>
      {kind === "hard" && <div className="hazard-stripe" aria-hidden="true" />}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 pt-3">
        <Icon className={cn("size-4 shrink-0", tone.ink)} aria-hidden="true" />
        <span className={cn("label", tone.ink)}>{tone.label}</span>
        {title && !isQuest && <strong className="text-base font-bold text-fg">{title}</strong>}
      </div>
      <div className="px-4 pb-3 pt-1.5 text-[0.98rem] [&>*:first-child]:mt-1 [&>*:last-child]:mb-0 [&_p]:my-2">
        {weak.length > 0 && (
          <p className="my-2 flex flex-wrap items-center gap-1.5">
            <span className="label mr-1 text-subtle">Yếu</span>
            {weak.map((w) => (
              <span key={w} className="label rounded-sm border border-boss/50 bg-bg px-2 py-1 text-boss">
                {w}
              </span>
            ))}
          </p>
        )}
        {isQuest ? <QuestFacts title={title} node={children[0]} /> : null}
        <Nodes nodes={isQuest ? children.slice(1) : children} />
      </div>
    </aside>
  );
}

export function Nodes({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case "p":
            return (
              <p key={i} className="my-4 max-w-[68ch]">
                <Inline text={n.text} />
              </p>
            );
          case "ul":
            return <Ul key={i} items={n.items} />;
          case "ol":
            return <Ol key={i} items={n.items} />;
          case "quote":
            return (
              <blockquote key={i} className="my-4 border-l-2 border-line pl-4 text-muted">
                {n.lines.map((l, j) => (
                  <p key={j} className="my-1">
                    <Inline text={l} />
                  </p>
                ))}
              </blockquote>
            );
          case "block":
            return (
              <Block key={i} kind={n.kind} title={n.title} weak={n.weak}>
                {n.children}
              </Block>
            );
        }
      })}
    </>
  );
}
