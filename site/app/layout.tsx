import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HEAD_BOOT } from "@/lib/boot";

const DESC =
  "Hướng dẫn tiếng Việt không chính thức cho Final Fantasy VII Remake: lộ trình từng chương, rương, boss, nhiệm vụ phụ và mẹo Hard Mode, viết lại từ loạt hướng dẫn của PowerPyx.";

export const metadata: Metadata = {
  title: { default: "Final Fantasy VII Remake — Hướng dẫn tiếng Việt", template: "%s · FF7 Remake" },
  description: DESC,
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23ffb02e'/%3E%3Cpath d='M9 9h14v4H14v3h8v4h-8v3H9z' fill='%231a1200'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1011" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2ec" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_BOOT }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed left-4 top-[-4rem] z-[60] rounded-md bg-hazard-fill px-4 py-3 font-bold text-on-hazard no-underline focus:top-3"
        >
          Bỏ qua, tới nội dung
        </a>
        {children}
      </body>
    </html>
  );
}
