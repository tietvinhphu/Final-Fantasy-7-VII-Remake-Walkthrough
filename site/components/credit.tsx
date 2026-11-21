import { SOURCE_ORIGIN } from "@/lib/content";

/** Ghi nguồn rõ ràng trên mọi trang (bản dịch không chính thức, nội dung và ảnh thuộc PowerPyx). */
export function CreditStrip({ source }: { source: string }) {
  return (
    <aside role="note" className="border-b border-line bg-panel">
      <p className="mx-auto max-w-[76rem] px-4 py-2.5 text-[0.8125rem] leading-relaxed text-muted sm:px-6">
        <span className="label mr-2 text-hazard">Nguồn</span>
        Bản dịch tiếng Việt <strong className="text-fg">không chính thức</strong>, viết lại từ hướng dẫn của{" "}
        <strong className="text-fg">PowerPyx</strong> (tác giả Gage). Nội dung gốc và hình ảnh thuộc bản quyền PowerPyx. Bài gốc:{" "}
        <a href={source} rel="noopener noreferrer" className="break-all text-link underline underline-offset-[3px] hover:text-fg">
          {source.replace("https://", "")}
        </a>
      </p>
    </aside>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <p className="mx-auto max-w-[76rem] px-4 py-8 text-[0.8125rem] leading-relaxed text-muted sm:px-6">
        Nguồn:{" "}
        <a href={SOURCE_ORIGIN} rel="noopener noreferrer" className="text-link underline underline-offset-[3px] hover:text-fg">
          PowerPyx.com
        </a>
        . Bản dịch cá nhân, chỉ để tra cứu khi chơi. Nếu chủ sở hữu yêu cầu gỡ, trang sẽ được gỡ.
      </p>
    </footer>
  );
}
