import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hai điều khiển dạng thuần HTML (không phải React client component): hành vi được gắn bởi client/main.ts
 * qua thuộc tính data-*. Biểu tượng và trạng thái "đang chọn" do CSS quyết định từ html[data-theme] / html[data-mode].
 */

export function ThemeToggle() {
  return (
    <button
      type="button"
      data-theme-toggle=""
      aria-label="Đổi giao diện sáng hoặc tối"
      className="grid size-11 place-items-center rounded-md border border-transparent text-fg hover:bg-panel-2"
    >
      <Sun className="theme-sun size-4" aria-hidden="true" />
      <Moon className="theme-moon size-4" aria-hidden="true" />
    </button>
  );
}

/** Chuyển giữa "từng bước" (một bước mỗi lần) và "cả chương" (cuộn liền). */
export function ModeToggle() {
  const seg = (m: "focus" | "list", text: string) => (
    <button type="button" data-mode-btn={m} className={cn("mode-btn label min-h-11 px-3 text-muted transition-colors hover:text-fg sm:min-h-9")}>
      {text}
    </button>
  );
  return (
    <div role="group" aria-label="Chế độ đọc" className="flex overflow-hidden rounded-md border border-line bg-panel">
      {seg("focus", "Từng bước")}
      {seg("list", "Cả chương")}
    </div>
  );
}
