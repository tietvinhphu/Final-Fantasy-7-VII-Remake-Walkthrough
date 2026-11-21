import type { ReactNode } from "react";

/**
 * Chuyển chữ có định dạng nhẹ thành phần tử React (chạy phía server, không tốn JS):
 * `code`, **đậm**, {nút bấm}, [chữ](url), <url>.
 */
const TOKEN = /`([^`]+)`|\*\*(.+?)\*\*|\{([^{}]{1,16})\}|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>/g;

export function Inline({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const key = `${keyPrefix}${k++}`;
    if (m[1] !== undefined) {
      out.push(
        <code key={key} className="rounded-sm bg-panel-2 px-1.5 py-0.5 font-mono text-[0.85em]">
          {m[1]}
        </code>,
      );
    } else if (m[2] !== undefined) {
      out.push(
        <strong key={key} className="font-bold text-fg">
          {renderInline(m[2], key)}
        </strong>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <kbd
          key={key}
          className="mx-0.5 inline-block whitespace-nowrap rounded-[3px] border border-line border-b-2 bg-panel-2 px-1.5 py-px font-mono text-[0.8em] font-medium leading-snug text-fg"
        >
          {m[3]}
        </kbd>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <a key={key} href={m[5]} rel="noopener noreferrer" className="text-link underline decoration-1 underline-offset-[3px] hover:text-fg">
          {m[4]}
        </a>,
      );
    } else if (m[6] !== undefined) {
      out.push(
        <a key={key} href={m[6]} rel="noopener noreferrer" className="break-all text-link underline underline-offset-[3px] hover:text-fg">
          {m[6]}
        </a>,
      );
    }
    last = idx + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
