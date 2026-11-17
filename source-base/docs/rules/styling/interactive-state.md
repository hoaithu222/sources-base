# Interactive State — rê · nhấn · focus bàn phím · chuyển tiếp

> Quy tắc cho phần tử bấm được. Máy giữ: `tests/policy/styling/interactive-state.test.ts`.

---

## 1. Rê và nhấn tô TINT màu chủ đạo, không xám trung tính

- Phần tử trong suốt (hàng, mục, nút icon, đoạn chưa chọn, tiêu đề cột sắp xếp) rê = `hover:bg-bg-nav-hover`, nhấn =
  `active:bg-bg-nav-active` — `primary` nhạt (sáng 10 / 18%, tối 14 / 24%). Token đổi theo màu chủ đạo và theo theme, không viết hex.
- `hover:bg-bg-subtle` / `hover:bg-bg-pressed` chỉ dành cho bề mặt có nền riêng (ô nhập `filled`, skin `neutral` của `Button`).
  Callout ✕, `SegmentToggle`, tiêu đề cột `Table`, `FormSection` đã chuyển sang tint (test giữ).
- Chữ `fg-heading` / `fg-subheading` / `fg-body` ≥ 7:1 trên lớp tint ở cả hai theme; `fg-muted` chỉ ~4.4:1 ngay cả khi nghỉ —
  đừng đặt thông tin quan trọng một mình ở đó.

## 2. Rê chỉ khi thiết bị thật sự rê được

Tailwind 4 bọc `hover:` trong `@media (hover: hover)` (đã kiểm CSS sinh ra) nên màn cảm ứng KHÔNG kẹt hover sau khi chạm;
`active:` không bọc nên ngón tay vẫn có phản hồi nhấn. CSS viết tay có `:hover` phải tự bọc (`ipad-responsive.md §7`).

## 3. Vòng focus và phần tử khoá

- Vòng focus là `focus-visible:ring-2 focus-visible:ring-ring-focus` — chuột bấm không hiện, Tab thì hiện; không dùng `focus:` cho ring.
- Hàng nằm trong vùng `overflow-hidden` hoặc dải cuộn dùng `ring-inset` (vòng nằm TRONG phần tử, không bị cắt).
- Nút khoá không đổi khi rê: viết `enabled:hover:`. `enabled:` KHÔNG khớp `<a>` / `<div>`.

## 4. ⛔ Bẫy chuyển tiếp của Tailwind 4

`translate-*` · `rotate-*` · `scale-*` ghi vào thuộc tính CSS RIÊNG (`translate` · `rotate` · `scale`), nên
`transition-[transform]` không bắt được chúng: núm công tắc nhảy cóc, mũi tên xổ xoay giật. Viết `transition-[translate,…]` ·
`[rotate,…]` · `[scale,…]` hoặc `transition-transform` (bao cả bốn). Test chặn `transition-[…transform…]` (ngoại lệ: mặt trượt
`SegmentToggle` ghi `style.transform` trực tiếp).

## 5. Checklist

- [ ] Rê / nhấn của phần tử trong suốt là tint `bg-nav-hover` / `bg-nav-active`, không `bg-subtle` / `bg-pressed`
- [ ] Vòng focus là `focus-visible`; phần tử khoá không đổi khi rê
- [ ] Chuyển tiếp nhắm đúng thuộc tính (`translate` / `rotate` / `scale`), có `motion-reduce:transition-none`
- [ ] Xem hai theme + Tab bằng bàn phím trên `/demo`
