---
name: fix
description: Sửa bug / lỗi type / lỗi lint / CI / test đỏ / hành vi lạ / chậm trong base-project một cách có hệ thống — điều tra gốc rễ trước, không vá triệu chứng; kèm kỹ thuật thoát bế tắc khi đã thử vài cách không tiến triển. Dùng khi có một lỗi cụ thể cần sửa hoặc đang loanh quanh chưa tìm ra nguyên nhân.
---

# Fix — Scout → Diagnose → Fix → Verify + Prevent

**Không đề xuất sửa trước khi điều tra xong gốc rễ.** "Chắc là do X, thử sửa X xem" không phải điều tra — đó là đoán.
Vá triệu chứng (che lỗi mà không hiểu vì sao xảy ra) tính là THẤT BẠI của quy trình này.

## 0. Chọn chế độ

| Trường hợp | Chế độ |
|---|---|
| Lỗi type / lint rõ ràng một dòng | **quick** — sửa thẳng, kiểm bằng `npm run typecheck` / `npm run lint` |
| Bug nghiệp vụ, chưa rõ nguyên nhân | **auto** (mặc định) — đủ các bước dưới |
| Bug nhạy cảm (auth, mất dữ liệu, bảo mật) | **review** — dừng xác nhận với user sau mỗi bước lớn |
| Nhiều lỗi độc lập | **parallel** — xử lý từng lỗi riêng, không gộp một commit lớn |

Trước khi sửa: xem `docs/known-issues.md` — hiện tượng có thể đã được ghi kèm hướng / quyết định chờ chủ repo.

## 1. Scout — định vị

File nào, phụ thuộc nào, test nào đang (hoặc KHÔNG) phủ vùng lỗi; `git log -p --follow <file>` có thay đổi nào gần
thời điểm lỗi xuất hiện không.

## 2. Diagnose — tìm gốc rễ

1. **Tái hiện** — chạy lệnh / thao tác gây lỗi, đọc log / console / network thật, ghi output GỐC làm mốc so sánh.
   Chưa tái hiện được thì chưa sang bước sau.
2. **Trace ngược tới nguồn** — lỗi lộ ở component A không có nghĩa lỗi nằm ở A: lần theo luồng dữ liệu tới nơi giá
   trị sai XUẤT HIỆN LẦN ĐẦU (field hiện `NaN` → thường ở tầng parse / format, không ở JSX).
3. **Kiểm theo tầng:** đầu vào (API / người dùng) → logic (biến đổi, tính toán) → môi trường (dev vs build,
   `VITE_APP_MODE`, StrictMode chạy effect hai lần ở dev) → công cụ quan sát (log có đặt đúng chỗ không).
4. **Kiểm giả thuyết bằng cách nhỏ nhất** (log tạm, test cô lập) — KHÔNG sửa code chính rồi "thử xem hết chưa".
5. **Tìm cùng pattern ở chỗ khác** — vd một ô tìm kiếm quên `useImeSafeSearchInput` → grep xem còn chỗ nào quên.

≥ 2 giả thuyết đều sai → dừng, trình bày lại vấn đề với user thay vì thử giả thuyết thứ 3 một mình.

## 3. Đánh giá độ phức tạp

Đơn giản (1 file, rõ nguyên nhân) / trung bình (vài file) / phức tạp (đụng kiến trúc → bàn với user trước, có thể
dùng skill `brainstorm`).

## 4. Sửa

Sửa tối thiểu, tại ĐÚNG NGUỒN, theo pattern có sẵn (UI kit, `docs/rules/`). Không nhân dịp "dọn luôn" phần không
liên quan.

## 5. Verify + Prevent (bắt buộc)

- Chạy lại CHÍNH XÁC lệnh / thao tác tái hiện ban đầu, so với mốc ở bước 2 — đọc output thật, không suy luận.
- Thêm regression test khi hợp lý: test phải ĐỎ khi bỏ bản sửa, XANH khi có (skill `web-testing`).
- Sửa hiển thị (`.tsx` / `.css`): chạy `npm run dev`, xem trang thật + console không có lỗi mới.
- `npm run check` xanh (`docs/rules/foundations/quality-gates.md`).

## 6. Kết thúc

Báo: nguyên nhân gốc, sửa ở đâu, kiểm bằng gì. Đề xuất commit theo skill `git` nếu user muốn.

## Công cụ điều tra

| Cần gì | Dùng |
|---|---|
| Lỗi type | `npm run typecheck` — đọc HẾT danh sách (⛔ không `npx tsc --noEmit`: kiểm 0 file) |
| Lint | `npm run lint` |
| Test một file / một tên | `npm run test:unit -- <tên>` · smoke: `npm run test:smoke` |
| Import vòng · gói chưa khai | `npm run check:cycles` · `npm run check:imports` |
| File / export thừa | `npm run check:unused-files` · `npm run report:unused-exports` |
| Bundle phình | `npm run build && npm run check:bundle` |
| UI có đúng không | `npm run dev`, xem trực tiếp — đừng kết luận từ code khi xem thật được |

## Red flags — tự bắt mình

| Câu tự nhủ | Nghĩa thật |
|---|---|
| "Thấy vấn đề rồi, sửa luôn" / "Chắc là do X" | Thấy TRIỆU CHỨNG ≠ hiểu gốc rễ — kiểm giả thuyết trước |
| "Sửa tạm đã, điều tra sau" | Quay lại bước 2 |
| "Thử đổi X xem sao" | Đang đoán, chưa có giả thuyết đã kiểm |
| "Test pass rồi, xong" / "Chắc giờ ổn rồi" | Chưa chạy lại tái hiện; chưa có guard chặn lớp bug này tái diễn |

## Khi bế tắc (đã sửa cùng vùng ≥ 3 lần, giải pháp phình dần, không giải thích được vì sao cách hiện tại đúng)

1. **Thu nhỏ** tới mức tối thiểu còn tái hiện được — phần còn lại thường chỉ thẳng gốc rễ.
2. **Nói lại vấn đề bằng 1–2 câu, không nhìn code** — không nói được là chưa hiểu, quay lại bước 2.
3. **Đảo câu hỏi:** "điều kiện nào khiến X KHÔNG chạy" thay vì "làm sao cho X chạy".
4. **Tìm pattern có sẵn** — grep `src/` và `docs/rules/` trước khi nghĩ giải pháp mới.
5. **Hỏi lại đúng bài toán** — có cách đơn giản hơn đạt cùng mục tiêu mà bỏ qua chỗ đang kẹt (YAGNI / KISS,
   `docs/rules/foundations/development-rules.md`)?
6. **Dừng và hỏi user** — tóm tắt đã thử gì / kết quả gì, thay vì thử lần thứ 4 cùng hướng; nghi giả định nền tảng.

## Liên quan

`brainstorm` (chọn giữa nhiều phương án) · `web-testing` (regression test) · `ui-kit-component-picker` (sửa xong cần
đổi component nào) · agent `code-reviewer` (rà lại trước khi coi là xong).
