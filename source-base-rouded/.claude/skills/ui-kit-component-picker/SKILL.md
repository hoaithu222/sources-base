---
name: ui-kit-component-picker
description: Xác định component UI kit (@/shared/ui) đúng cho một nhu cầu UI cụ thể theo nguyên tắc 3R (Reuse/Extend/Create). Dùng khi cần viết JSX mới, thêm field vào form, dựng một màn hình mới, hoặc phân vân "component nào cho tình huống này" trong base-project.
---

# UI kit Component Picker

base-project có một design system duy nhất: **UI kit** (`src/shared/ui/`, import `@/shared/ui`). Skill này là quy
trình quyết định "cần UI X → dùng component nào" — không đoán, không tự viết raw HTML. Skill KHÔNG chép bảng
component: nguồn thật là catalog trong `docs/rules/structure/reuse-first.md`.

## Quy trình

1. **Mô tả nhu cầu bằng 1 câu** ("cần chọn một ngày", "cần bảng KPI dày cho dashboard", "cần xác nhận xoá").
2. **Tra theo thứ tự, dừng ở bước đầu tiên trả lời được:**
   - `docs/rules/structure/reuse-first.md` §1 "HTML → UI kit Decision Table" — nhu cầu → component.
   - `docs/rules/structure/reuse-first.md` §3 "UI kit Catalog" — đủ mọi component theo nhóm, kèm props chính;
     §3.8 widget (`@/shared/widgets/<widget>`), §4 hook, §5 util.
   - Màn mẫu đã ghép sẵn: `src/features/demo/composed/` (`/demo/ghep`) và `src/features/demo/dashboard/`
     (`/demo/tong-quan`) — xem component nào được dùng cho khối tương tự.
   - Nghi bảng chưa cập nhật → `Grep` / `Glob` thẳng `src/shared/ui/**` theo khái niệm ("gauge", "ranking") trước
     khi kết luận "chưa có".
3. **Áp dụng 3R:**
   - **REUSE** — có component đúng concept → dùng thẳng; đọc props qua khối tài liệu ngay trên component (rê chuột
     lên `<Xxx` trong VS Code).
   - **EXTEND** — gần giống nhưng thiếu một variant / size / skin → thêm khoá vào union của trục đó rồi vào bảng
     `*_CLASSES` (`tsc` báo ô còn thiếu). KHÔNG fork file (`ButtonV2.tsx`), KHÔNG component riêng cho từng màu
     (`BlueBadge`) — dùng prop `color` / `variant`.
   - **CREATE** — chỉ khi không trùng concept với BẤT KỲ component nào → `docs/rules/structure/ui-kit-architecture.md`
     §3 (đặt ở nhóm nào) + §9 (checklist), `docs/rules/structure/component-structure.md` (thứ tự file, khối tài liệu).
4. **Chỉ là khung flex / grid không có hành vi UI** → `<div>/<span>/<section>` raw là OK (`reuse-first.md` §2).

## Sau khi chọn xong

- Token màu / chữ / icon theo `docs/rules/styling/color-system.md` · `font-system.md` · `icon-conventions.md` —
  chọn đúng component không có nghĩa được hardcode style bên trong nó. className override chỉ qua `cn()`.
- Vừa EXTEND / CREATE → cập nhật dòng catalog trong `reuse-first.md §3` (và bảng §2 của `ui-kit-architecture.md`).
