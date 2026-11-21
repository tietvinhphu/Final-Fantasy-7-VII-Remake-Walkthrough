import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp class Tailwind (chuẩn shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE = process.env.NEXT_PUBLIC_BASE ?? "";

/** Thêm basePath cho đường dẫn tuyệt đối trong site (ảnh, trang). */
export function withBase(p: string) {
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${BASE}${path}`;
}
