---
name: new-feature
description: Scaffold một phân hệ/feature mới trong base-project — folder feature + đăng ký route qua module registry. Dùng khi bắt đầu một tính năng/màn hình mới từ đầu (không phải sửa cái có sẵn).
---

# New Feature — quy trình dựng một phân hệ mới

Nối hai rule (`docs/rules/structure/feature-structure.md` + `docs/rules/structure/routing-conventions.md`) thành một
thứ tự thao tác. Chi tiết luật nằm ở hai file đó — skill này không chép lại.

## Bước 1 — Tạo folder feature

`src/features/{feature-id}/` theo cây ở `docs/rules/structure/feature-structure.md` (nguồn duy nhất). Chỉ tạo folder
mối quan tâm đang dùng (`pages/`, rồi `api/ service/ schemas/ components/ hooks/` khi cần); các folder này KHÔNG có
`index.ts` — import thẳng file. `index.ts` ở gốc feature chỉ khi có nơi NGOÀI feature dùng. `{feature-id}` là
`kebab-case`, khớp `id` ở bước 2. Feature lớn (≥ 3 màn độc lập hoặc > ~20 file) → tính năng con (§"Chia riêng — ba cấp").

## Bước 2 — Khai `ModuleDef`

Tạo `src/app/router/modules/{feature-id}.routes.ts`. Thứ tự key cố định:
`id → path / index → page / layout → permission → meta → children`.

```ts
import { lazyPage, type ModuleDef } from '../definition';

export const {featureId}Module: ModuleDef = {
  id: '{feature-id}',      // cũng là `resource` mặc định khi kiểm quyền
  path: '/{feature-id}',   // TUYỆT ĐỐI
  meta: {
    title: '...',          // ngắn: menu (Dock), bảng lệnh, tên tab
    subtitle: '...',       // một dòng, hiện ở bảng lệnh
    icon: '...-outline',
    order: 20,
  },
  children: [
    { index: true, page: lazyPage(() => import('@/features/{feature-id}/pages/{Feature}Page')) },
    // route con: path TƯƠNG ĐỐI — { path: ':id', page: lazyPage(…), meta: { title: '…' } }
  ],
};
```

Chưa có trang thật → `{ index: true, page: LazyPlaceholderPage }` (`modules/lazy-placeholder-page.ts`) — giữ chỗ trong
menu, KHÔNG bỏ bước đăng ký. Route con, layout lồng, quyền cộng dồn: `routing-conventions.md` §2–§6.

## Bước 3 — Đăng ký vào registry

Thêm một dòng vào `MODULE_REGISTRY` trong `src/app/router/modules/module-registry.ts`. Route, Dock, bảng lệnh, tên
tab, `PermissionGuard` tự đồng bộ — KHÔNG sửa file nào khác. Khai sai (trùng id / path, path con tuyệt đối,
`landingPath` trỏ sai…) thì `validateModules` ném lỗi ngay lúc dev / test.

## Bước 4 — Trang

Trang chỉ GHÉP: `PageShell` → `TitleScreen` → `Toolbar` → `PageBody` (`docs/rules/structure/page-structure.md`); chọn
component cho từng khối bằng skill `ui-kit-component-picker`.

## Bước 5 — Form / API

- Form: schema Zod ở `schemas/{feature}.schema.ts`, field text bắt buộc luôn `.trim().min(1)`
  (`docs/rules/data/form-validation.md`); `useZodForm` + `Form` / `FormItem` / field UI kit.
- API: `api/{feature}.api.ts` (hàm thuần + `readData`) → `service/{feature}.queries.ts` (React Query, query key đủ
  param) — `docs/rules/data/api-patterns.md`. Lọc / tìm / trang sống trên URL qua `useQueryParams()`.

## Bước 6 — Verify

- `npm run check` xanh (`docs/rules/foundations/quality-gates.md`).
- `npm run dev`, vào thẳng `/{feature-id}` — xác nhận route, mục Dock, bảng lệnh (Ctrl/⌘+K), tên tab đúng; chạy thật
  để thấy, không chỉ tin registry đã khai đúng.

## Ví dụ trong repo

`src/app/router/modules/demo.routes.ts` + `src/features/demo/` (tính năng con) · `src/features/auth/` (feature có gọi
API thật).
