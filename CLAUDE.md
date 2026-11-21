# CLAUDE.md — ngữ cảnh dự án cho AI

Site hướng dẫn Final Fantasy VII Remake **tiếng Việt, không chính thức**, viết lại từ loạt bài của PowerPyx. Người dùng là solo founder người Việt: trả lời tiếng Việt, ngắn gọn.

## Cấu trúc (mỗi thứ một chỗ)

- `chapters/NN-*.md`: **nguồn nội dung**. Định dạng ở `README.md`. Đây là nơi sửa nội dung.
- `images/chNN/MM.jpg` + `images/manifest.json`: hình gốc, gắn vào bước theo tên mục tiêu. `images/chNN/t/`: ảnh thu nhỏ do `make-thumbs.py` sinh. Không xóa ảnh.
- `site/`: **nguồn giao diện** (Next.js xuất tĩnh + Tailwind v4 + component kiểu shadcn). `site/client/main.ts` là JS duy nhất chạy trên trình duyệt (TypeScript thuần, không React).
- **Đã sinh, KHÔNG sửa tay:** `index.html`, `404.html`, `chuong/`, `_next/`, `assets/`, `chapter-NN.html`, `robots.txt`, `.nojekyll` ở gốc repo. Chúng do `npm run publish:root` ghi đè.

## Lệnh

```bash
cd site
npm ci
npm run check          # tsc + validate-content (chạy TRƯỚC mỗi commit)
npm run build          # next build + postbuild (gỡ runtime React, ghi CSP hash)
npm run publish:root   # chép site/out ra gốc repo
```

Commit nguồn và bản đã dựng **cùng lúc** để Pages luôn khớp mã nguồn. GitHub Pages phát hành từ `main`, thư mục gốc.

## Quy tắc không được phá

- **Ghi nguồn:** dải "Nguồn" trên mọi trang, chân trang, và `source:` trong front matter mỗi chương là bắt buộc (validate-content kiểm). Không gỡ.
- **CSP chặt** (`script-src 'self'` + hash). Cấm: script/handler/`style=` nội tuyến, script hay font từ bên thứ ba, analytics, bất kỳ thu thập dữ liệu người dùng nào. Mọi liên kết ngoài có `rel="noopener noreferrer"`.
- **Không có bí mật trong repo.** Không commit `.env`, khóa API, token. Nếu lộ: thu hồi khóa trước, xóa commit không đủ.
- **Tiến độ người đọc nằm trong localStorage** (`ff7r-vi-progress:<khóa chương>`, danh sách id bước). id bước = slug của tiêu đề `##`. Đổi tên tiêu đề = làm mất tick của bước đó: chỉ đổi khi cần, và ghi vào commit.
- **Khả năng truy cập:** chữ đạt tương phản ≥4.5:1 ở cả hai theme, vùng chạm ≥44px, tôn trọng `prefers-reduced-motion`, đọc đủ nội dung khi tắt JS.
- **Mỗi màn hình một nút chính** (màu hổ phách). Nút phụ dạng viền. Giữ một bộ bo góc và một bộ màu.
- Tên mục tiêu, vật phẩm, kẻ địch, kỹ năng giữ nguyên tiếng Anh như trong game. Nút bấm theo tay cầm PlayStation (□ ✕ ○ △).

## Cách làm việc (thực hành an toàn)

1. **Mỗi lần một việc.** Commit nhỏ, thông điệp theo conventional commits, trước khi bắt đầu việc rủi ro.
2. **Đọc lại trước khi chấp nhận** mã/nội dung AI viết; chạy `npm run check`, dựng thử và xem trên trình duyệt thật.
3. **Điểm quay lại:** nhánh `archive/v1-python-build` giữ bản trước khi thiết kế lại. Server git của phiên cloud chặn đẩy tag (403), nên dùng nhánh `archive/...` làm điểm lưu.
4. **Lệnh phá hủy** (`rm -rf`, `git stash`, `git reset --hard`, xóa nhánh): xem kỹ đích trước khi chạy, không chạy trên thứ không phải do mình sinh ra.
5. Việc rủi ro hoặc lớn: làm trên nhánh, qua kiểm tra rồi mới gộp vào `main`.

## Môi trường cloud

- Một số lệnh Bash bị hook chặn nếu chứa chữ `node_modules` hoặc `__pycache__`: dùng công cụ Read/Glob thay thế.
- Host được phép ra ngoài nằm ở cấu hình environment, không thêm host tùy ý.
- Xem trước: tạo thư mục có liên kết `Final-Fantasy-7-VII-Remake-Walkthrough` trỏ tới gốc repo (site dùng basePath), rồi `python3 -m http.server`. **Tắt server sau khi dùng.**

## Cảnh báo bảo mật đã biết và chấp nhận

`npm audit` báo 2 mục ở `next`/`postcss` (image optimizer, Edge runtime, server tự host, PostCSS xử lý CSS do kẻ tấn công kiểm soát). Dự án là site tĩnh, không server, CSS tự viết, nên không khai thác được. Cách sửa duy nhất là nâng Next 16 (đổi lớn). Xem lại khi nâng bản chính.
