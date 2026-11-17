---
name: docs
description: Cập nhật tài liệu (docs/rules, docs/notes, docs/guides, docs/architecture.md, docs/known-issues.md, khối tài liệu trong code) khi code đổi khiến tài liệu lệch thực tế, hoặc quyết định có nên viết rule mới không. Dùng sau khi sửa code có liên quan tới một rule đã có, hoặc khi phát hiện tài liệu nói sai so với code.
---

# Docs — giữ tài liệu đồng bộ với code thật

Mục lục duy nhất và ranh giới ba loại tài liệu (rule / note / khối tài liệu trong code) cùng hướng dẫn từng bước
(`docs/guides/`): `docs/README.md`. Luật khi nào tạo / sửa: `docs/rules/foundations/documentation-management.md`.
Skill này là quy trình thao tác.

Nhóm rule hiện có (`docs/rules/<nhóm>/`): `foundations` · `structure` · `data` · `interaction` · `styling` · `display` · `i18n` · `seo`.
Hướng dẫn: `guides/app-layer.md` (src/app, route, guard, phân hệ) · `guides/i18n.md` (chuỗi, ngôn ngữ) · `guides/seo.md` (metadata,
sitemap, JSON-LD).

## Khi nào chạy

1. Vừa sửa code mà rule / note / guide nhắc tới tên hàm / component / đường dẫn liên quan (vd đổi chữ ký
   `useChartMetrics` → `chart-conventions.md` có ví dụ dùng nó; sửa `src/app` → `docs/guides/app-layer.md`; sửa
   `core/i18n` / `src/messages` → `rules/i18n/i18n.md` + `guides/i18n.md`; sửa `core/seo` / `PUBLIC_ROUTES` →
   `rules/seo/seo.md` + `guides/seo.md`; đổi ranh giới `'use client'` → `rules/structure/server-client-boundary.md`).
2. Nghi một tài liệu đang nói sai so với code hiện tại.
3. Xong một pattern mới ĐỦ LỚN và LẶP LẠI để đáng có rule riêng.

## Cập nhật tài liệu đã có

1. `Grep` tên hàm / component / đường dẫn được nhắc trong `src/` — xác nhận còn tồn tại, đúng tên, đúng chữ ký.
2. Lệch → sửa TRỰC TIẾP đoạn lệch ở file nguồn của chủ đề đó (mỗi chủ đề một nguồn — bảng nguồn ở
   `documentation-management.md §1`); nơi khác chỉ trỏ tới, không chép.
3. Claim tuyệt đối ("luôn", "không file nào…") → kiểm bằng `Grep` / `Glob` trước khi tin.
4. Đổi tên / dời file tài liệu → sửa dòng ở `docs/README.md` và grep đường cũ trong `docs/`, `README.md`, `.claude/`,
   comment `src/` (`Lý do thiết kế: notes/…`).
5. Không ghi lịch sử ("trước đây…", "đã đổi tên từ…") — lịch sử thuộc commit.
6. Gặp từ khoá của stack cũ (Vite, `index.html`, `VITE_*`, React Router, `lazyPage`, module registry `*.routes.ts`,
   `app/router`, `tsc -b`, `madge`, `check:bundle`, `AuthGuard` / `GuestGuard` / `PermissionGuard`, `app/bootstrap.ts`,
   `<Link to=>`) → đó là tài liệu lệch: sửa theo code Next hiện tại (`NEXT_PUBLIC_*`, `AuthGate`, `src/app/_providers/bootstrap.ts`, `href`…).

## Viết rule mới

1. Tra `docs/README.md` — rule nào đã cover chưa? Không tạo trùng.
2. Đọc code thật của pattern (file có khối tài liệu sẵn thường đã có 80% nội dung).
3. Cấu trúc quen thuộc: câu mở nói nguyên tắc → bảng tra nhanh → ví dụ chép từ file thật (ghi đường dẫn) → checklist
   (lệnh kiểm chỉ một dòng `npm run check` xanh) → "Liên quan".
4. Thêm MỘT dòng vào `docs/README.md` (đúng nhóm + bảng "Sắp làm gì → đọc gì" nếu cần). Không thêm index ở nơi khác.
5. Luật đo được → đề xuất cổng máy (test luật / rule ESLint / `check:i18n`) theo `quality-gates.md §6`; luật mới ảnh hưởng review →
   thêm một dòng vào `.claude/agents/code-reviewer.md`.

## Không làm

- Không viết file `.md` cho một quyết định nhất thời (dùng commit / PR).
- Không chạy Prettier trên `.md`; không format lại cả file chỉ để đổi vài dòng.
