import type { Metadata } from "next";
import { getChapters } from "@/lib/content";
import { TopBar } from "@/components/topbar";
import { Footer } from "@/components/credit";

export const metadata: Metadata = {
  title: "Quyền riêng tư và bản quyền",
  description: "Site không thu thập dữ liệu cá nhân. Tiến độ đọc chỉ lưu trong trình duyệt của bạn. Nguồn và bản quyền nội dung.",
};

const REPO = "https://github.com/tietvinhphu/Final-Fantasy-7-VII-Remake-Walkthrough";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-8">
      <h2 id={id} className="label mb-4 text-hazard">
        {title}
      </h2>
      <div className="grid max-w-[68ch] gap-3 text-[1.0625rem]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const chapters = getChapters();
  return (
    <>
      <TopBar chapters={chapters} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[76rem] px-4 pb-16 pt-12 outline-none sm:px-6">
        <p className="label text-hazard">Cập nhật lần cuối: 21/11/2026</p>
        <h1 className="mt-3 max-w-[20ch] text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Quyền riêng tư và bản quyền</h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">
          Ngắn gọn: site này không thu thập thông tin gì về bạn. Nó là bản dịch hướng dẫn game không chính thức, và nội dung gốc thuộc về PowerPyx.
        </p>

        <div className="mt-10">
          <Section id="du-lieu" title="Dữ liệu cá nhân">
            <p>
              Không có tài khoản, biểu mẫu, cookie, công cụ phân tích hay quảng cáo. Không có script, font hay ảnh tải từ bên thứ ba: mọi thứ phục vụ từ chính
              site này.
            </p>
            <p>
              Site không có máy chủ riêng để lưu dữ liệu. Trang được phát hành qua GitHub Pages; như mọi dịch vụ web, nhà cung cấp hạ tầng có thể xử lý địa chỉ IP khi
              bạn truy cập, theo chính sách của họ.
            </p>
          </Section>

          <Section id="luu-tren-may" title="Những gì lưu trên máy bạn">
            <p>Trình duyệt của bạn (localStorage) lưu bốn thứ, chỉ để site dùng thuận tiện hơn và không bao giờ được gửi đi đâu:</p>
            <ul className="m-0 grid list-disc gap-1.5 pl-5 marker:text-subtle">
              <li>giao diện sáng hoặc tối bạn chọn;</li>
              <li>chế độ đọc (từng bước hay cả chương);</li>
              <li>các bước bạn đã tick &quot;Xong&quot;;</li>
              <li>bước bạn đọc gần nhất ở mỗi chương.</li>
            </ul>
            <p>
              Xóa dữ liệu trình duyệt hoặc đổi máy là mất tiến độ. Ở trang chủ có mục <strong className="text-fg">Sao lưu tiến độ</strong> để xuất ra tệp và nhập lại, hoặc xóa
              toàn bộ.
            </p>
          </Section>

          <Section id="ban-quyen" title="Nguồn và bản quyền">
            <p>
              Đây là bản dịch tiếng Việt <strong className="text-fg">không chính thức</strong>, viết lại từ loạt hướng dẫn Final Fantasy VII Remake của{" "}
              <strong className="text-fg">PowerPyx</strong> (tác giả Gage). Nội dung gốc và hình ảnh thuộc bản quyền PowerPyx; mỗi trang đều có liên kết về bài gốc.
              Final Fantasy VII Remake và mọi nhãn hiệu liên quan thuộc về chủ sở hữu của chúng.
            </p>
            <p>
              Trang chỉ để tra cứu khi chơi, phi thương mại. Nếu chủ sở hữu muốn gỡ nội dung, hãy tạo một mục trong{" "}
              <a href={`${REPO}/issues`} rel="noopener noreferrer" className="text-link underline underline-offset-[3px] hover:text-fg">
                Issues của kho mã nguồn
              </a>
              , nội dung sẽ được gỡ.
            </p>
          </Section>

          <Section id="ai" title="Nội dung có sự hỗ trợ của AI">
            <p>
              Phần lời hướng dẫn được viết lại bằng tiếng Việt với sự hỗ trợ của AI, không dịch từng chữ. Có thể còn sai sót hoặc lỗi thời so với bài gốc và so với
              bản cập nhật của game. Khi một chi tiết quan trọng (đặc biệt các lựa chọn phân nhánh ở Chương 9), hãy đối chiếu với bài gốc được liên kết ở đầu mỗi chương.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
