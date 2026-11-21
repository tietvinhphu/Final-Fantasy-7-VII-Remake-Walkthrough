# Final Fantasy VII Remake — Hướng dẫn tiếng Việt

Hướng dẫn tiếng Việt **không chính thức**, dùng để tra cứu khi chơi, viết lại từ loạt hướng dẫn Final Fantasy VII Remake của **PowerPyx** (tác giả Gage): <https://www.powerpyx.com/guide/final-fantasy-vii-remake/>.

**Nguồn và bản quyền:** nội dung gốc và hình ảnh thuộc bản quyền PowerPyx. Mỗi trang có liên kết về bài gốc. Nếu chủ sở hữu yêu cầu gỡ, nội dung sẽ được gỡ.

**Trang web:** https://tietvinhphu.github.io/Final-Fantasy-7-VII-Remake-Walkthrough/

## Tiến độ

| Phần | Trạng thái |
| --- | --- |
| Cốt truyện, Chương 1–18 (rương, vật phẩm, boss, mẹo Hard Mode, hình minh họa) | Xong |
| Nhiệm vụ phụ (26 nhiệm vụ, gộp vào Chương 3, 8, 9 và 14, kèm các lựa chọn phân nhánh của Chương 9) | Xong |
| Sưu tầm và trang bị (Materia, Armor, Accessory, Summon, Music Disc...) | Chưa làm |
| Boss và hệ thống chiến đấu (Stagger, Hard Mode, Fort Condor, danh sách kẻ địch) | Chưa làm |
| DLC Yuffie (INTERmission) | Chưa làm |

## Cách đọc

- **Từng bước** (mặc định): mỗi lần hiện một bước. Chuyển bằng phím ← →, nút "Bước trước/tiếp", mục lục bên trái (máy tính) hoặc thanh dưới cùng (điện thoại). Liên kết dạng `/chuong/3/#noisy-neighbours` mở thẳng một bước.
- **Cả chương**: cuộn liền như một bài viết. Đổi chế độ ở nút phía trên danh sách bước.
- Ô **Xong** ở mỗi bước (hoặc phím X) lưu tiến độ trong trình duyệt. Nhiệm vụ phụ (`S1, S2...`) đếm riêng, không ảnh hưởng tiến độ cốt truyện. Trang chủ nhớ bước đang đọc dở.
- Tắt JavaScript thì mọi bước đều hiện đầy đủ. Giao diện sáng/tối theo hệ thống, đổi tay được. Tôn trọng `prefers-reduced-motion`. Không có công cụ theo dõi.

## Cấu trúc

- `chapters/NN-*.md`: nội dung từng chương (nguồn), Markdown mở rộng, định dạng mô tả bên dưới.
- `images/chNN/` và `images/manifest.json`: hình lấy từ bài gốc, ghép đúng mục theo tên mục tiêu. `images/chNN/t/` là ảnh thu nhỏ do `make-thumbs.py` tạo (cần Pillow); chạy lại khi thêm ảnh mới.
- `site/`: mã nguồn trang web. Next.js (xuất tĩnh) + Tailwind CSS v4 + các component chép theo kiểu shadcn/ui. React chỉ chạy lúc build để sinh HTML; bước postbuild gỡ toàn bộ runtime React/Next, nên trình duyệt chỉ nhận HTML, CSS, font và một file JavaScript thuần nhỏ (`site/client/main.ts`).
- Ở gốc repo: `index.html`, `chuong/`, `_next/`, `assets/`, `404.html`, `chapter-NN.html` (chuyển hướng từ đường dẫn cũ) là **bản đã dựng**, GitHub Pages phát hành từ nhánh `main`, thư mục gốc. Đừng sửa tay các file này.

## Dựng lại

```bash
cd site
npm ci
npm run build          # next build, rồi postbuild: đóng gói JS, gỡ runtime, ghi CSP kèm hash
npm run publish:root   # chép site/out ra gốc repo
```

Xem thử trên máy: tạo một thư mục chứa liên kết `Final-Fantasy-7-VII-Remake-Walkthrough` trỏ tới gốc repo (site dùng basePath của GitHub Pages), chạy `python3 -m http.server` trong thư mục đó và mở `http://127.0.0.1:8000/Final-Fantasy-7-VII-Remake-Walkthrough/`.

## Định dạng chương

```
---
number: 3
title: Home Sweet Slum
area: Sector 7 Slums
summary: Một câu tóm tắt chương.
source: https://www.powerpyx.com/...
hero: 4              (tùy chọn) số ảnh làm ảnh đầu trang; mặc định là ảnh đầu tiên
---
Đoạn dẫn nhập (tùy chọn).

## Tên mục tiêu trong game        <- mỗi ## là một bước
Đoạn văn, **đậm**, `code`, [chữ](url), nút bấm {□} {R1}.
- gạch đầu dòng
1. mục có thứ tự
   - mục con thụt lề

:::chest 2 Potions               <- rương
Vị trí rương.
:::
```

Các khối khác: `pickup` (cầu Materia), `boss` (dòng đầu `weak: A, B` thành chip điểm yếu), `tip`, `warn`, `hard` (mẹo Hard Mode), `reward` (phần thưởng, vào bảng tổng hợp vật phẩm). Nhiệm vụ phụ là bước có tiêu đề `## Side Quest: Tên`, mở đầu bằng `:::quest Người giao · Địa điểm` kèm danh sách `Mở khóa:` / `Thưởng:`. Hình ảnh lấy từ `images/manifest.json` theo tên mục tiêu (không ghi trong `.md`).

## Quy ước

Tên mục tiêu, vật phẩm, kẻ địch, kỹ năng và Materia giữ nguyên tiếng Anh như trong game. Nút bấm theo tay cầm PlayStation (□ ✕ ○ △). Phần lời hướng dẫn được viết lại gọn bằng tiếng Việt, không dịch từng chữ.
