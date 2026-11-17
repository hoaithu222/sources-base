---
name: new-feature
description: Scaffold một phân hệ/feature mới trong base-project (Next.js App Router) — folder feature + thư mục route + khai menu `NAV_MODULES` + messages vi/en + quyền. Dùng khi bắt đầu một tính năng/màn hình mới từ đầu (không phải sửa cái có sẵn).
---

# New Feature — quy trình dựng một phân hệ mới

Nối các rule (`docs/rules/structure/feature-structure.md`, `routing-conventions.md`, `server-client-boundary.md`) và
`docs/guides/app-layer.md` (mục thêm phân hệ) thành một thứ tự thao tác. Chi tiết luật nằm ở đó — skill này không chép lại.
Route do HỆ THỐNG FILE của Next quyết định; `navigation.config.ts` chỉ MÔ TẢ cho menu — thiếu một trong hai là lệch.

## Bước 1 — Tạo folder feature

`src/features/{feature-id}/` theo cây ở `feature-structure.md`. Chỉ tạo folder mối quan tâm đang dùng:

```
src/features/{feature-id}/
  views/       {Feature}View.tsx — nội dung trang (Client Component nếu có form / query / handler)
  api/         {feature}.api.ts (hàm thuần + readData) · {feature}.types.ts
  service/     {feature}.queries.ts (TanStack Query, query key đủ param)
  schemas/     {feature}.schema.ts (Zod; chữ lỗi qua next-intl)
  components/  phần con của view
  index.ts     CHỈ xuất thứ nơi NGOÀI feature dùng (thường là View)
```

Các folder mối quan tâm KHÔNG có `index.ts` — import thẳng file. `{feature-id}` là `kebab-case`, khớp `id` ở bước 3. Feature
lớn (≥ 3 màn độc lập hoặc > ~20 file) → tính năng con. Mẫu thật: `src/features/auth/`.

## Bước 2 — Route (mỏng) dưới `src/app`

`src/app/[locale]/(workspace)/(app)/{feature-id}/page.tsx` — Server Component, chỉ metadata + ghép view:

```tsx
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { {Feature}View } from '@/features/{feature-id}';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/{feature-id}'>) =>
  generatePageMetadata({ params, key: '{featureId}', path: PATHS.{FEATURE_ID} });

export default function {Feature}Page() {
  return <{Feature}View />;
}
```

- Route con: thư mục lồng (`{feature-id}/create/page.tsx`); tham số động `[id]` → mục "tham số động" ở `guides/app-layer.md`.
  Phân hệ chỉ có màn hình trong `(app)` nên thừa hưởng `AuthGate` + `AppShellLayout` + `loading.tsx` / `error.tsx` của nhóm.
- Quyền của cả phân hệ: `{feature-id}/layout.tsx` bọc `<PermissionGate permission={{ resource: '{feature-id}' }}>` (Client
  Component, đặt BÊN TRONG `AuthGate`). Quyền thêm cho một màn: `PermissionGate` trong `page.tsx`.
- `useSearchParams` / `useQueryParams` trong view → bọc `<Suspense>` ở `page.tsx`, nếu không route mất SSG.
- `page.tsx` KHÔNG `useState` / handler; không `cookies()` / `headers()`.

## Bước 3 — Khai menu + đường dẫn + chữ

1. `src/shared/constants/paths.constants.ts`: thêm `PATHS.{FEATURE_ID}` và thêm vào `PROTECTED_PATH_PREFIXES` — `proxy.ts` chặn
   người chưa đăng nhập và `robots.txt` đọc từ đây (quên là HTML riêng tư vẫn trả cho khách).
2. `src/app/_navigation/navigation.config.ts` → thêm vào `NAV_MODULES` (key: `id → path → icon → tone → permission → order → screens`):

```ts
const {featureId}Module: NavModuleDef = {
  id: '{featureId}',             // khoá `nav.{featureId}` ở shell.json; cũng là `resource` mặc định khi kiểm quyền
  path: PATHS.{FEATURE_ID},      // KHÔNG tiền tố ngôn ngữ
  icon: 'finance',               // AppIconName — ưu tiên icon VCI (vci-icon-system.md)
  tone: 'primary',               // tông ô AppTile ở Dock / launcher / header
  permission: { resource: '{feature-id}' },   // menu ẩn mục này khi thiếu quyền — GIỮ KHỚP PermissionGate
  screens: [{ id: '{featureId}Home', path: PATHS.{FEATURE_ID} }],
};
export const NAV_MODULES = [ …, {featureId}Module ];   // tắt theo cờ: ...(flag ? [x] : [])
```

3. Chữ — thêm vào **CẢ** `src/messages/vi/` và `src/messages/en/` (thiếu một bên là `tsc` đỏ):
   `shell.json` → `nav.{featureId}` + `nav.{featureId}Home` (`title`, `subtitle` / `description`); `metadata.json` →
   `{featureId}` (`title`, `description` — khoá của `generatePageMetadata`); namespace riêng của feature (`{feature}.json`) → import
   - gắn vào `vi/index.ts` và `en/index.ts`, và thêm vào `CLIENT_NAMESPACES` (`src/core/i18n/messages.ts`) vì view là Client Component.
     Luật + chi tiết: `docs/rules/i18n/i18n.md`, `docs/guides/i18n.md`.

Test luật ở `tests/app/` (`navigation`) đối chiếu path khai ở `NAV_MODULES` ↔ thư mục có `page.tsx`.

## Bước 4 — Trang

Trang chỉ GHÉP: `PageShell` → `TitleScreen` → `Toolbar` → `PageBody` (`docs/rules/structure/page-structure.md`); chọn component cho từng
khối bằng skill `ui-kit-component-picker`. Mọi chữ dùng `useTranslations('{feature}')`; link bằng `Link` của `@/core/i18n`.

## Bước 5 — Form / API

- Form: schema Zod ở `schemas/{feature}.schema.ts`, field text bắt buộc luôn `.trim().min(1)` (`docs/rules/data/form-validation.md`);
  chữ lỗi qua next-intl (mẫu `src/features/auth/schemas/useAuthSchemas.ts`); `useZodForm` + `Form` / `FormItem` / field UI kit.
- API: `api/{feature}.api.ts` (hàm thuần + `readData`) → `service/{feature}.queries.ts` (React Query) — `docs/rules/data/api-patterns.md`.
  Lọc / tìm / trang sống trên URL qua `useQueryParams()`.

## Bước 6 — Verify

- Test: schema / hàm thuần / view chính (skill `web-testing`).
- `npm run check` xanh (`docs/rules/foundations/quality-gates.md`).
- `npm run build` → bảng `Route (app)` có `/{feature-id}` ở dạng tĩnh (`●` / `○`), KHÔNG `ƒ` mới.
- `npm run dev` (http://localhost:3000), vào thẳng `/{feature-id}` và `/en/{feature-id}` — xác nhận route, mục Dock, bảng lệnh
  (Ctrl/⌘+K), tên trang đúng ở cả hai ngôn ngữ; chưa đăng nhập thì bị đưa về `/login?next=…`.

## Ví dụ trong repo

`src/features/auth/` (feature có gọi API thật) · `src/app/[locale]/(workspace)/(app)/demo/page.tsx` + `NAV_MODULES` (phân hệ demo,
bật theo cờ `appConfig.isDemo`) · `src/app/[locale]/(workspace)/(app)/dashboard/page.tsx` (route mỏng + view ở `src/app/_views/`).
