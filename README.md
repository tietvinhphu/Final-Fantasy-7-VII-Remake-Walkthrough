# Final Fantasy VII Remake — Hướng dẫn tiếng Việt

Hướng dẫn tiếng Việt **không chính thức**, dùng để tra cứu khi chơi, viết lại từ loạt hướng dẫn Final Fantasy VII Remake của **PowerPyx** (tác giả Gage): <https://www.powerpyx.com/guide/final-fantasy-vii-remake/>.

**Nguồn và bản quyền:** nội dung gốc và hình ảnh thuộc bản quyền PowerPyx. Mỗi trang có liên kết về bài gốc. Nếu chủ sở hữu yêu cầu gỡ, nội dung sẽ được gỡ.

**Trang web:** https://tietvinhphu.github.io/Final-Fantasy-7-VII-Remake-Walkthrough/

## Tiến độ

| Phần | Trạng thái |
| --- | --- |
| Cốt truyện, Chương 1–18 (rương, vật phẩm, boss, mẹo Hard Mode, hình minh họa) | Xong |
| Nhiệm vụ phụ (26 nhiệm vụ, sẽ gộp vào đúng chương) | Chưa làm |
| Sưu tầm và trang bị (Materia, Armor, Accessory, Summon, Music Disc...) | Chưa làm |
| Boss và hệ thống chiến đấu (Stagger, Hard Mode, Fort Condor, danh sách kẻ địch) | Chưa làm |
| DLC Yuffie (INTERmission) | Chưa làm |

## Giao diện

- Timeline từng bước với đường sáng chạy theo thanh cuộn, nút bước bật sáng khi tới.
- Thẻ **rương** (hổ phách), **vật phẩm nhặt** (tím), **boss** (đỏ, kèm điểm yếu), **mẹo** và **Hard Mode**.
- Mỗi bước có ô "Xong" lưu trong trình duyệt, kèm thanh tiến độ chương và vòng tiến độ ở trang chủ.
- Hình minh họa bấm để xem lớn (lightbox, phím mũi tên và vuốt trên điện thoại). Lưới hiển thị ảnh thu nhỏ, bấm mới tải ảnh gốc.
- Mục lục dính trên cùng khi cuộn trên điện thoại và tự cuộn tới mục đang đọc; có liên kết "Bỏ qua, tới nội dung" cho người dùng bàn phím.
- Giao diện sáng/tối (chữ đạt tương phản 4.5:1 ở cả hai), tôn trọng `prefers-reduced-motion`, dùng được trên điện thoại. Hiệu ứng tự chạy chỉ kéo dài tối đa 5 giây, không lặp vô hạn.
- Không dùng thư viện hay font ngoài, không có công cụ theo dõi.

## Cấu trúc và cách dựng lại

- `chapters/NN-*.md`: nội dung từng chương (nguồn). Định dạng mô tả ở đầu `build.py`.
- `images/chNN/` và `images/manifest.json`: hình lấy từ bài gốc, ghép đúng mục theo tên mục tiêu. `images/chNN/t/` là ảnh thu nhỏ (rộng 560px) do `make-thumbs.py` tạo (cần Pillow); chạy lại khi thêm ảnh mới.
- `web-assets/`: `style.css`, `app.js`, `robots.txt`.
- `build.py`: chuyển Markdown thành HTML tĩnh ở gốc repo, chỉ dùng thư viện chuẩn của Python. Chạy `python3 build.py`.
- `index.html`, `chapter-NN.html`, `style.css`, `app.js`: trang đã dựng, GitHub Pages phát hành từ gốc repo.

Front matter của chương có thêm khóa tùy chọn `hero: N` để chọn ảnh số N làm ảnh nền đầu trang (mặc định là ảnh đầu tiên; nên tránh ảnh màn hình thông tin kẻ địch).

Xem thử trên máy: `python3 -m http.server 8765` ở thư mục gốc, rồi mở `http://127.0.0.1:8765/`.

## Quy ước

Tên mục tiêu, vật phẩm, kẻ địch, kỹ năng và Materia giữ nguyên tiếng Anh như trong game. Nút bấm theo tay cầm PlayStation (□ ✕ ○ △). Phần lời hướng dẫn được viết lại gọn bằng tiếng Việt, không dịch từng chữ.
